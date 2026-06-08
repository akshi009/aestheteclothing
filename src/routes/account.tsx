import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2, Package } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account | AESTHETE" }, { name: "robots", content: "noindex" }] }),
  ssr: false,
  component: AccountPage,
});

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  shipping_address: any;
  order_items: { id: string; name: string; price: number; quantity: number }[];
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  shipped: "bg-indigo-100 text-indigo-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/auth", search: { mode: "signin", redirect: "/account" }, replace: true });
        return;
      }
      setEmail(session.user.email ?? "");
      const { data } = await supabase
        .from("orders")
        .select("id,status,total,created_at,customer_name,shipping_address,order_items(id,name,price,quantity)")
        .order("created_at", { ascending: false });
      setOrders((data as Order[] | null) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-32 max-w-[1200px] mx-auto px-6 md:px-10 pb-24">
        <p className="eyebrow mb-3">Members</p>
        <h1 className="font-serif text-4xl md:text-5xl">My Account</h1>
        <p className="text-sm text-ink-soft mt-3">{email}</p>

        <section className="mt-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-serif text-2xl">Order History</h2>
            <Link to="/collections" className="text-[11px] tracking-[0.2em] uppercase underline">Continue Shopping</Link>
          </div>

          {orders === null ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-ink-soft" /></div>
          ) : orders.length === 0 ? (
            <div className="border border-hairline p-16 text-center">
              <Package className="w-10 h-10 mx-auto mb-4 text-ink-soft" />
              <p className="text-ink-soft mb-6">You haven't placed any orders yet.</p>
              <Link to="/collections" className="btn-primary inline-flex">Explore Collections</Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {orders.map((o) => (
                <li key={o.id} className="border border-hairline">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-hairline">
                    <div>
                      <p className="eyebrow mb-1">Order #{o.id.slice(0, 8)}</p>
                      <p className="text-xs text-ink-soft">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                    </div>
                    <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 ${statusStyles[o.status] ?? "bg-surface-dim"}`}>{o.status}</span>
                    <p className="font-serif text-xl">${Number(o.total).toLocaleString()}</p>
                  </div>
                  <ul className="divide-y divide-hairline px-6">
                    {o.order_items?.map((it) => (
                      <li key={it.id} className="py-3 flex justify-between text-sm">
                        <span className="truncate pr-3">{it.name} × {it.quantity}</span>
                        <span className="text-ink-soft">${(Number(it.price) * it.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  {o.shipping_address && (
                    <div className="px-6 py-4 border-t border-hairline text-xs text-ink-soft">
                      Shipping to {o.shipping_address.line1}, {o.shipping_address.city}, {o.shipping_address.country}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
