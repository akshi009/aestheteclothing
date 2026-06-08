import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Bag | AESTHETE" }, { name: "robots", content: "noindex" }] }),
  ssr: false,
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart();
  const shipping = subtotal > 0 && subtotal < 500 ? 25 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-32 max-w-[1200px] mx-auto px-6 md:px-10 pb-24">
        <p className="eyebrow mb-3">Your Selection</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="border border-hairline p-16 text-center">
            <p className="text-ink-soft mb-6">Your bag is currently empty.</p>
            <Link to="/collections" className="btn-primary inline-flex">Browse Collections</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <ul className="divide-y divide-hairline border-y border-hairline">
              {items.map((i) => (
                <li key={`${i.id}-${i.size ?? ""}`} className="py-6 flex gap-5">
                  <img src={i.image} alt={i.name} className="w-28 h-36 object-cover bg-surface-dim" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">{i.name}</p>
                        {i.size && <p className="text-xs text-ink-soft mt-1">Size {i.size}</p>}
                      </div>
                      <p className="font-medium">${(i.price * i.quantity).toLocaleString()}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-hairline">
                        <button onClick={() => updateQty(i.id, i.size, i.quantity - 1)} aria-label="Decrease" className="w-9 h-9 flex items-center justify-center hover:bg-surface-dim"><Minus className="w-3 h-3" /></button>
                        <span className="w-10 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => updateQty(i.id, i.size, i.quantity + 1)} aria-label="Increase" className="w-9 h-9 flex items-center justify-center hover:bg-surface-dim"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(i.id, i.size)} className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-ink-soft hover:text-ink"><Trash2 className="w-3 h-3" /> Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="border border-hairline p-7 h-fit lg:sticky lg:top-28 space-y-4">
              <p className="eyebrow">Order Summary</p>
              <div className="flex justify-between text-sm pt-3"><span className="text-ink-soft">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-ink-soft">Shipping</span><span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span></div>
              <div className="flex justify-between border-t border-hairline pt-4"><span className="font-medium">Total</span><span className="font-serif text-xl">${total.toLocaleString()}</span></div>
              <Link to="/checkout" className="btn-primary w-full justify-center">Proceed to Checkout</Link>
              <Link to="/collections" className="btn-ghost w-full justify-center">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
