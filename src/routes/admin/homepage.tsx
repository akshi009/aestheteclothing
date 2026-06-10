import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { BLOCK_TYPES, blockTypeMap, type BlockField } from "@/lib/block-types";
import {
  Loader2, Eye, EyeOff, Save, Trash2, Plus, GripVertical, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/admin/homepage")({ component: HomepageAdmin });

type Section = {
  id: string; key: string; type: string;
  title: string | null; subtitle: string | null; body: string | null;
  image_url: string | null; video_url: string | null;
  cta_label: string | null; cta_url: string | null;
  position: number; visible: boolean; extra: Record<string, any>;
};

function HomepageAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections" as any).select("*").order("position");
      if (error) throw error;
      return (data ?? []) as unknown as Section[];
    },
  });

  const [items, setItems] = useState<Section[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => { setItems(data); }, [data]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-homepage-sections"] });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIdx, newIdx).map((s, i) => ({ ...s, position: i }));
    setItems(next);
    const updates = next.map((s) => supabase.from("homepage_sections" as any).update({ position: s.position }).eq("id", s.id));
    await Promise.all(updates);
    refresh();
  };

  const toggleVisible = async (s: Section) => {
    setItems((prev) => prev.map((p) => p.id === s.id ? { ...p, visible: !s.visible } : p));
    const { error } = await supabase.from("homepage_sections" as any).update({ visible: !s.visible }).eq("id", s.id);
    if (error) toast.error(error.message);
    refresh();
  };

  const remove = async (s: Section) => {
    if (!confirm(`Delete "${s.title || blockTypeMap[s.type]?.label || s.key}"?`)) return;
    const { error } = await supabase.from("homepage_sections" as any).delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    refresh();
  };

  const addBlock = async (type: string) => {
    const def = blockTypeMap[type];
    if (!def) return;
    const key = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    const position = items.length;
    const payload = {
      key, type, position, visible: true, extra: {},
      title: def.defaults?.title ?? null, subtitle: def.defaults?.subtitle ?? null,
      body: def.defaults?.body ?? null, cta_label: def.defaults?.cta_label ?? null,
      cta_url: def.defaults?.cta_url ?? null, image_url: null, video_url: null,
    };
    const { data: row, error } = await supabase.from("homepage_sections" as any).insert(payload).select().single();
    if (error) return toast.error(error.message);
    setAdding(false);
    refresh();
    setExpanded((row as any).id);
    toast.success(`Added ${def.label}.`);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Content</p>
          <h1 className="font-serif text-3xl md:text-4xl">Homepage Builder</h1>
          <p className="text-sm text-ink-soft mt-2">Drag to reorder. Click a section to edit. Add unlimited blocks.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Block
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((s) => (
                <SortableRow
                  key={s.id}
                  s={s}
                  expanded={expanded === s.id}
                  onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
                  onVisible={() => toggleVisible(s)}
                  onRemove={() => remove(s)}
                  onSaved={refresh}
                />
              ))}
              {items.length === 0 && (
                <p className="text-sm text-ink-soft border border-dashed border-hairline p-10 text-center">
                  No sections yet. Click "Add Block" to begin.
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {adding && <AddBlockModal onClose={() => setAdding(false)} onPick={addBlock} />}
    </div>
  );
}

function SortableRow({ s, expanded, onToggle, onVisible, onRemove, onSaved }: {
  s: Section; expanded: boolean; onToggle: () => void; onVisible: () => void; onRemove: () => void; onSaved: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const def = blockTypeMap[s.type];

  return (
    <div ref={setNodeRef} style={style} className="border border-hairline bg-card">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-ink-soft hover:text-ink">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">{def?.label ?? s.type}</p>
          <p className="text-sm font-medium truncate">{s.title || <span className="text-ink-soft italic">Untitled</span>}</p>
        </div>
        <button onClick={onVisible} className="flex items-center gap-1.5 text-xs px-3 h-9 border border-hairline hover:bg-surface-dim" title={s.visible ? "Hide" : "Show"}>
          {s.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {s.visible ? "Visible" : "Hidden"}
        </button>
        <button onClick={onRemove} className="w-9 h-9 flex items-center justify-center text-destructive hover:bg-destructive/10 border border-hairline" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
        <button onClick={onToggle} className="w-9 h-9 flex items-center justify-center border border-hairline hover:bg-surface-dim">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && <SectionEditor section={s} onSaved={onSaved} />}
    </div>
  );
}

function SectionEditor({ section, onSaved }: { section: Section; onSaved: () => void }) {
  const [s, setS] = useState(section);
  const [busy, setBusy] = useState(false);
  const def = blockTypeMap[section.type];
  useEffect(() => { setS(section); }, [section]);

  if (!def) return <p className="p-6 text-sm text-ink-soft">Unknown block type: {section.type}</p>;

  const has = (f: BlockField) => def.fields.includes(f);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("homepage_sections" as any).update({
      title: s.title, subtitle: s.subtitle, body: s.body,
      image_url: s.image_url, video_url: s.video_url,
      cta_label: s.cta_label, cta_url: s.cta_url,
      extra: s.extra,
    }).eq("id", s.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    onSaved();
  };

  const inp = "w-full h-11 border border-hairline bg-transparent px-3 text-sm focus:border-primary outline-none";

  return (
    <div className="border-t border-hairline p-6 bg-surface-dim/30">
      <p className="text-xs text-ink-soft mb-5">{def.description}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {has("subtitle") && <Field label="Subtitle / Eyebrow"><input className={inp} value={s.subtitle ?? ""} onChange={(e) => setS({ ...s, subtitle: e.target.value })} /></Field>}
        {has("title") && <Field label="Title"><input className={inp} value={s.title ?? ""} onChange={(e) => setS({ ...s, title: e.target.value })} /></Field>}
        {has("body") && (
          <Field label={def.extraEditor === "html" ? "Body (HTML allowed)" : "Body"} className="md:col-span-2">
            <textarea rows={4} className={`${inp} h-auto py-2`} value={s.body ?? ""} onChange={(e) => setS({ ...s, body: e.target.value })} />
          </Field>
        )}
        {has("cta_label") && <Field label="CTA Label"><input className={inp} value={s.cta_label ?? ""} onChange={(e) => setS({ ...s, cta_label: e.target.value })} /></Field>}
        {has("cta_url") && <Field label="CTA URL"><input className={inp} placeholder="/collections" value={s.cta_url ?? ""} onChange={(e) => setS({ ...s, cta_url: e.target.value })} /></Field>}
        {has("image") && (
          <div className="md:col-span-2">
            <MediaPicker label="Image" value={s.image_url} onChange={(v) => setS({ ...s, image_url: v || null })} />
          </div>
        )}
        {has("video") && (
          <div className="md:col-span-2">
            <MediaPicker label="Video" accept="video" value={s.video_url} onChange={(v) => setS({ ...s, video_url: v || null })} />
          </div>
        )}
        {def.extraEditor === "product_limit" && (
          <Field label="Number of products">
            <input type="number" min={1} max={12} className={inp} value={s.extra?.limit ?? 4}
              onChange={(e) => setS({ ...s, extra: { ...s.extra, limit: Number(e.target.value) || 4 } })} />
          </Field>
        )}
        {def.extraEditor === "testimonials" && (
          <div className="md:col-span-2">
            <TestimonialsEditor value={s.extra?.items ?? []} onChange={(items) => setS({ ...s, extra: { ...s.extra, items } })} />
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </div>
  );
}

function TestimonialsEditor({ value, onChange }: {
  value: Array<{ name: string; review: string; rating?: number; avatar?: string }>;
  onChange: (v: any[]) => void;
}) {
  const update = (i: number, k: string, v: any) => onChange(value.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const add = () => onChange([...value, { name: "", review: "", rating: 5, avatar: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const inp = "w-full h-10 border border-hairline bg-transparent px-3 text-sm focus:border-primary outline-none";

  return (
    <div>
      <label className="eyebrow block mb-3">Testimonials</label>
      <div className="space-y-4">
        {value.map((t, i) => (
          <div key={i} className="border border-hairline p-4 bg-card grid md:grid-cols-2 gap-3 relative">
            <button onClick={() => remove(i)} className="absolute top-2 right-2 text-destructive"><X className="w-4 h-4" /></button>
            <input className={inp} placeholder="Name" value={t.name} onChange={(e) => update(i, "name", e.target.value)} />
            <input type="number" min={1} max={5} className={inp} placeholder="Rating 1-5" value={t.rating ?? 5} onChange={(e) => update(i, "rating", Number(e.target.value))} />
            <textarea rows={2} className={`${inp} h-auto py-2 md:col-span-2`} placeholder="Review text" value={t.review} onChange={(e) => update(i, "review", e.target.value)} />
            <div className="md:col-span-2">
              <MediaPicker label="Avatar" value={t.avatar ?? ""} onChange={(v) => update(i, "avatar", v)} />
            </div>
          </div>
        ))}
        <button onClick={add} className="text-sm flex items-center gap-2 px-3 h-10 border border-dashed border-hairline hover:bg-surface-dim">
          <Plus className="w-4 h-4" /> Add testimonial
        </button>
      </div>
    </div>
  );
}

function AddBlockModal({ onClose, onPick }: { onClose: () => void; onPick: (type: string) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-hairline" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-hairline">
          <h3 className="font-serif text-xl">Add a Block</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-3">
          {BLOCK_TYPES.map((b) => (
            <button key={b.type} onClick={() => onPick(b.type)} className="text-left border border-hairline p-4 hover:bg-surface-dim transition">
              <p className="font-medium text-sm">{b.label}</p>
              <p className="text-xs text-ink-soft mt-1">{b.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: any) {
  return <div className={className}><label className="eyebrow block mb-2">{label}</label>{children}</div>;
}
