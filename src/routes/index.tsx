import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroJacket from "@/assets/hero-jacket.jpg";
import coatImg from "@/assets/collection-coat.jpg";
import bagImg from "@/assets/collection-bag.jpg";
import atelierImg from "@/assets/collection-atelier.jpg";
import eveningImg from "@/assets/collection-evening.jpg";
import heritageImg from "@/assets/heritage.jpg";
import { useProducts, useSiteSettings } from "@/lib/storefront";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AESTHETE — Quiet Luxury & Digital Craftsmanship" },
      { name: "description", content: "AESTHETE is a luxury fashion atelier redefining quiet luxury through immersive digital craftsmanship." },
      { property: "og:title", content: "AESTHETE — Quiet Luxury & Digital Craftsmanship" },
      { property: "og:description", content: "Explore the AESTHETE atelier — tailored silhouettes, hand-finished pieces, and immersive 3D product experiences." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: settings } = useSiteSettings();
  const { data: featured = [] } = useProducts({ featuredOnly: true });
  const { data: all = [] } = useProducts();
  const essentials = (featured.length > 0 ? featured : all).slice(0, 4);
  const storeName = settings?.general.store_name ?? "AESTHETE";
  const tagline = settings?.general.tagline ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* HERO */}
        <section className="relative overflow-hidden bg-surface-dim/40">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-up">
              <p className="eyebrow mb-6">{storeName} · L'Atelier Series 01</p>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight">
                The <br /> Architectural <br />
                <em className="italic font-normal">Silhouette</em>
              </h1>
              <p className="mt-8 text-ink-soft max-w-md leading-relaxed">
                {tagline || "Exploring the intersection of structural engineering and high-performance tailoring. A jacket designed for the modern visionary."}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/collections" className="btn-primary">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="btn-ghost">Watch Runway</button>
              </div>
            </div>
            <div className="relative aspect-[4/5] md:aspect-square bg-gradient-to-b from-neutral-200 to-neutral-300 rounded-sm overflow-hidden">
              <img src={heroJacket} alt="Architectural silhouette jacket" className="absolute inset-0 w-full h-full object-cover animate-float" width={1280} height={1280} />
            </div>
          </div>
        </section>

        {/* FEATURED COLLECTIONS */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Curation</p>
              <h2 className="font-serif text-4xl md:text-5xl">Featured Collections</h2>
            </div>
            <Link to="/collections" className="nav-link hidden md:inline-block">View Archive →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <Link to="/collections" className="md:col-span-2 group relative aspect-[16/10] overflow-hidden rounded-sm">
              <img src={coatImg} alt="The Monochrome Edit" className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" loading="lazy" width={1024} height={768} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="font-serif text-2xl tracking-wide">THE MONOCHROME EDIT</h3>
                <p className="text-sm opacity-80 mt-1 max-w-sm">A study in texture and single-tone layering for the transition between seasons.</p>
              </div>
            </Link>
            <Link to="/collections" className="group relative aspect-[16/10] md:aspect-auto overflow-hidden rounded-sm bg-neutral-900">
              <img src={bagImg} alt="Leather goods" className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" loading="lazy" width={768} height={768} />
              <span className="absolute top-6 left-6 px-3 py-1.5 glass text-[10px] tracking-[0.2em] uppercase rounded-sm">{storeName}</span>
            </Link>
            <Link to="/collections" className="group relative aspect-[16/10] overflow-hidden rounded-sm">
              <img src={atelierImg} alt="Coming soon" className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" loading="lazy" width={768} height={512} />
              <span className="absolute top-6 left-6 px-3 py-1.5 glass text-[10px] tracking-[0.2em] uppercase rounded-sm">Coming Soon</span>
            </Link>
            <Link to="/collections" className="md:col-span-2 group relative aspect-[16/10] overflow-hidden rounded-sm">
              <img src={eveningImg} alt="Evening Formal" className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" loading="lazy" width={1024} height={512} />
              <div className="absolute top-10 left-10 max-w-xs glass p-6 rounded-sm">
                <h3 className="font-serif text-xl mb-2">Evening Formal</h3>
                <p className="text-xs text-ink-soft mb-3">Precision-cut silhouettes for the modern gala.</p>
                <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Discover →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* HERITAGE */}
        <section className="bg-[#1a1a1a] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow mb-5 !text-white/50">The Heritage</p>
              <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
                Crafted for <br /><em className="italic font-normal">Eternity</em>
              </h2>
              <p className="mt-8 text-white/70 leading-relaxed max-w-md">
                At {storeName}, we believe luxury isn't a price point, it's a philosophy. Every garment is born in our Milanese atelier, where traditional hand-stitching meets advanced structural modeling.
              </p>
            </div>
            <div className="relative">
              <img src={heritageImg} alt="Master tailor at work" className="w-full aspect-[4/3] object-cover rounded-sm grayscale" loading="lazy" width={1024} height={768} />
            </div>
          </div>
        </section>

        {/* ESSENTIAL PIECES */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">The Selection</p>
              <h2 className="font-serif text-4xl md:text-5xl">{featured.length > 0 ? "Featured Pieces" : "Essential Pieces"}</h2>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          {essentials.length === 0 ? (
            <p className="text-ink-soft text-sm">No products published yet. Add some from the Atelier console.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {essentials.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.slug }} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" width={768} height={1024} />
                    ) : <div className="w-full h-full bg-surface-dim" />}
                  </div>
                  <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
                  <p className="text-sm font-medium mt-1">{p.name}</p>
                  <p className="text-sm text-ink-soft mt-0.5">${Number(p.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* NEWSLETTER */}
        <section className="bg-surface-dim/50">
          <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
            <p className="eyebrow mb-4">Inner Circle</p>
            <h2 className="font-serif text-4xl md:text-5xl">Join the Atelier</h2>
            <p className="text-ink-soft mt-4">Be the first to experience new collections and exclusive artisan collaborations.</p>
            <form className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your Email Address" className="flex-1 px-5 py-4 bg-white border border-hairline rounded-sm text-sm focus:outline-none focus:border-primary" />
              <button className="btn-primary justify-center">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
