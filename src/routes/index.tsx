import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroJacket from "@/assets/hero-jacket.jpg";
import heritageImg from "@/assets/heritage.jpg";
import { useProducts, useSectionMap, useSiteSettings } from "@/lib/storefront";
import { currency } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quietly extraordinary." },
      { name: "description", content: "Atelier-crafted pieces redefining quiet luxury." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: settings } = useSiteSettings();
  const { map } = useSectionMap();
  const { data: featured = [] } = useProducts({ featuredOnly: true });
  const { data: all = [] } = useProducts();
  const essentials = (featured.length > 0 ? featured : all).slice(0, 4);
  const storeName = settings?.general.store_name ?? "AESTHETE";

  const hero = map.hero;
  const heritage = map.heritage;
  const featuredIntro = map.featured_intro;
  const newsletter = map.newsletter;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {hero?.visible !== false && (
          <section className="relative overflow-hidden bg-surface-dim/40">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
              <div className="animate-fade-up">
                <p className="eyebrow mb-6">{hero?.subtitle || `${storeName} · L'Atelier`}</p>
                <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight">
                  {hero?.title || "The Architectural Silhouette"}
                </h1>
                {hero?.body && (
                  <p className="mt-8 text-ink-soft max-w-md leading-relaxed">{hero.body}</p>
                )}
                <div className="mt-10 flex flex-wrap gap-3">
                  {hero?.cta_label && (
                    <Link to={hero.cta_url || "/collections"} className="btn-primary">
                      {hero.cta_label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="relative aspect-[4/5] md:aspect-square bg-gradient-to-b from-neutral-200 to-neutral-300 rounded-sm overflow-hidden">
                <img src={hero?.image_url || heroJacket} alt={hero?.title || "Hero"} className="absolute inset-0 w-full h-full object-cover animate-float" width={1280} height={1280} />
              </div>
            </div>
          </section>
        )}

        {heritage?.visible !== false && (
          <section className="bg-[#1a1a1a] text-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="eyebrow mb-5 !text-white/50">{heritage?.subtitle || "The Heritage"}</p>
                <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">
                  {heritage?.title || "Crafted for Eternity"}
                </h2>
                {heritage?.body && (
                  <p className="mt-8 text-white/70 leading-relaxed max-w-md">{heritage.body}</p>
                )}
              </div>
              <div className="relative">
                <img src={heritage?.image_url || heritageImg} alt={heritage?.title || "Heritage"} className="w-full aspect-[4/3] object-cover rounded-sm grayscale" loading="lazy" width={1024} height={768} />
              </div>
            </div>
          </section>
        )}

        {featuredIntro?.visible !== false && (
          <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow mb-3">{featuredIntro?.subtitle || "The Selection"}</p>
                <h2 className="font-serif text-4xl md:text-5xl">{featuredIntro?.title || "Featured Pieces"}</h2>
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
                    <p className="text-sm text-ink-soft mt-0.5">{currency(p.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {newsletter?.visible !== false && (
          <section className="bg-surface-dim/50">
            <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
              <p className="eyebrow mb-4">{newsletter?.subtitle || "Inner Circle"}</p>
              <h2 className="font-serif text-4xl md:text-5xl">{newsletter?.title || "Join the Atelier"}</h2>
              {newsletter?.body && <p className="text-ink-soft mt-4">{newsletter.body}</p>}
              <form className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email Address" className="flex-1 px-5 py-4 bg-white border border-hairline rounded-sm text-sm focus:outline-none focus:border-primary" />
                <button className="btn-primary justify-center">{newsletter?.cta_label || "Subscribe"}</button>
              </form>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
