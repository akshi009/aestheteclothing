import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

type Props = { value: string | null | undefined; onChange: (url: string) => void; label?: string };

export function MediaPicker({ value, onChange, label = "Image" }: Props) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
    toast.success("Uploaded.");
  };

  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="w-40 h-40 object-cover border border-hairline" />
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-hairline rounded-full flex items-center justify-center">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="w-40 h-40 border border-dashed border-hairline flex flex-col items-center justify-center gap-2 text-xs text-ink-soft hover:bg-surface-dim transition"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {busy ? "Uploading..." : "Click to upload"}
        </button>
      )}
      <div className="mt-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste image URL"
          className="w-full h-9 px-3 text-xs border border-hairline bg-transparent focus:border-primary outline-none"
        />
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}
