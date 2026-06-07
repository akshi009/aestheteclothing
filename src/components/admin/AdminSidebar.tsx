import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Store,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const { location } = useRouterState();
  const path = location.pathname;
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-hairline bg-surface-dim/40 min-h-screen p-6 sticky top-0">
      <Link to="/" className="font-serif text-2xl tracking-[0.18em] font-bold mb-1">AESTHETE</Link>
      <p className="eyebrow mb-10">Atelier Console</p>
      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to as any}
              className={`flex items-center gap-3 px-3 h-10 text-sm rounded-sm transition ${
                active ? "bg-primary text-primary-foreground" : "text-ink hover:bg-surface-dim"
              }`}
            >
              <Icon className="w-4 h-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 pt-6 border-t border-hairline space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 h-10 text-sm text-ink-soft hover:bg-surface-dim rounded-sm transition">
          <Store className="w-4 h-4" /> View Storefront
        </Link>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}
          className="flex items-center gap-3 px-3 h-10 text-sm text-ink-soft hover:bg-surface-dim rounded-sm transition w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
