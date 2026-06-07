import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users, Settings, Search, Bell, Plus, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Atelier Admin — AESTHETE Luxury Management" },
      { name: "description", content: "AESTHETE Atelier — luxury fashion management dashboard." },
    ],
  }),
  component: AdminDashboard,
});

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Inventory" },
  { icon: ShoppingCart, label: "Orders" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Customers" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Monthly Revenue", value: "$482,900", change: "+12.4%", positive: true },
  { label: "Active Orders", value: "1,248", change: "Stable", positive: null },
  { label: "VIP Customers", value: "3,592", change: "+8.1%", positive: true },
  { label: "Conversion Rate", value: "4.21%", change: "−2.4%", positive: false },
];

const activity = [
  { who: "Sophia Chen", what: "purchased Silk Atelier Gown", meta: "2 mins ago • $4,200" },
  { who: "Inventory Alert:", what: '"Noir" Collection running low', meta: "1 hour ago • 3 items left" },
  { who: "Marcus Thorne", what: "upgraded to Platinum Membership", meta: "3 hours ago • Status update" },
  { who: "Monthly financial report", what: "generated", meta: "Yesterday • 10:45 pm" },
];

const collections = [
  { name: "Atelier Winter 24", sub: "Handcrafted Leather", revenue: "$182,500", conversion: 72, inventory: "24 / 150" },
  { name: "Silk Essentials", sub: "Pure Mulberry Silk", revenue: "$124,200", conversion: 58, inventory: "86 / 200" },
  { name: "Monochrome Edit", sub: "Tailored Cashmere", revenue: "$98,400", conversion: 64, inventory: "42 / 120" },
];

function AdminDashboard() {
  const days = [40, 28, 70, 95, 45, 88, 62];
  const dayLabels = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  return (
    <div className="min-h-screen bg-surface-dim/50 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-background border-r border-hairline flex-col">
        <div className="px-6 py-7 border-b border-hairline">
          <Link to="/" className="font-serif text-lg tracking-[0.18em] font-bold">AESTHETE ADMIN</Link>
          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mt-1">Luxury Management</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {nav.map((n) => (
            <button key={n.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition ${n.active ? "bg-primary text-primary-foreground" : "hover:bg-surface-dim"}`}>
              <n.icon className="w-4 h-4 stroke-[1.5]" />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-hairline flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-dim border border-hairline flex items-center justify-center text-xs font-medium">JV</div>
          <div>
            <p className="text-sm font-medium">Julian V.</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Director</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        <header className="bg-surface-dim/50 border-b border-hairline px-6 md:px-10 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Overview</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft mt-1">Performance Update • Oct 24</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-hairline bg-background flex items-center justify-center"><Search className="w-4 h-4" /></button>
            <button className="w-10 h-10 rounded-full border border-hairline bg-background flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> New Report</button>
          </div>
        </header>

        <main className="p-6 md:p-10 space-y-8">
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-background border border-hairline rounded-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-sm bg-surface-dim border border-hairline flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-sm ${s.positive === true ? "bg-emerald-50 text-emerald-700" : s.positive === false ? "bg-red-50 text-red-700" : "bg-surface-dim text-ink-soft"}`}>{s.change}</span>
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">{s.label}</p>
                <p className="font-serif text-3xl mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* CHART + ACTIVITY */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-background border border-hairline rounded-sm p-6">
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-serif text-xl">Revenue Forecast</h3>
                  <p className="text-sm text-ink-soft">Projections for Q4 2026</p>
                </div>
                <div className="flex gap-1 bg-surface-dim rounded-full p-1 text-xs">
                  <button className="px-4 py-1.5 bg-background rounded-full">Week</button>
                  <button className="px-4 py-1.5 text-ink-soft">Month</button>
                </div>
              </div>
              <div className="flex items-end gap-4 md:gap-6 h-56">
                {days.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full flex-1 flex items-end">
                      <div className={`w-full rounded-t-sm ${i === 3 ? "bg-primary" : "bg-surface-dim"}`} style={{ height: `${h}%` }} />
                    </div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background border border-hairline rounded-sm p-6">
              <h3 className="font-serif text-xl mb-6">Recent Activity</h3>
              <ul className="space-y-5">
                {activity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-dim border border-hairline shrink-0" />
                    <div className="text-sm">
                      <p><span className="font-medium">{a.who}</span> {a.what}</p>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-ink-soft mt-1">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full text-[11px] tracking-[0.2em] uppercase text-ink-soft border-t border-hairline pt-5 hover:text-ink transition">View All Activity</button>
            </div>
          </div>

          {/* COLLECTION TABLE */}
          <div className="bg-background border border-hairline rounded-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl">Top Collection Performance</h3>
              <div className="flex -space-x-2">
                {[1,2,3].map((i) => <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-surface-dim" />)}
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center text-[10px]">+5</div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">
                  <th className="text-left font-normal pb-4">Collection</th>
                  <th className="text-left font-normal pb-4">Revenue</th>
                  <th className="text-left font-normal pb-4">Conversion</th>
                  <th className="text-left font-normal pb-4">Inventory</th>
                  <th className="text-right font-normal pb-4">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {collections.map((c) => (
                  <tr key={c.name}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-surface-dim" />
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-ink-soft">{c.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-serif text-base">{c.revenue}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1 bg-surface-dim rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${c.conversion}%` }} />
                        </div>
                        <span className="text-xs">{(c.conversion / 10).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-ink-soft">{c.inventory}</td>
                    <td className="py-4 text-right"><ArrowUpRight className="w-4 h-4 text-emerald-600 inline" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
