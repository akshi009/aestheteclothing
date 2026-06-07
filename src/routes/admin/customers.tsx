import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dateShort } from "@/lib/format";
import { Search, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

function Customers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, roles, orders] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id,role"),
        supabase.from("orders").select("user_id,total"),
      ]);
      const roleMap = new Map<string, string[]>();
      (roles.data ?? []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) ?? []; arr.push(r.role); roleMap.set(r.user_id, arr);
      });
      const orderMap = new Map<string, { count: number; total: number }>();
      (orders.data ?? []).forEach((o: any) => {
        const cur = orderMap.get(o.user_id) ?? { count: 0, total: 0 };
        cur.count += 1; cur.total += Number(o.total || 0);
        orderMap.set(o.user_id, cur);
      });
      return (profiles.data ?? []).map((p: any) => ({
        ...p,
        roles: roleMap.get(p.id) ?? [],
        order_count: orderMap.get(p.id)?.count ?? 0,
        spent: orderMap.get(p.id)?.total ?? 0,
      }));
    },
  });

  const customers = data ?? [];
  const filtered = customers.filter((c: any) =>
    !q || (c.email ?? "").toLowerCase().includes(q.toLowerCase()) || (c.full_name ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin access revoked.");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Promoted to admin.");
    }
    qc.invalidateQueries({ queryKey: ["admin-customers"] });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <p className="eyebrow mb-2">Members</p>
          <h1 className="font-serif text-3xl md:text-4xl">Customers</h1>
          <p className="text-sm text-ink-soft mt-2">{customers.length} total signups</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="h-10 pl-9 pr-3 border border-hairline bg-transparent text-sm focus:border-primary outline-none w-64" />
        </div>
      </div>

      <div className="border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs tracking-[0.2em] uppercase text-ink-soft">
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Roles</th>
              <th className="p-4">Joined</th>
              <th className="p-4 w-px"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-8 text-center text-ink-soft">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-ink-soft">No customers yet.</td></tr>}
            {filtered.map((c: any) => {
              const isAdmin = c.roles.includes("admin");
              return (
                <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-surface-dim/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-surface-dim flex items-center justify-center text-xs font-medium">
                          {(c.full_name || c.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium">{c.full_name || "Unnamed"}</p>
                    </div>
                  </td>
                  <td className="p-4 text-ink-soft">{c.email || "—"}</td>
                  <td className="p-4">{c.order_count}</td>
                  <td className="p-4 font-serif">${c.spent.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {c.roles.map((r: string) => (
                        <span key={r} className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${r === "admin" ? "bg-primary text-primary-foreground" : "bg-surface-dim text-ink-soft"}`}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-ink-soft text-xs">{dateShort(c.created_at)}</td>
                  <td className="p-4">
                    <button onClick={() => toggleAdmin(c.id, isAdmin)} title={isAdmin ? "Revoke admin" : "Make admin"} className="p-2 hover:bg-surface-dim">
                      {isAdmin ? <ShieldOff className="w-4 h-4 text-destructive" /> : <Shield className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
