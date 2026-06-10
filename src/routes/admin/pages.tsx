import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages")({ component: PagesAdmin });

type Page = {
  id: string; slug: string; title: string; content: string;
  meta_title: string | null; meta_description: string | null; status: "draft" | "published";
};

function PagesAdmin() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages" as any).select("*").order("title");
      if (error) throw error;
      return (data ?? []) as unknown as Page[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-pages"] });

  const create = async () => {
    const slug = prompt("URL slug (e.g. 'returns')")?.trim();
    if (!slug) return;
    const { data: row, error } = await supabase.from("pages" as any).insert({ slug, title: slug, content: "<p>New page</p>" }).select().single();
    if (error) return toast.error(error.message);
    refresh();
    setEditingId((row as any).id);
  };
  const remove = async (id: string) => {
    if (!confirm("Delete page?")) return;
    const { error } = await supabase.from("pages" as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { refresh(); if (editingId === id) setEditingId(null); }
  };

  const editing = data.find((p) => p.id === editingId);

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Content</p>
          <h1 className="font-serif text-3xl md:text-4xl">Pages</h1>
        </div>
        <button onClick={create} className="btn-primary"><Plus className="w-4 h-4" /> New Page</button>
      </div>
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="border border-hairline bg-card divide-y divide-hairline h-fit">
          {data.map((p) => (
            <div key={p.id} className={`p-3 flex items-center justify-between cursor-pointer hover:bg-surface-dim ${editingId === p.id ? "bg-surface-dim" : ""}`} onClick={() => setEditingId(p.id)}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-ink-soft">/p/{p.slug} · {p.status}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(p.id); }} className="text-ink-soft hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {data.length === 0 && <p className="p-6 text-sm text-ink-soft">No pages.</p>}
        </aside>
        <div>
          {editing ? <PageEditor key={editing.id} page={editing} onSaved={refresh} /> : <p className="text-sm text-ink-soft p-6 border border-hairline">Select a page to edit, or create one.</p>}
        </div>
      </div>
    </div>
  );
}

function PageEditor({ page, onSaved }: { page: Page; onSaved: () => void }) {
  const [p, setP] = useState(page);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setP(page); }, [page]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("pages" as any).update({
      slug: p.slug, title: p.title, content: p.content, meta_title: p.meta_title, meta_description: p.meta_description, status: p.status,
    }).eq("id", p.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    onSaved();
  };

  const inp = "w-full h-11 border border-hairline bg-transparent px-3 text-sm focus:border-primary outline-none";

  return (
    <div className="border border-hairline bg-card p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title"><input className={inp} value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} /></Field>
        <Field label="Slug"><input className={inp} value={p.slug} onChange={(e) => setP({ ...p, slug: e.target.value })} /></Field>
        <Field label="SEO Meta Title"><input className={inp} value={p.meta_title ?? ""} onChange={(e) => setP({ ...p, meta_title: e.target.value })} /></Field>
        <Field label="Status">
          <select className={inp} value={p.status} onChange={(e) => setP({ ...p, status: e.target.value as any })}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
        <Field label="SEO Meta Description" className="md:col-span-2">
          <textarea rows={2} className={`${inp} h-auto py-2`} value={p.meta_description ?? ""} onChange={(e) => setP({ ...p, meta_description: e.target.value })} />
        </Field>
      </div>
      <Field label="Content (HTML — use <h2>, <p>, <ul>, <a href> etc.)">
        <textarea rows={16} className={`${inp} h-auto py-3 font-mono text-xs`} value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} />
      </Field>
      <div className="flex items-center justify-between">
        <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-ink-soft hover:text-ink flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Preview /p/{p.slug}</a>
        <button onClick={save} disabled={busy} className="btn-primary">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Page</button>
      </div>
    </div>
  );
}
function Field({ label, children, className = "" }: any) {
  return <div className={className}><label className="eyebrow block mb-2">{label}</label>{children}</div>;
}
