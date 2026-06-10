import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCmsPage } from "@/lib/storefront";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/p/$slug")({
  component: PageView,
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Page not found.</div>,
});

function PageView() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useCmsPage(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink-soft" />
      </div>
    );
  }
  if (!data) throw notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 md:pt-32 max-w-3xl mx-auto px-6 md:px-10 pb-24">
        <h1 className="font-serif text-4xl md:text-5xl mb-8">{data.title}</h1>
        <article
          className="prose prose-neutral max-w-none [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-ink-soft [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </main>
      <Footer />
    </div>
  );
}
