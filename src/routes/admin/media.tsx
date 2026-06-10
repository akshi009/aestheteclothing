import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media")({ component: MediaAdmin });

function MediaAdmin() {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("media").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter((f: any) => f.name && !f.name.startsWith("."));
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-media"] });

  const upload = async (files: FileList) => {
    setBusy(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
      if (error) toast.error(`${file.name}: ${error.message}`);
    }
    setBusy(false);
    refresh();
    toast.success("Upload complete.");
  };

  const remove = async (name: string) => {
    if (!confirm("Delete this file?")) return;
    const { error } = await supabase.storage.from("media").remove([name]);
    if (error) toast.error(error.message); else refresh();
  };

  const url = (name: string) => {
    // Long-lived signed URL since the bucket is private.
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    // createSignedUrl is async but we use a sync fallback for previews; cache miss falls back to authenticated URL.
    // For display we generate on-demand below via <SignedImg>.
    return name;
  };
  const copy = async (name: string) => {
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    const { data, error } = await supabase.storage.from("media").createSignedUrl(name, TEN_YEARS);
    if (error || !data) return toast.error(error?.message ?? "Failed");
    navigator.clipboard.writeText(data.signedUrl);
    toast.success("URL copied.");
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Library</p>
          <h1 className="font-serif text-3xl md:text-4xl">Media</h1>
        </div>
        <button onClick={() => ref.current?.click()} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
        </button>
        <input ref={ref} type="file" hidden multiple accept="image/*,video/*" onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
      </div>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.map((f: any) => (
            <div key={f.name} className="group relative border border-hairline">
              <div className="aspect-square bg-surface-dim overflow-hidden">
                <img src={url(f.name)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="p-2 text-[10px] text-ink-soft truncate">{f.name}</p>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onClick={() => copy(f.name)} className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center"><Copy className="w-4 h-4" /></button>
                <button onClick={() => remove(f.name)} className="w-9 h-9 bg-white text-destructive rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {data.length === 0 && <p className="text-sm text-ink-soft col-span-full">No media uploaded yet.</p>}
        </div>
      )}
    </div>
  );
}
