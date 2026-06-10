import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2, Package, X, Star, RotateCcw, Truck, CheckCircle2 } from "lucide-react";
import { currency } from "@/lib/format";
import { useMyOrders, useOrderEvents, useMyReturns, STATUS_LABEL, STATUS_STYLE, RETURN_STATUS_LABEL, type Order } from "@/lib/orders";
import { ReviewForm } from "@/components/ReviewForm";
import { ReturnForm } from "@/components/ReturnForm";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account | AESTHETE" }, { name: "robots", content: "noindex" }] }),
  ssr: false,
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const { data: orders = [], isLoading } = useMyOrders();
  const { data: returns = [] } = useMyReturns();
  const [reviewing, setReviewing] = useState<{ order: Order; itemId: string } | null>(null);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/auth", search: { mode: "signin", redirect: "/account" }, replace: true });
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email ?? "");
      setFullName((session.user.user_metadata?.full_name as string) || "");
    })();
  }, []);

  const cancelOrder = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Order cancelled.");
  };

  const hasReturnFor = (orderId: string) => returns.some((r: any) => r.order_id === orderId);

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

          {isLoading ? (
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
                <OrderCard key={o.id} order={o} userId={userId!} authorName={fullName}
                  hasReturn={hasReturnFor(o.id)}
                  onCancel={() => cancelOrder(o.id)}
                  onReview={(itemId) => setReviewing({ order: o, itemId })}
                  onReturn={() => setReturningOrder(o)} />
              ))}
            </ul>
          )}
        </section>

        {returns.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl mb-6">Return Requests</h2>
            <ul className="space-y-3">
              {returns.map((r: any) => (
                <li key={r.id} className="border border-hairline p-5 flex flex-wrap items-center gap-4 justify-between">
                  <div>
                    <p className="eyebrow mb-1">Order #{String(r.order_id).slice(0,8)}</p>
                    <p className="text-sm">{r.reason}</p>
                    <p className="text-xs text-ink-soft mt-1">{(r.items ?? []).map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}</p>
                    {r.admin_notes && <p className="text-xs text-ink-soft mt-2">Admin: {r.admin_notes}</p>}
                    {r.pickup_scheduled_at && <p className="text-xs mt-1 inline-flex items-center gap-1"><Truck className="w-3 h-3" /> Pickup {new Date(r.pickup_scheduled_at).toLocaleDateString()}</p>}
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 bg-surface-dim">{RETURN_STATUS_LABEL[r.status] ?? r.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {reviewing && userId && (
        <Modal title="Write a Review" onClose={() => setReviewing(null)}>
          <ReviewForm
            productId={reviewing.order.order_items.find(i => i.id === reviewing.itemId)?.product_id ?? ""}
            orderId={reviewing.order.id} userId={userId} authorName={fullName}
            onDone={() => setReviewing(null)} />
        </Modal>
      )}
      {returningOrder && userId && (
        <Modal title="Return Request" onClose={() => setReturningOrder(null)}>
          <ReturnForm order={returningOrder} userId={userId} onDone={() => setReturningOrder(null)} />
        </Modal>
      )}

      <Footer />
    </div>
  );
}

function OrderCard({ order: o, userId, authorName, hasReturn, onCancel, onReview, onReturn }: {
  order: Order; userId: string; authorName: string; hasReturn: boolean;
  onCancel: () => void; onReview: (itemId: string) => void; onReturn: () => void;
}) {
  const { data: events = [] } = useOrderEvents(o.id);
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (o.status !== "delivered" || !userId) return;
    const productIds = o.order_items.map((i) => i.product_id).filter(Boolean) as string[];
    if (!productIds.length) return;
    supabase.from("reviews" as any).select("product_id").eq("user_id", userId).eq("order_id", o.id).in("product_id", productIds)
      .then(({ data }) => setReviewedItems(new Set((data ?? []).map((r: any) => r.product_id))));
  }, [o.id, o.status, userId]);

  return (
    <li className="border border-hairline">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-hairline">
        <div>
          <p className="eyebrow mb-1">Order #{o.id.slice(0, 8)}</p>
          <p className="text-xs text-ink-soft">{new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
        </div>
        <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 ${STATUS_STYLE[o.status] ?? "bg-surface-dim"}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
        <p className="font-serif text-xl">{currency(o.total)}</p>
      </div>

      <ul className="divide-y divide-hairline">
        {o.order_items.map((it) => (
          <li key={it.id} className="flex items-center gap-4 p-4">
            {it.image_url ? (
              <img src={it.image_url} alt={it.name} className="w-16 h-16 object-cover border border-hairline" />
            ) : <div className="w-16 h-16 bg-surface-dim border border-hairline" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{it.name}</p>
              <p className="text-xs text-ink-soft">Qty {it.quantity} · {currency(Number(it.price))}</p>
            </div>
            <div className="flex items-center gap-2">
              {it.product_slug && (
                <Link to="/product/$id" params={{ id: it.product_slug }} className="text-[10px] tracking-[0.2em] uppercase underline">View Product</Link>
              )}
              {o.status === "delivered" && it.product_id && !reviewedItems.has(it.product_id) && (
                <button onClick={() => onReview(it.id)} className="text-[10px] tracking-[0.2em] uppercase border border-hairline px-3 h-8 hover:bg-surface-dim inline-flex items-center gap-1">
                  <Star className="w-3 h-3" /> Review
                </button>
              )}
              {o.status === "delivered" && it.product_id && reviewedItems.has(it.product_id) && (
                <span className="text-[10px] tracking-[0.2em] uppercase text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reviewed</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {events.length > 0 && (
        <details className="border-t border-hairline">
          <summary className="cursor-pointer px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-ink-soft hover:bg-surface-dim">Timeline</summary>
          <ol className="px-6 pb-4 space-y-2">
            {events.map((e) => (
              <li key={e.id} className="text-xs text-ink-soft flex gap-3">
                <span className="w-32 shrink-0">{new Date(e.created_at).toLocaleString()}</span>
                <span className="font-medium text-ink">{e.status ? (STATUS_LABEL[e.status] ?? e.status) : "Note"}</span>
                {e.note && <span>— {e.note}</span>}
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em]">{e.actor_role}</span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="flex flex-wrap gap-2 p-4 border-t border-hairline">
        {o.status === "pending" && (
          <button onClick={onCancel} className="text-[11px] tracking-[0.2em] uppercase border border-hairline px-4 h-9 hover:bg-surface-dim inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Cancel Order
          </button>
        )}
        {o.status === "delivered" && !hasReturn && (
          <button onClick={onReturn} className="text-[11px] tracking-[0.2em] uppercase border border-hairline px-4 h-9 hover:bg-surface-dim inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Return Product
          </button>
        )}
        {o.shipping_address && (
          <span className="text-xs text-ink-soft ml-auto">
            {o.shipping_address.line1}, {o.shipping_address.city}, {o.shipping_address.country}
          </span>
        )}
      </div>
    </li>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background border border-hairline w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-hairline">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-dim"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
