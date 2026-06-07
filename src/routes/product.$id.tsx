import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Product3DViewer } from "@/components/Product3DViewer";
import { getProduct, products } from "@/lib/products";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} | AESTHETE` },
          { name: "description", content: loaderData.product.description ?? loaderData.product.name },
          { property: "og:title", content: `${loaderData.product.name} | AESTHETE` },
          { property: "og:description", content: loaderData.product.description ?? loaderData.product.name },
          { property: "og:image", content: loaderData.product.image },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">Product not found.</div>
  ),
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center">Something went wrong.</div>
  ),
  component: ProductPage,
});

const sizes = ["34", "36", "38", "40"];
const swatches = ["#f3eedf", "#0a0a0a", "#4a4441"];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

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
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 aspect-[4/5] overflow-hidden bg-surface-dim rounded-sm">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" width={768} height={1024} />
              </div>
              <div className="aspect-square overflow-hidden bg-surface-dim rounded-sm">
                <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-square overflow-hidden bg-surface-dim rounded-sm">
                <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>

            <div className="lg:sticky lg:top-28 self-start">
              <p className="eyebrow mb-4">Artisan Series / Edition 01</p>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight">{product.name}</h1>
              <p className="font-serif text-2xl mt-4">${product.price.toLocaleString()}.00</p>
              <p className="mt-8 text-ink-soft leading-relaxed">{product.description}</p>

              <div className="mt-10">
                <p className="eyebrow mb-3">Color / Ivory Shell</p>
                <div className="flex gap-3">
                  {swatches.map((c, i) => (
                    <button key={c} className={`w-9 h-9 rounded-full ring-1 ${i === 0 ? "ring-primary ring-offset-2" : "ring-hairline"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between mb-3">
                  <p className="eyebrow">Select Size / EU</p>
                  <button className="text-[10px] tracking-[0.2em] uppercase text-ink-soft underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((s, i) => (
                    <button key={s} disabled={i === 3} className={`h-12 text-sm border ${i === 1 ? "border-primary" : "border-hairline"} disabled:text-ink-soft/40 disabled:line-through hover:border-primary transition`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button className="btn-primary w-full justify-center">Add to Shopping Bag</button>
                <button className="btn-ghost w-full justify-center"><Heart className="w-4 h-4" /> Wishlist</button>
              </div>

              <div className="mt-10 divide-y divide-hairline border-y border-hairline">
                {["Composition & Care", "Shipping & Returns"].map((t) => (
                  <details key={t} className="group">
                    <summary className="flex justify-between items-center py-5 cursor-pointer text-sm tracking-wide uppercase">
                      {t}
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition" />
                    </summary>
                    <p className="text-sm text-ink-soft pb-5 leading-relaxed">100% Italian wool, dry clean only. Crafted with traceable fibers from family-run mills.</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 360 SECTION */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 md:mt-32">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Interactive Experience</p>
            <h2 className="font-serif text-3xl md:text-4xl">360° Material Exploration</h2>
          </div>
          <div className="relative aspect-[16/9] md:aspect-[16/7] bg-surface-dim rounded-sm overflow-hidden">
            <ClientViewer />
          </div>
        </section>

        {/* COMPLETE THE LOOK */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 md:mt-32">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-3xl md:text-4xl">Complete the Look</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" width={768} height={1024} />
                </div>
                <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
                <p className="text-sm font-medium mt-1 truncate">{p.name}</p>
                <p className="text-sm text-ink-soft mt-0.5">${p.price.toLocaleString()}.00</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
