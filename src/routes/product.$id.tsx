import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ChevronDown, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProductBySlug, useProducts } from "@/lib/storefront";
import { useProductReviews } from "@/lib/orders";
import { useCart } from "@/lib/cart";
import { currency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Product | AESTHETE` },
      { name: "description", content: `Discover ${params.id} at AESTHETE.` },
    ],
  }),
  component: ProductPage,
});

const sizes = ["XS", "S", "M", "L", "XL"];

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProductBySlug(id);
  const { data: all = [] } = useProducts();
  const { data: reviews = [] } = useProductReviews(product?.id ?? null);
  const { add } = useCart();
  const [size, setSize] = useState<string>("M");
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-32 text-center text-ink-soft">Loading…</div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-32 text-center">
          <p className="text-ink-soft mb-4">Product not found.</p>
          <Link to="/collections" className="btn-primary inline-flex">Browse Collections</Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (product.stock <= 0) { toast.error("Out of stock."); return; }
    add({
      id: `${product.id}`,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url ?? "",
      size,
    });
    toast.success(`${product.name} added to bag.`);
  };

  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <p className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-8">
            <Link to="/" className="hover:opacity-60">Home</Link> /{" "}
            <Link to="/collections" className="hover:opacity-60">Collections</Link> /{" "}
            <span>{product.name}</span>
          </p>

          <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
            <div className="aspect-[4/5] overflow-hidden bg-surface-dim rounded-sm">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" width={768} height={1024} />
              ) : <div className="w-full h-full" />}
            </div>

            <div className="lg:sticky lg:top-28 self-start">
              <p className="eyebrow mb-4">{product.category}</p>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight">{product.name}</h1>
              {reviews.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <div className="flex">{[1,2,3,4,5].map((n) => <Star key={n} className={`w-4 h-4 ${n <= Math.round(avg) ? "fill-current" : "text-ink-soft"}`} />)}</div>
                  <span className="text-ink-soft">{avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
                </div>
              )}
              <p className="font-serif text-2xl mt-4">{currency(product.price)}</p>
              <p className="mt-2 text-xs tracking-[0.2em] uppercase text-ink-soft">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
              <p className="mt-8 text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>

              <div className="mt-8">
                <p className="eyebrow mb-3">Select Size</p>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(s)} className={`h-12 text-sm border ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-hairline"} hover:border-primary transition`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button onClick={handleAdd} disabled={product.stock <= 0} className="btn-primary w-full justify-center disabled:opacity-50">
                  {product.stock > 0 ? "Add to Shopping Bag" : "Sold Out"}
                </button>
                <button className="btn-ghost w-full justify-center"><Heart className="w-4 h-4" /> Wishlist</button>
              </div>

              <div className="mt-10 divide-y divide-hairline border-y border-hairline">
                {["Composition & Care", "Shipping & Returns"].map((t) => (
                  <details key={t} className="group">
                    <summary className="flex justify-between items-center py-5 cursor-pointer text-sm tracking-wide uppercase">
                      {t}
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition" />
                    </summary>
                    <p className="text-sm text-ink-soft pb-5 leading-relaxed">Crafted with traceable fibers from family-run mills.</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 md:mt-32">
            <h2 className="font-serif text-3xl md:text-4xl mb-10">Complete the Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.slug }} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />}
                  </div>
                  <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
                  <p className="text-sm font-medium mt-1 truncate">{p.name}</p>
                  <p className="text-sm text-ink-soft mt-0.5">{currency(p.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
