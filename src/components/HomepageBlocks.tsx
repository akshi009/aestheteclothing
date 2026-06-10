import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { useProducts, useCategories, type HomepageSection } from "@/lib/storefront";
import { currency } from "@/lib/format";
import { isVideoUrl } from "@/lib/media";

export function HomepageBlock({ section }: { section: HomepageSection }) {
  switch (section.type) {
    case "hero": return <HeroBlock s={section} />;
    case "heritage": return <HeritageBlock s={section} />;
    case "featured_products": return <ProductsBlock s={section} featuredOnly />;
    case "best_sellers": return <ProductsBlock s={section} />;
    case "categories": return <CategoriesBlock s={section} />;
    case "offer": return <OfferBlock s={section} />;
    case "testimonials": return <TestimonialsBlock s={section} />;
    case "video": return <VideoBlock s={section} />;
    case "newsletter": return <NewsletterBlock s={section} />;
    case "image_banner": return <ImageBannerBlock s={section} />;
    case "custom_html": return <CustomHtmlBlock s={section} />;
    default: return null;
  }
}

function HeroBlock({ s }: { s: HomepageSection }) {
  const isVideo = !!s.video_url;
  return (
    <section className="relative overflow-hidden bg-surface-dim/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-fade-up">
          {s.subtitle && <p className="eyebrow mb-6">{s.subtitle}</p>}
          {s.title && <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight">{s.title}</h1>}
          {s.body && <p className="mt-8 text-ink-soft max-w-md leading-relaxed">{s.body}</p>}
          {s.cta_label && (
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to={(s.cta_url || "/collections") as any} className="btn-primary">
                {s.cta_label} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
        <div className="relative aspect-[4/5] md:aspect-square bg-surface-dim rounded-sm overflow-hidden">
          {isVideo ? (
            <video src={s.video_url!} poster={s.image_url ?? undefined} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : s.image_url ? (
            <img src={s.image_url} alt={s.title ?? "Hero"} className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeritageBlock({ s }: { s: HomepageSection }) {
  return (
    <section className="bg-[#1a1a1a] text-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          {s.subtitle && <p className="eyebrow mb-5 !text-white/50">{s.subtitle}</p>}
          {s.title && <h2 className="font-serif text-4xl md:text-6xl leading-[1.05]">{s.title}</h2>}
          {s.body && <p className="mt-8 text-white/70 leading-relaxed max-w-md">{s.body}</p>}
        </div>
        {s.image_url && (
          <img src={s.image_url} alt={s.title ?? "Heritage"} className="w-full aspect-[4/3] object-cover rounded-sm grayscale" loading="lazy" />
        )}
      </div>
    </section>
  );
}

function ProductsBlock({ s, featuredOnly }: { s: HomepageSection; featuredOnly?: boolean }) {
  const limit = Number(s.extra?.limit) || 4;
  const { data = [] } = useProducts({ featuredOnly, limit });
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
      <div className="mb-10">
        {s.subtitle && <p className="eyebrow mb-3">{s.subtitle}</p>}
        {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
      </div>
      {data.length === 0 ? (
        <p className="text-ink-soft text-sm">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {data.map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.slug }} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-surface-dim rounded-sm">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />}
              </div>
              <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-ink-soft">{p.category}</p>
              <p className="text-sm font-medium mt-1">{p.name}</p>
              <p className="text-sm text-ink-soft mt-0.5">{currency(p.price)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CategoriesBlock({ s }: { s: HomepageSection }) {
  const { data = [] } = useCategories();
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
      <div className="mb-10">
        {s.subtitle && <p className="eyebrow mb-3">{s.subtitle}</p>}
        {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((c) => (
          <Link key={c.name} to="/collections" search={{ category: c.name } as any} className="group relative aspect-square overflow-hidden bg-surface-dim rounded-sm">
            {c.image_url && <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />}
            <div className="absolute inset-0 bg-black/30 flex items-end p-5">
              <p className="text-white font-serif text-xl">{c.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OfferBlock({ s }: { s: HomepageSection }) {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center bg-surface-dim/60 rounded-sm">
        {s.image_url && <img src={s.image_url} alt={s.title ?? "Offer"} className="w-full aspect-[4/3] object-cover rounded-sm" loading="lazy" />}
        <div>
          {s.subtitle && <p className="eyebrow mb-4">{s.subtitle}</p>}
          {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
          {s.body && <p className="mt-6 text-ink-soft max-w-md leading-relaxed">{s.body}</p>}
          {s.cta_label && (
            <Link to={(s.cta_url || "/collections") as any} className="btn-primary mt-8">
              {s.cta_label} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function TestimonialsBlock({ s }: { s: HomepageSection }) {
  const items = (s.extra?.items ?? []) as Array<{ name: string; review: string; rating?: number; avatar?: string }>;
  return (
    <section className="bg-surface-dim/40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="mb-12 text-center">
          {s.subtitle && <p className="eyebrow mb-3">{s.subtitle}</p>}
          {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <div key={i} className="bg-card border border-hairline p-6 rounded-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating ?? 5 }).map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-ink leading-relaxed mb-6">"{t.review}"</p>
              <div className="flex items-center gap-3">
                {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                <p className="text-sm font-medium">{t.name}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-ink-soft text-sm col-span-full text-center">No reviews added yet.</p>}
        </div>
      </div>
    </section>
  );
}

function VideoBlock({ s }: { s: HomepageSection }) {
  const src = s.video_url;
  return (
    <section className="relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
        {(s.subtitle || s.title) && (
          <div className="mb-8 text-center">
            {s.subtitle && <p className="eyebrow mb-3">{s.subtitle}</p>}
            {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
          </div>
        )}
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-sm">
          {src ? (
            <video src={src} poster={s.image_url ?? undefined} controls playsInline className="w-full h-full object-cover" />
          ) : s.image_url ? (
            <img src={s.image_url} alt={s.title ?? "Video"} className="w-full h-full object-cover" />
          ) : null}
        </div>
        {s.body && <p className="text-ink-soft mt-6 text-center max-w-2xl mx-auto">{s.body}</p>}
      </div>
    </section>
  );
}

function NewsletterBlock({ s }: { s: HomepageSection }) {
  return (
    <section className="bg-surface-dim/50">
      <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
        {s.subtitle && <p className="eyebrow mb-4">{s.subtitle}</p>}
        {s.title && <h2 className="font-serif text-4xl md:text-5xl">{s.title}</h2>}
        {s.body && <p className="text-ink-soft mt-4">{s.body}</p>}
        <form className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your Email Address" className="flex-1 px-5 py-4 bg-white border border-hairline rounded-sm text-sm focus:outline-none focus:border-primary" />
          <button className="btn-primary justify-center">{s.cta_label || "Subscribe"}</button>
        </form>
      </div>
    </section>
  );
}

function ImageBannerBlock({ s }: { s: HomepageSection }) {
  const isVideo = isVideoUrl(s.image_url);
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {s.image_url && !isVideo && <img src={s.image_url} alt={s.title ?? "Banner"} className="absolute inset-0 w-full h-full object-cover" />}
      {isVideo && <video src={s.image_url!} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center text-white px-6">
        <div>
          {s.subtitle && <p className="eyebrow mb-4 !text-white/70">{s.subtitle}</p>}
          {s.title && <h2 className="font-serif text-4xl md:text-6xl">{s.title}</h2>}
          {s.cta_label && (
            <Link to={(s.cta_url || "/collections") as any} className="btn-primary mt-8 inline-flex">
              {s.cta_label} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CustomHtmlBlock({ s }: { s: HomepageSection }) {
  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-16">
      {s.title && <h2 className="font-serif text-3xl md:text-4xl mb-6">{s.title}</h2>}
      {s.body && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: s.body }} />}
    </section>
  );
}
