import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currency, dateTime } from "@/lib/format";
import { Eye, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: Orders });

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function Orders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<any | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated.");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order deleted.");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const filtered = orders.filter((o: any) => filter === "all" || o.status === filter);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Fulfillment</p>
          <h1 className="font-serif text-3xl md:text-4xl">Orders</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statuses].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-[10px] tracking-[0.2em] uppercase px-4 h-9 border ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-hairline"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs tracking-[0.2em] uppercase text-ink-soft">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-ink-soft">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink-soft">No orders yet.</td></tr>}
            {filtered.map((o: any) => (
              <tr key={o.id} className="border-b border-hairline last:border-0 hover:bg-surface-dim/50">
                <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="p-4">
                  <p className="font-medium">{o.customer_name || "—"}</p>
                  <p className="text-xs text-ink-soft">{o.customer_email}</p>
                </td>
                <td className="p-4 font-serif">{currency(o.total)}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="text-xs border border-hairline bg-transparent h-8 px-2">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-ink-soft text-xs">{dateTime(o.created_at)}</td>
                <td className="p-4 whitespace-nowrap">
                  <button onClick={() => setOpen(o)} className="p-2 hover:bg-surface-dim"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => remove(o.id)} className="p-2 hover:bg-surface-dim text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <OrderDetail order={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: any; onClose: () => void }) {
  const { data: items = [] } = useQuery({
    queryKey: ["order-items", order.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", order.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const addr = order.shipping_address ?? {};
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-hairline w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          <div>
            <p className="eyebrow mb-1">Order #{order.id.slice(0, 8)}</p>
            <h2 className="font-serif text-2xl">{order.customer_name || "Customer"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-dim"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div><p className="eyebrow mb-1">Email</p><p>{order.customer_email || "—"}</p></div>
            <div><p className="eyebrow mb-1">Status</p><p>{order.status}</p></div>
            <div><p className="eyebrow mb-1">Total</p><p className="font-serif text-lg">{currency(order.total)}</p></div>
            <div><p className="eyebrow mb-1">Date</p><p>{dateTime(order.created_at)}</p></div>
          </div>
          {Object.keys(addr).length > 0 && (
            <div>
              <p className="eyebrow mb-2">Shipping</p>
              <p className="text-sm text-ink-soft whitespace-pre-line">{[addr.line1, addr.line2, addr.city, addr.region, addr.postal_code, addr.country].filter(Boolean).join("\n")}</p>
            </div>
          )}
          <div>
            <p className="eyebrow mb-3">Items</p>
            <div className="border border-hairline">
              {items.length === 0 && <p className="p-4 text-sm text-ink-soft">No items recorded.</p>}
              {items.map((it: any) => (
                <div key={it.id} className="flex justify-between p-4 border-b border-hairline last:border-0 text-sm">
                  <div><p className="font-medium">{it.name}</p><p className="text-xs text-ink-soft">Qty {it.quantity}</p></div>
                  <p>{currency(Number(it.price) * it.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
          {order.notes && <div><p className="eyebrow mb-1">Notes</p><p className="text-sm text-ink-soft">{order.notes}</p></div>}
        </div>
      </div>
    </div>
  );
}
