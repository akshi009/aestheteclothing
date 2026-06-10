import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Loader2, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/homepage")({ component: HomepageAdmin });

type Section = {
  id: string; key: string; title: string | null; subtitle: string | null;
  body: string | null; image_url: string | null; cta_label: string | null;
  cta_url: string | null; position: number; visible: boolean;
};

const LABELS: Record<string, string> = {
  hero: "Hero Banner",
  heritage: "Heritage Block",
  featured_intro: "Featured Pieces Intro",
  newsletter: "Newsletter Block",
};

function HomepageAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections" as any).select("*").order("position");
      if (error) throw error;
      return (data ?? []) as Section[];
    },
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-10">
        <p className="eyebrow mb-2">Content</p>
        <h1 className="font-serif text-3xl md:text-4xl">Homepage Sections</h1>
        <p className="text-sm text-ink-soft mt-2">Edit the text, images, and CTAs that appear on your storefront homepage.</p>
      </div>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <div className="space-y-6">
          {data.map((s) => <SectionEditor key={s.id} section={s} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-homepage-sections"] })} />)}
        </div>
      )}
    </div>
  );
}

function SectionEditor({ section, onSaved }: { section: Section; onSaved: () => void }) {
  const [s, setS] = useState(section);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setS(section); }, [section]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("homepage_sections" as any).update({
      title: s.title, subtitle: s.subtitle, body: s.body, image_url: s.image_url,
      cta_label: s.cta_label, cta_url: s.cta_url, visible: s.visible, position: s.position,
    }).eq("id", s.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    onSaved();
  };

  const inp = "w-full h-11 border border-hairline bg-transparent px-3 text-sm focus:border-primary outline-none";

  return (
    <section className="border border-hairline bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-ink-soft uppercase tracking-wider">{s.key}</p>
          <h3 className="font-serif text-xl">{LABELS[s.key] ?? s.key}</h3>
        </div>
        <button onClick={() => setS({ ...s, visible: !s.visible })} className="flex items-center gap-2 text-xs px-3 h-9 border border-hairline hover:bg-surface-dim">
          {s.visible ? <><Eye className="w-3.5 h-3.5" /> Visible</> : <><EyeOff className="w-3.5 h-3.5" /> Hidden</>}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Subtitle / Eyebrow"><input className={inp} value={s.subtitle ?? ""} onChange={(e) => setS({ ...s, subtitle: e.target.value })} /></Field>
        <Field label="Title"><input className={inp} value={s.title ?? ""} onChange={(e) => setS({ ...s, title: e.target.value })} /></Field>
        <Field label="Body" className="md:col-span-2"><textarea rows={3} className={`${inp} h-auto py-2`} value={s.body ?? ""} onChange={(e) => setS({ ...s, body: e.target.value })} /></Field>
        <Field label="CTA Label"><input className={inp} value={s.cta_label ?? ""} onChange={(e) => setS({ ...s, cta_label: e.target.value })} /></Field>
        <Field label="CTA URL"><input className={inp} value={s.cta_url ?? ""} onChange={(e) => setS({ ...s, cta_url: e.target.value })} placeholder="/collections" /></Field>
        <div className="md:col-span-2">
          <MediaPicker label="Image" value={s.image_url} onChange={(v) => setS({ ...s, image_url: v || null })} />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </section>
  );
}

function Field({ label, children, className = "" }: any) {
  return <div className={className}><label className="eyebrow block mb-2">{label}</label>{children}</div>;
}
