export type BlockField =
  | "title" | "subtitle" | "body" | "image" | "video" | "cta_label" | "cta_url";

export type BlockTypeDef = {
  type: string;
  label: string;
  description: string;
  fields: BlockField[];
  defaults?: { title?: string; subtitle?: string; body?: string; cta_label?: string; cta_url?: string };
  // extra JSON config – for things like testimonials items, product limit
  extraEditor?: "testimonials" | "product_limit" | "html";
};

export const BLOCK_TYPES: BlockTypeDef[] = [
  {
    type: "hero",
    label: "Hero Banner",
    description: "Large opening section with headline, image or video, and CTA.",
    fields: ["subtitle", "title", "body", "cta_label", "cta_url", "image", "video"],
    defaults: { title: "Your Headline", subtitle: "Eyebrow", cta_label: "Shop now", cta_url: "/collections" },
  },
  {
    type: "heritage",
    label: "Story / Heritage (Dark)",
    description: "Dark editorial block with image and copy.",
    fields: ["subtitle", "title", "body", "image"],
    defaults: { title: "Our Story", subtitle: "Heritage" },
  },
  {
    type: "featured_products",
    label: "Featured Products",
    description: "Grid of products marked as Featured.",
    fields: ["subtitle", "title"],
    defaults: { title: "Featured", subtitle: "The Selection" },
    extraEditor: "product_limit",
  },
  {
    type: "best_sellers",
    label: "Best Sellers",
    description: "Grid of most recent active products.",
    fields: ["subtitle", "title"],
    defaults: { title: "Best Sellers", subtitle: "Most Loved" },
    extraEditor: "product_limit",
  },
  {
    type: "categories",
    label: "Shop by Category",
    description: "Tiles of product categories.",
    fields: ["subtitle", "title"],
    defaults: { title: "Shop by Category", subtitle: "Browse" },
  },
  {
    type: "offer",
    label: "Offer / Promotion",
    description: "Promotional banner with image and CTA.",
    fields: ["subtitle", "title", "body", "cta_label", "cta_url", "image"],
    defaults: { title: "Limited Offer", subtitle: "Promotion", cta_label: "Shop now", cta_url: "/collections" },
  },
  {
    type: "testimonials",
    label: "Reviews & Testimonials",
    description: "Customer reviews with names, ratings and avatars.",
    fields: ["subtitle", "title"],
    defaults: { title: "What our customers say", subtitle: "Loved by many" },
    extraEditor: "testimonials",
  },
  {
    type: "video",
    label: "Video Banner",
    description: "Full-width video with optional caption.",
    fields: ["subtitle", "title", "body", "video", "image"],
    defaults: { title: "Watch the film", subtitle: "Film" },
  },
  {
    type: "newsletter",
    label: "Newsletter Signup",
    description: "Email capture block.",
    fields: ["subtitle", "title", "body", "cta_label"],
    defaults: { title: "Join our circle", subtitle: "Newsletter", cta_label: "Subscribe" },
  },
  {
    type: "image_banner",
    label: "Image Banner",
    description: "Edge-to-edge image with optional headline and CTA.",
    fields: ["title", "subtitle", "cta_label", "cta_url", "image"],
  },
  {
    type: "custom_html",
    label: "Custom Content",
    description: "Free-form HTML content block.",
    fields: ["title", "body"],
    extraEditor: "html",
  },
];

export const blockTypeMap: Record<string, BlockTypeDef> = Object.fromEntries(
  BLOCK_TYPES.map((b) => [b.type, b]),
);
