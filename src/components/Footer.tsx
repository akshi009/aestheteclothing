import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Send } from "lucide-react";
import { useSiteSettings } from "@/lib/storefront";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const storeName = settings?.general.store_name ?? "AESTHETE";
  const tagline = settings?.general.tagline ?? "High-end luxury fashion prioritizing quiet luxury and digital craftsmanship.";
  const supportEmail = settings?.general.support_email;
  return (
    <footer className="border-t border-hairline bg-surface-dim/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-xl tracking-[0.18em] font-bold mb-4 uppercase">{storeName}</p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-[220px]">
            {tagline}
          </p>
          {supportEmail && <p className="text-xs text-ink-soft mt-3">{supportEmail}</p>}
        </div>
        <div>
          <p className="eyebrow mb-5">Collection</p>
          <ul className="space-y-3 text-sm">
            <li><Link to="/collections" className="hover:opacity-60 transition">All Collections</Link></li>
            <li><Link to="/collections" className="hover:opacity-60 transition">New Arrivals</Link></li>
            <li><Link to="/collections" className="hover:opacity-60 transition">Accessories</Link></li>
            <li><Link to="/collections" className="hover:opacity-60 transition">Sustainability</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5">Client Services</p>
          <ul className="space-y-3 text-sm">
            <li><a className="hover:opacity-60 transition">Atelier Services</a></li>
            <li><a className="hover:opacity-60 transition">Shipping &amp; Returns</a></li>
            <li><a className="hover:opacity-60 transition">Contact Us</a></li>
            <li><a className="hover:opacity-60 transition">Privacy Policy</a></li>
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
          <span>© 2026 {storeName.toUpperCase()}. ALL RIGHTS RESERVED.</span>
          <span className="space-x-6"><span>MILAN</span><span>PARIS</span><span>NEW YORK</span></span>
        </div>
      </div>
    </footer>
  );
}
