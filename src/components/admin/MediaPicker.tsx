import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia, isVideoUrl } from "@/lib/media";

type Props = {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  accept?: "image" | "video" | "any";
};

export function MediaPicker({ value, onChange, label = "Image", accept = "image" }: Props) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const { url } = await uploadMedia(file);
      onChange(url);
      toast.success("Uploaded.");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    }
    setBusy(false);
  };

  const isVid = isVideoUrl(value);

  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      {value ? (
        <div className="relative inline-block">
          {isVid ? (
            <video src={value} className="w-40 h-40 object-cover border border-hairline bg-black" muted playsInline />
          ) : (
            <img src={value} alt="" className="w-40 h-40 object-cover border border-hairline" />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 bg-background border border-hairline rounded-full flex items-center justify-center"
          >
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
          {busy ? "Uploading..." : `Upload ${accept === "video" ? "video" : accept === "any" ? "media" : "image"}`}
        </button>
      )}
      <div className="mt-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste URL"
          className="w-full h-9 px-3 text-xs border border-hairline bg-transparent focus:border-primary outline-none"
        />
      </div>
      <input
        ref={ref}
        type="file"
        accept={acceptAttr}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
