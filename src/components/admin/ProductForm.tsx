import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

const schema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "lowercase, numbers, hyphens"),
  category: z.string().min(1).max(80),
  price: z.number().min(0).max(1_000_000),
  stock: z.number().int().min(0).max(100_000),
  description: z.string().max(2000).optional().or(z.literal("")),
  image_url: z.string().url().max(2048).optional().or(z.literal("")),
  status: z.enum(["active", "draft", "archived"]),
  featured: z.boolean(),
});

export type ProductRow = {
  id?: string;
  name: string; slug: string; category: string;
  price: number | string; stock: number;
  description?: string | null; image_url?: string | null;
  status: string; featured: boolean;
};

const empty: ProductRow = {
  name: "", slug: "", category: "Essentials", price: 0, stock: 0,
  description: "", image_url: "", status: "active", featured: false,
};

export function ProductForm({ product, onClose, onSaved }: { product: ProductRow | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ProductRow>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(product ? { ...empty, ...product, price: Number(product.price) } : empty);
  }, [product]);

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, price: Number(form.price), stock: Number(form.stock) });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setBusy(true);
    const payload = { ...parsed.data, description: parsed.data.description || null, image_url: parsed.data.image_url || null };
    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(form.id ? "Product updated." : "Product created.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-hairline w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-hairline sticky top-0 bg-background">
          <div>
            <p className="eyebrow mb-1">{form.id ? "Edit" : "Create"}</p>
            <h2 className="font-serif text-2xl">{form.id ? form.name || "Product" : "New Product"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-dim"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-5">
          <Field label="Name" className="col-span-2"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inp} /></Field>
          <Field label="Slug"><input required value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} className={inp} placeholder="silk-shirt" /></Field>
          <Field label="Category"><input required value={form.category} onChange={(e) => set("category", e.target.value)} className={inp} /></Field>
          <Field label="Price (USD)"><input required type="number" min="0" step="0.01" value={form.price as number} onChange={(e) => set("price", parseFloat(e.target.value || "0"))} className={inp} /></Field>
          <Field label="Stock"><input required type="number" min="0" value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value || "0", 10))} className={inp} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inp}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Featured">
            <label className="flex items-center gap-3 h-12 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4" />
              Show on homepage
            </label>
          </Field>
          <Field label="Image URL" className="col-span-2"><input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} className={inp} placeholder="https://…" /></Field>
          <Field label="Description" className="col-span-2">
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={4} className={`${inp} h-auto py-3`} />
          </Field>
          <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-hairline">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {form.id ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none";
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="eyebrow block mb-2">{label}</label>
      {children}
    </div>
  );
}
