import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string, size?: string) => void;
  updateQty: (id: string, size: string | undefined, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "aesthete-cart-v1";

const key = (id: string, size?: string) => `${id}::${size ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const k = key(item.id, item.size);
      const existing = prev.find((p) => key(p.id, p.size) === k);
      if (existing) return prev.map((p) => (key(p.id, p.size) === k ? { ...p, quantity: p.quantity + qty } : p));
      return [...prev, { ...item, quantity: qty }];
    });
    setOpen(true);
  };

  const remove: CartCtx["remove"] = (id, size) =>
    setItems((prev) => prev.filter((p) => key(p.id, p.size) !== key(id, size)));

  const updateQty: CartCtx["updateQty"] = (id, size, qty) =>
    setItems((prev) =>
      prev.flatMap((p) => {
        if (key(p.id, p.size) !== key(id, size)) return [p];
        if (qty <= 0) return [];
        return [{ ...p, quantity: qty }];
      }),
    );

  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return <Ctx.Provider value={{ items, open, setOpen, add, remove, updateQty, clear, count, subtotal }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
