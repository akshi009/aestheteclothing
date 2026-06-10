import { Instagram, Twitter, Send } from "lucide-react";
import { useSiteSettings, useNavItems } from "@/lib/storefront";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: nav = [] } = useNavItems("footer");
  const storeName = settings?.general.store_name ?? "AESTHETE";
  const tagline = settings?.general.tagline ?? "High-end luxury fashion prioritizing quiet luxury and digital craftsmanship.";
  const supportEmail = settings?.general.support_email;
  return (
    <footer className="border-t border-hairline bg-surface-dim/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-xl tracking-[0.18em] font-bold mb-4 uppercase">{storeName}</p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-[220px]">{tagline}</p>
          {supportEmail && <p className="text-xs text-ink-soft mt-3">{supportEmail}</p>}
        </div>
        <div>
          <p className="eyebrow mb-5">Client Services</p>
          <ul className="space-y-3 text-sm">
            {nav.length === 0 && <li className="text-ink-soft text-xs">Manage in admin → Navigation</li>}
            {nav.map((item) => (
              <li key={item.id}>
                <a href={item.url} target={item.open_new_tab ? "_blank" : undefined} rel={item.open_new_tab ? "noreferrer" : undefined} className="hover:opacity-60 transition">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5">Visit</p>
          <ul className="space-y-3 text-sm text-ink-soft">
            <li>Mumbai</li><li>Delhi</li><li>Bengaluru</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5">Social</p>
          <div className="flex gap-3">
            {[Instagram, Twitter, Send].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition">
                <Icon className="w-4 h-4 stroke-[1.5]" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-6 flex flex-wrap justify-between text-xs text-ink-soft tracking-wider">
          <span>© {new Date().getFullYear()} {storeName.toUpperCase()}. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </footer>
  );
}
