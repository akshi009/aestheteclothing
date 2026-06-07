import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { currency } from "@/lib/format";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

const COLORS = ["#1a1a1a", "#4a4441", "#8a857d", "#c5beb1", "#e5ddca"];

function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [orders, items, products, profiles] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at"),
        supabase.from("order_items").select("name,price,quantity,product_id"),
        supabase.from("products").select("id,name,category,stock"),
        supabase.from("profiles").select("id,created_at"),
      ]);
      return {
        orders: orders.data ?? [],
        items: items.data ?? [],
        products: products.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  const orders = data?.orders ?? [];
  const items = data?.items ?? [];
  const products = data?.products ?? [];
  const profiles = data?.profiles ?? [];

  // 30-day revenue
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const series = days.map((day) => {
    const dayOrders = orders.filter((o: any) => o.created_at.startsWith(day));
    const daySignups = profiles.filter((p: any) => p.created_at.startsWith(day));
    return {
      day: day.slice(5),
      revenue: dayOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0),
      orders: dayOrders.length,
      signups: daySignups.length,
    };
  });

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Top products
  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  items.forEach((i: any) => {
    const cur = productSales.get(i.name) ?? { name: i.name, qty: 0, revenue: 0 };
    cur.qty += i.quantity;
    cur.revenue += Number(i.price) * i.quantity;
    productSales.set(i.name, cur);
  });
  const topProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Category breakdown
  const catTotals: Record<string, number> = {};
  products.forEach((p: any) => { catTotals[p.category] = (catTotals[p.category] ?? 0) + 1; });
  const catData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

  const totalRev = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const avgOrder = orders.length ? totalRev / orders.length : 0;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Insights</p>
          <h1 className="font-serif text-3xl md:text-4xl">Analytics</h1>
        </div>
        <p className="text-xs text-ink-soft">{isLoading ? "Loading…" : `${orders.length} orders analyzed`}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Total Revenue" value={currency(totalRev)} />
        <Stat label="Average Order Value" value={currency(avgOrder)} />
        <Stat label="Conversion (30d)" value={`${profiles.length ? ((orders.length / Math.max(profiles.length, 1)) * 100).toFixed(1) : 0}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue (30 days)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
              <XAxis dataKey="day" stroke="var(--ink-soft)" fontSize={11} />
              <YAxis stroke="var(--ink-soft)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--ink)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Orders & Signups">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
              <XAxis dataKey="day" stroke="var(--ink-soft)" fontSize={11} />
              <YAxis stroke="var(--ink-soft)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="orders" fill="var(--ink)" />
              <Bar dataKey="signups" fill="var(--ink-soft)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Products">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
              <XAxis type="number" stroke="var(--ink-soft)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="var(--ink-soft)" fontSize={11} width={130} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="var(--ink)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Order Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData.length ? statusData : [{ name: "none", value: 1 }]} dataKey="value" nameKey="name" outerRadius={100} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Catalog by Category">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={catData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" />
            <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={11} />
            <YAxis stroke="var(--ink-soft)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--hairline)", fontSize: 12 }} />
            <Bar dataKey="value" fill="var(--ink)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-hairline bg-card p-6">
      <p className="eyebrow mb-3">{label}</p>
      <p className="font-serif text-3xl">{value}</p>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline bg-card p-6">
      <p className="eyebrow mb-1">Chart</p>
      <h2 className="font-serif text-xl mb-5">{title}</h2>
      {children}
    </div>
  );
}
