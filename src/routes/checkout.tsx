import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout | AESTHETE" }, { name: "robots", content: "noindex" }] }),
  ssr: false,
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  line1: z.string().trim().min(2).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(100),
  region: z.string().trim().min(1).max(100),
  postal: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", line1: "", line2: "", city: "", region: "", postal: "", country: "United States", notes: "" });

  const shipping = subtotal > 0 && subtotal < 500 ? 25 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (!s) {
        navigate({ to: "/auth", search: { mode: "signin", redirect: "/checkout" }, replace: true });
        return;
      }
      setUserId(s.user.id);
      setForm((f) => ({
        ...f,
        customer_email: f.customer_email || s.user.email || "",
        customer_name: f.customer_name || (s.user.user_metadata?.full_name as string | undefined) || "",
      }));
    });
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (items.length === 0) { toast.error("Your bag is empty."); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the form."); return; }

    setBusy(true);
    const { line1, line2, city, region, postal, country, customer_name, customer_email, notes } = parsed.data;
    const shipping_address = { line1, line2: line2 || null, city, region, postal, country };

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total,
        status: "pending",
        customer_name,
        customer_email,
        shipping_address,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      setBusy(false);
      toast.error(error?.message ?? "Could not place order.");
      return;
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: null,
        name: `${i.name}${i.size ? ` (Size ${i.size})` : ""}`,
        price: i.price,
        quantity: i.quantity,
      })),
    );

    if (itemsErr) {
      setBusy(false);
      toast.error("Order placed but line items failed: " + itemsErr.message);
      return;
    }

    clear();
    toast.success("Order placed.");
    navigate({ to: "/account", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-32 max-w-[1200px] mx-auto px-6 md:px-10 pb-24">
        <p className="eyebrow mb-3">Final Step</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Checkout</h1>

        {items.length === 0 ? (
          <div className="border border-hairline p-16 text-center">
            <p className="text-ink-soft mb-6">Your bag is empty.</p>
            <Link to="/collections" className="btn-primary inline-flex">Browse Collections</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-8">
              <Section title="Contact">
                <Grid>
                  <Field label="Full Name"><input required value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} className={inp} /></Field>
                  <Field label="Email"><input type="email" required value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} className={inp} /></Field>
                </Grid>
              </Section>
              <Section title="Shipping Address">
                <Grid>
                  <Field label="Address Line 1" className="col-span-2"><input required value={form.line1} onChange={(e) => set("line1", e.target.value)} className={inp} /></Field>
                  <Field label="Address Line 2" className="col-span-2"><input value={form.line2} onChange={(e) => set("line2", e.target.value)} className={inp} /></Field>
                  <Field label="City"><input required value={form.city} onChange={(e) => set("city", e.target.value)} className={inp} /></Field>
                  <Field label="State / Region"><input required value={form.region} onChange={(e) => set("region", e.target.value)} className={inp} /></Field>
                  <Field label="Postal Code"><input required value={form.postal} onChange={(e) => set("postal", e.target.value)} className={inp} /></Field>
                  <Field label="Country"><input required value={form.country} onChange={(e) => set("country", e.target.value)} className={inp} /></Field>
                </Grid>
              </Section>
              <Section title="Order Notes (optional)">
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={`${inp} h-auto py-3`} placeholder="Gift wrapping, delivery preferences…" />
              </Section>
              <Section title="Payment">
                <p className="text-sm text-ink-soft">Payment integration is not yet enabled. Your order will be placed as <strong>pending</strong> and our concierge will follow up by email to arrange payment.</p>
              </Section>
            </div>

            <aside className="border border-hairline p-7 h-fit lg:sticky lg:top-28 space-y-4">
              <p className="eyebrow">Order Summary</p>
              <ul className="divide-y divide-hairline border-y border-hairline -mx-7 px-7">
                {items.map((i) => (
                  <li key={`${i.id}-${i.size ?? ""}`} className="py-3 flex justify-between text-sm">
                    <span className="truncate pr-3">{i.name} × {i.quantity}</span>
                    <span>${(i.price * i.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between text-sm"><span className="text-ink-soft">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-ink-soft">Shipping</span><span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span></div>
              <div className="flex justify-between border-t border-hairline pt-4"><span className="font-medium">Total</span><span className="font-serif text-xl">${total.toLocaleString()}</span></div>
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Place Order
              </button>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

const inp = "w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="eyebrow block mb-2">{label}</label>
      {children}
    </div>
  );
}
