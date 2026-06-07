import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products } from "@/lib/products";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — The Curated Edit | AESTHETE" },
      { name: "description", content: "Browse the AESTHETE curated edit: tailored coats, silk dresses, knitwear, and accessories from our luxury atelier." },
      { property: "og:title", content: "The Curated Edit | AESTHETE" },
      { property: "og:description", content: "142 hand-selected pieces from our atelier — tailored, sustainable, made to last." },
    ],
  }),
  component: Collections,
});

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["#0a0a0a", "#f1ead6", "#3b3b3b", "#8a4a1f", "#d2cfe6"];
const categories = ["Tailored Coats", "Silk Dresses", "Knitwear", "Accessories"];

function Collections() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-32 max-w-[1440px] mx-auto px-6 md:px-10 pb-20">
        <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-4">
          <Link to="/" className="hover:opacity-60">Home</Link> / Collections
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 md:mb-16">
          <h1 className="font-serif text-5xl md:text-6xl">The Curated Edit</h1>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">{products.length * 18} Items</span>
            <span className="h-4 w-px bg-hairline" />
            <button className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase">
              Sort by: Featured <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-14">
          {/* FILTERS */}
          <aside className="space-y-10">
            <div>
              <p className="eyebrow mb-4">Category</p>
              <ul className="space-y-3">
                {categories.map((c, i) => (
                  <li key={c}>
                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                      <span className={`w-4 h-4 border ${i === 1 ? "bg-primary border-primary" : "border-hairline"} flex items-center justify-center`}>
                        {i === 1 && <span className="text-primary-foreground text-[9px]">✓</span>}
                      </span>
                      {c}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Size</p>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s, i) => (
                  <button key={s} className={`h-10 text-xs border ${i === 1 ? "border-primary" : "border-hairline"} hover:border-primary transition`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Color</p>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button key={c} className="w-7 h-7 rounded-full ring-1 ring-hairline ring-offset-2" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Price</p>
              <input type="range" min={500} max={5000} defaultValue={2400} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-ink-soft mt-2">
                <span>$500</span><span>$5,000+</span>
              </div>
            </div>
            <button className="w-full py-3 border border-hairline text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition">Clear All</button>
          </aside>

          {/* GRID */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {products.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" width={768} height={1024} />
                  </div>
                  <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
                  <p className="text-sm font-medium mt-1 truncate">{p.name}</p>
                  <p className="text-sm text-ink-soft mt-0.5">${p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
            <div className="mt-14 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 border border-hairline flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                {[1,2,3].map((n) => (
                  <button key={n} className={`w-10 h-10 border text-sm ${n === 1 ? "bg-primary text-primary-foreground border-primary" : "border-hairline"}`}>{n}</button>
                ))}
                <span className="px-2 text-ink-soft">…</span>
                <button className="w-10 h-10 border border-hairline text-sm">12</button>
                <button className="w-10 h-10 border border-hairline flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">Showing 1–{products.length} of {products.length * 18} Items</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
