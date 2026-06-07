import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { currency, dateTime } from "@/lib/format";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [orders, products, profiles] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at,customer_name,customer_email").order("created_at", { ascending: false }),
        supabase.from("products").select("id,stock", { count: "exact", head: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        orders: orders.data ?? [],
        productCount: products.data?.length ?? 0,
        lowStock: (products.data ?? []).filter((p: any) => p.stock < 5).length,
        customerCount: profiles.count ?? 0,
      };
    },
  });

  const orders = data?.orders ?? [];
  const revenue = orders.reduce((s, o: any) => s + Number(o.total || 0), 0);
  const pending = orders.filter((o: any) => o.status === "pending").length;

  // Group revenue by day for last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const chart = days.map((day) => {
    const dayOrders = orders.filter((o: any) => o.created_at.startsWith(day));
    return {
      day: day.slice(5),
      revenue: dayOrders.reduce((s, o: any) => s + Number(o.total || 0), 0),
      orders: dayOrders.length,
    };
  });

  const stats = [
    { label: "Total Revenue", value: currency(revenue), icon: DollarSign, hint: `${orders.length} orders` },
    { label: "Pending Orders", value: pending, icon: ShoppingCart, hint: "Awaiting fulfillment" },
    { label: "Customers", value: data?.customerCount ?? 0, icon: Users, hint: "Total signups" },
    { label: "Products", value: data?.productCount ?? 0, icon: Package, hint: `${data?.lowStock ?? 0} low stock` },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Overview</p>
          <h1 className="font-serif text-3xl md:text-4xl">Atelier Dashboard</h1>
        </div>
        <p className="text-xs text-ink-soft">{isLoading ? "Loading…" : "Live data"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="border border-hairline p-6 bg-card">
              <div className="flex items-center justify-between mb-6">
                <p className="eyebrow">{s.label}</p>
                <Icon className="w-4 h-4 text-ink-soft" />
              </div>
              <p className="font-serif text-3xl">{s.value}</p>
              <p className="text-xs text-ink-soft mt-2">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 border border-hairline bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow mb-1">Last 14 Days</p>
              <h2 className="font-serif text-xl">Revenue & Orders</h2>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ink)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--ink)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
                <XAxis dataKey="day" stroke="var(--ink-soft)" fontSize={11} />
                <YAxis stroke="var(--ink-soft)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--ink)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-hairline bg-card p-6">
          <p className="eyebrow mb-1">Recent</p>
          <h2 className="font-serif text-xl mb-6">Latest Orders</h2>
          <div className="space-y-4">
            {orders.slice(0, 6).map((o: any) => (
              <div key={o.id} className="flex justify-between items-start text-sm pb-4 border-b border-hairline last:border-0">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.customer_name || o.customer_email || "Guest"}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{dateTime(o.created_at)} • {o.status}</p>
                </div>
                <p className="font-serif">{currency(o.total)}</p>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-ink-soft">No orders yet.</p>}
          </div>
          <Link to="/admin/orders" className="mt-6 inline-flex items-center gap-1 text-xs tracking-[0.2em] uppercase">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
