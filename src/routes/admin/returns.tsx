import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RETURN_STATUS_LABEL } from "@/lib/orders";

export const Route = createFileRoute("/admin/returns")({ component: ReturnsAdmin });

const STATUSES = ["submitted", "under_review", "approved", "rejected", "scheduled", "completed"] as const;

function ReturnsAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("return_requests" as any)
        .select("*, orders(id,customer_name,customer_email,total)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("admin-returns-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "return_requests" },
        () => qc.invalidateQueries({ queryKey: ["admin-returns"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const patch = async (id: string, body: any) => {
    const { error } = await supabase.from("return_requests" as any).update(body).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Updated.");
  };

  const filtered = filter === "all" ? rows : rows.filter((r: any) => r.status === filter);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Reverse Logistics</p>
          <h1 className="font-serif text-3xl md:text-4xl">Returns</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-[10px] tracking-[0.2em] uppercase px-4 h-9 border ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-hairline"}`}>{s.replace("_", " ")}</button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-ink-soft text-sm">Loading…</p>
        : filtered.length === 0 ? <p className="text-ink-soft text-sm">No return requests.</p>
        : (
          <ul className="space-y-4">
            {filtered.map((r: any) => (
              <ReturnRow key={r.id} r={r} onPatch={patch} />
            ))}
          </ul>
        )}
    </div>
  );
}

function ReturnRow({ r, onPatch }: { r: any; onPatch: (id: string, body: any) => Promise<void> }) {
  const [notes, setNotes] = useState(r.admin_notes ?? "");
  const [pickup, setPickup] = useState(r.pickup_scheduled_at ? r.pickup_scheduled_at.slice(0,16) : "");
  return (
    <li className="border border-hairline p-5 bg-card space-y-3">
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <p className="eyebrow mb-1">Order #{String(r.order_id).slice(0,8)}</p>
          <p className="text-sm font-medium">{r.orders?.customer_name || "—"} · <span className="text-ink-soft">{r.orders?.customer_email}</span></p>
          <p className="text-sm mt-2"><strong>Reason:</strong> {r.reason}</p>
          {r.comments && <p className="text-sm text-ink-soft mt-1">{r.comments}</p>}
          <p className="text-xs text-ink-soft mt-2">{(r.items ?? []).map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}</p>
          {Array.isArray(r.images) && r.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {r.images.map((u: string) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="w-16 h-16 object-cover border border-hairline" /></a>)}
            </div>
          )}
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-surface-dim">{RETURN_STATUS_LABEL[r.status] ?? r.status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 pt-3 border-t border-hairline">
        <div>
          <p className="eyebrow mb-2">Admin Notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-hairline bg-transparent px-3 py-2 text-sm" />
          <button onClick={() => onPatch(r.id, { admin_notes: notes })} className="mt-2 text-[10px] tracking-[0.2em] uppercase border border-hairline px-3 h-8 hover:bg-surface-dim">Save Notes</button>
        </div>
        <div>
          <p className="eyebrow mb-2">Pickup Date</p>
          <input type="datetime-local" value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full h-10 border border-hairline bg-transparent px-3 text-sm" />
          <button onClick={() => onPatch(r.id, { pickup_scheduled_at: pickup ? new Date(pickup).toISOString() : null, status: "scheduled" })} className="mt-2 text-[10px] tracking-[0.2em] uppercase border border-hairline px-3 h-8 hover:bg-surface-dim">Schedule</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-hairline">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onPatch(r.id, { status: s })} className={`text-[10px] tracking-[0.2em] uppercase px-3 h-8 border ${r.status === s ? "border-primary bg-primary text-primary-foreground" : "border-hairline hover:bg-surface-dim"}`}>{s.replace("_", " ")}</button>
        ))}
        <select value={r.refund_status ?? ""} onChange={(e) => onPatch(r.id, { refund_status: e.target.value || null })} className="text-[10px] tracking-[0.2em] uppercase px-3 h-8 border border-hairline bg-transparent">
          <option value="">Refund: —</option>
          <option value="pending">Refund: Pending</option>
          <option value="processed">Refund: Processed</option>
          <option value="na">Refund: N/A</option>
        </select>
      </div>
    </li>
  );
}
