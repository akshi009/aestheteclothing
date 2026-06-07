import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm, type ProductRow } from "@/components/admin/ProductForm";
import { currency, dateShort } from "@/lib/format";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({ component: Inventory });

function Inventory() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = products.filter((p: any) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase())
  );

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggleFeatured = async (p: any) => {
    const { error } = await supabase.from("products").update({ featured: !p.featured }).eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-serif text-3xl md:text-4xl">Inventory</h1>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 pl-9 pr-3 border border-hairline bg-transparent text-sm focus:border-primary outline-none w-64" />
          </div>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>

      <div className="border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs tracking-[0.2em] uppercase text-ink-soft">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Added</th>
              <th className="p-4 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-8 text-center text-ink-soft">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-ink-soft">No products yet. Create your first one.</td></tr>}
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-b border-hairline last:border-0 hover:bg-surface-dim/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-12 h-12 object-cover bg-surface-dim" />
                    ) : (
                      <div className="w-12 h-12 bg-surface-dim" />
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-ink-soft">{p.category}</td>
                <td className="p-4">{currency(p.price)}</td>
                <td className="p-4">
                  <span className={p.stock < 5 ? "text-destructive" : ""}>{p.stock}</span>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${
                    p.status === "active" ? "bg-primary/10 text-primary" :
                    p.status === "draft" ? "bg-surface-dim text-ink-soft" :
                    "bg-destructive/10 text-destructive"
                  }`}>{p.status}</span>
                </td>
                <td className="p-4 text-ink-soft text-xs">{dateShort(p.created_at)}</td>
                <td className="p-4 whitespace-nowrap">
                  <button onClick={() => toggleFeatured(p)} title="Toggle featured" className="p-2 hover:bg-surface-dim">
                    <Star className={`w-4 h-4 ${p.featured ? "fill-primary text-primary" : "text-ink-soft"}`} />
                  </button>
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="p-2 hover:bg-surface-dim">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-surface-dim text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <ProductForm
          product={editing}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); }}
        />
      )}
    </div>
  );
}
