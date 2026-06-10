import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setCurrencyFormat } from "@/lib/format";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

type General = { store_name: string; currency: string; locale: string; support_email: string; tagline: string };
type Shipping = { free_shipping_threshold: number; standard_rate: number; express_rate: number };

const CURRENCIES = [
  { code: "INR", locale: "en-IN", label: "Indian Rupee (₹)" },
  { code: "USD", locale: "en-US", label: "US Dollar ($)" },
  { code: "EUR", locale: "en-IE", label: "Euro (€)" },
  { code: "GBP", locale: "en-GB", label: "Pound Sterling (£)" },
  { code: "AED", locale: "en-AE", label: "UAE Dirham (د.إ)" },
];

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, any> = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const [general, setGeneral] = useState<General>({ store_name: "AESTHETE", currency: "INR", locale: "en-IN", support_email: "", tagline: "" });
  const [shipping, setShipping] = useState<Shipping>({ free_shipping_threshold: 5000, standard_rate: 250, express_rate: 600 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.general) setGeneral((g) => ({ ...g, ...data.general }));
    if (data?.shipping) setShipping((s) => ({ ...s, ...data.shipping }));
  }, [data]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "general", value: general, updated_at: new Date().toISOString() },
      { key: "shipping", value: shipping, updated_at: new Date().toISOString() },
    ]);
    setBusy(false);
    if (error) return toast.error(error.message);
    setCurrencyFormat(general.currency, general.locale);
    toast.success("Settings saved.");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["storefront-settings"] });
  };

  const inp = "w-full h-12 border border-hairline bg-transparent px-4 text-sm focus:border-primary outline-none";

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <div className="mb-10">
        <p className="eyebrow mb-2">Configuration</p>
        <h1 className="font-serif text-3xl md:text-4xl">Settings</h1>
      </div>

      <section className="border border-hairline bg-card p-6 md:p-8 mb-6">
        <h2 className="font-serif text-xl mb-6">General</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Store Name"><input value={general.store_name} onChange={(e) => setGeneral({ ...general, store_name: e.target.value })} className={inp} /></Field>
          <Field label="Currency">
            <select
              value={general.currency}
              onChange={(e) => {
                const c = CURRENCIES.find((x) => x.code === e.target.value);
                setGeneral({ ...general, currency: e.target.value, locale: c?.locale ?? general.locale });
              }}
              className={inp}
            >
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Support Email"><input type="email" value={general.support_email} onChange={(e) => setGeneral({ ...general, support_email: e.target.value })} className={inp} /></Field>
          <Field label="Locale"><input value={general.locale} onChange={(e) => setGeneral({ ...general, locale: e.target.value })} className={inp} placeholder="en-IN" /></Field>
          <Field label="Tagline" className="sm:col-span-2"><input value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} className={inp} /></Field>
        </div>
      </section>

      <section className="border border-hairline bg-card p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl mb-6">Shipping ({general.currency})</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <Field label="Free Shipping Over"><input type="number" min="0" value={shipping.free_shipping_threshold} onChange={(e) => setShipping({ ...shipping, free_shipping_threshold: +e.target.value })} className={inp} /></Field>
          <Field label="Standard Rate"><input type="number" min="0" value={shipping.standard_rate} onChange={(e) => setShipping({ ...shipping, standard_rate: +e.target.value })} className={inp} /></Field>
          <Field label="Express Rate"><input type="number" min="0" value={shipping.express_rate} onChange={(e) => setShipping({ ...shipping, express_rate: +e.target.value })} className={inp} /></Field>
        </div>
      </section>

      <button onClick={save} disabled={busy} className="btn-primary">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Settings
      </button>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="eyebrow block mb-2">{label}</label>
      {children}
    </div>
  );
}
