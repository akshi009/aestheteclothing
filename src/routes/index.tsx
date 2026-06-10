import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useHomepageSections } from "@/lib/storefront";
import { HomepageBlock } from "@/components/HomepageBlocks";

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
  const { data: sections = [] } = useHomepageSections({ onlyVisible: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {sections.length === 0 ? (
          <div className="max-w-2xl mx-auto px-6 py-32 text-center">
            <p className="eyebrow mb-3">Welcome</p>
            <h1 className="font-serif text-4xl mb-4">No homepage blocks yet</h1>
            <p className="text-ink-soft">Add sections from Admin → Homepage to start building your storefront.</p>
          </div>
        ) : (
          sections.map((s) => <HomepageBlock key={s.id} section={s} />)
        )}
      </main>
      <Footer />
    </div>
  );
}
