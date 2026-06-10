import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/lib/storefront";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — The Curated Edit | AESTHETE" },
      { name: "description", content: "Browse the curated edit of AESTHETE: tailored coats, silk dresses, knitwear, and accessories." },
      { property: "og:title", content: "The Curated Edit | AESTHETE" },
    ],
  }),
  component: Collections,
});

function Collections() {
  const { data: products = [], isLoading } = useProducts();
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    let list = category === "All" ? products : products.filter((p) => p.category === category);
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "newest") list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, sort]);

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
            <span className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">{filtered.length} Items</span>
            <span className="h-4 w-px bg-hairline" />
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="appearance-none bg-transparent pr-6 text-[11px] tracking-[0.2em] uppercase cursor-pointer focus:outline-none">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-14">
          <aside className="space-y-10">
            <div>
              <p className="eyebrow mb-4">Category</p>
              <ul className="space-y-3">
                {categories.map((c) => (
                  <li key={c}>
                    <button onClick={() => setCategory(c)} className="flex items-center gap-3 text-sm cursor-pointer group w-full text-left">
                      <span className={`w-4 h-4 border ${category === c ? "bg-primary border-primary" : "border-hairline"} flex items-center justify-center`}>
                        {category === c && <span className="text-primary-foreground text-[9px]">✓</span>}
                      </span>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => { setCategory("All"); setSort("featured"); }} className="w-full py-3 border border-hairline text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition">Clear All</button>
          </aside>

          <div>
            {isLoading ? (
              <p className="text-ink-soft text-sm">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-ink-soft text-sm">No products match your filters.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                {filtered.map((p) => (
                  <Link key={p.id} to="/product/$id" params={{ id: p.slug }} className="group">
                    <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" width={768} height={1024} />
                      ) : <div className="w-full h-full" />}
                    </div>
                    <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
                    <p className="text-sm font-medium mt-1 truncate">{p.name}</p>
                    <p className="text-sm text-ink-soft mt-0.5">${Number(p.price).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
