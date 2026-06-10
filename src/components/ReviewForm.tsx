import { useState } from "react";
import { Star, Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";

export function ReviewForm({
  productId, orderId, userId, authorName, onDone,
}: { productId: string; orderId: string; userId: string; authorName?: string; onDone?: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const up = await Promise.all(Array.from(files).map((f) => uploadMedia(f)));
      setImages((prev) => [...prev, ...up.map((u) => u.url)]);
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    setBusy(false);
  };

  const submit = async () => {
    if (rating < 1) { toast.error("Pick a rating"); return; }
    setBusy(true);
    const { error } = await supabase.from("reviews" as any).insert({
      product_id: productId, order_id: orderId, user_id: userId,
      rating, title: title || null, body: body || null,
      images, author_name: authorName || null,
    } as any);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review submitted — pending approval.");
    onDone?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
              <Star className={`w-6 h-6 ${n <= rating ? "fill-current" : "text-ink-soft"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow mb-2">Title</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
          className="w-full h-11 border border-hairline bg-transparent px-3 text-sm" placeholder="Sums up your experience" />
      </div>
      <div>
        <p className="eyebrow mb-2">Review</p>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={4}
          className="w-full border border-hairline bg-transparent px-3 py-2 text-sm" placeholder="What did you love?" />
      </div>
      <div>
        <p className="eyebrow mb-2">Photos (optional)</p>
        <label className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border border-hairline px-4 h-9 cursor-pointer hover:bg-surface-dim">
          <Upload className="w-4 h-4" /> Add Photos
          <input type="file" accept="image/*" multiple hidden onChange={(e) => onUpload(e.target.files)} />
        </label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((u, i) => (
              <div key={u} className="relative w-20 h-20 border border-hairline">
                <img src={u} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImages((p) => p.filter((_, k) => k !== i))} className="absolute -top-2 -right-2 bg-background border border-hairline p-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={submit} disabled={busy} className="btn-primary justify-center">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit Review
      </button>
    </div>
  );
}
