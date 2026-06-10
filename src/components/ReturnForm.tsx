import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/lib/orders";

const reasons = ["Damaged on arrival", "Wrong item received", "Doesn't match description", "Quality issue", "No longer needed", "Other"];

export function ReturnForm({ order, userId, onDone }: { order: Order; userId: string; onDone?: () => void }) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState(reasons[0]);
  const [comments, setComments] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggle = (item: OrderItem, qty: number) =>
    setSelected((p) => { const n = { ...p }; if (qty <= 0) delete n[item.id]; else n[item.id] = Math.min(qty, item.quantity); return n; });

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const up = await Promise.all(Array.from(files).map((f) => uploadMedia(f)));
      setImages((p) => [...p, ...up.map((u) => u.url)]);
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    setBusy(false);
  };

  const submit = async () => {
    const items = Object.entries(selected).map(([id, qty]) => {
      const it = order.order_items.find((x) => x.id === id)!;
      return { order_item_id: id, name: it.name, quantity: qty };
    });
    if (items.length === 0) { toast.error("Select at least one item"); return; }
    setBusy(true);
    const { error } = await supabase.from("return_requests" as any).insert({
      order_id: order.id, user_id: userId, reason, comments: comments || null, items, images,
    } as any);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Return request submitted.");
    onDone?.();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-3">Items to Return</p>
        <ul className="divide-y divide-hairline border border-hairline">
          {order.order_items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 p-3">
              {it.image_url && <img src={it.image_url} alt="" className="w-12 h-12 object-cover border border-hairline" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{it.name}</p>
                <p className="text-xs text-ink-soft">Qty available: {it.quantity}</p>
              </div>
              <input type="number" min={0} max={it.quantity} value={selected[it.id] ?? 0}
                onChange={(e) => toggle(it, Number(e.target.value) || 0)}
                className="w-16 h-9 border border-hairline bg-transparent px-2 text-sm" />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-2">Reason</p>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 border border-hairline bg-transparent px-3 text-sm">
          {reasons.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <p className="eyebrow mb-2">Additional Comments</p>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} maxLength={1500} rows={3}
          className="w-full border border-hairline bg-transparent px-3 py-2 text-sm" />
      </div>
      <div>
        <p className="eyebrow mb-2">Photos (proof)</p>
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
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit Return Request
      </button>
    </div>
  );
}
