import { Link, useNavigate } from "@tanstack/react-router";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { currency } from "@/lib/format";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, open, setOpen, updateQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-label="Shopping bag">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-hairline flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-hairline">
          <div>
            <p className="eyebrow mb-1">Your Bag</p>
            <h2 className="font-serif text-2xl">{items.length} {items.length === 1 ? "Item" : "Items"}</h2>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 hover:bg-surface-dim">
            <X className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
            <ShoppingBag className="w-10 h-10 text-ink-soft" />
            <p className="text-sm text-ink-soft">Your bag is empty.</p>
            <button onClick={() => { setOpen(false); navigate({ to: "/collections" }); }} className="btn-primary">Explore Collections</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-hairline">
              {items.map((i) => (
                <li key={`${i.id}-${i.size ?? ""}`} className="p-6 flex gap-4">
                  <img src={i.image} alt={i.name} className="w-20 h-24 object-cover bg-surface-dim" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    {i.size && <p className="text-xs text-ink-soft mt-1">Size {i.size}</p>}
                    <p className="text-sm mt-2">${(i.price * i.quantity).toLocaleString()}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-hairline">
                        <button onClick={() => updateQty(i.id, i.size, i.quantity - 1)} aria-label="Decrease" className="w-8 h-8 flex items-center justify-center hover:bg-surface-dim"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => updateQty(i.id, i.size, i.quantity + 1)} aria-label="Increase" className="w-8 h-8 flex items-center justify-center hover:bg-surface-dim"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(i.id, i.size)} className="text-[10px] tracking-[0.2em] uppercase underline text-ink-soft">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-hairline p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-ink-soft">Shipping and taxes calculated at checkout.</p>
              <button onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }} className="btn-primary w-full justify-center">Checkout</button>
              <Link to="/cart" onClick={() => setOpen(false)} className="block text-center text-[11px] tracking-[0.2em] uppercase underline">View Full Bag</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
