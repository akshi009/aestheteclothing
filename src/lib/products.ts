import suit from "@/assets/product-suit.jpg";
import shirt from "@/assets/product-shirt.jpg";
import denim from "@/assets/product-denim.jpg";
import loafer from "@/assets/product-loafer.jpg";
import silk from "@/assets/product-silk.jpg";
import coat from "@/assets/collection-coat.jpg";
import bag from "@/assets/collection-bag.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
};

export const products: Product[] = [
  { id: "atelier-suit-04", name: "Atelier Suit No. 04", category: "Tailoring", price: 2450, image: suit, description: "A masterclass in structural tailoring. Hand-finished in our Milanese atelier from double-faced Italian wool." },
  { id: "essential-poplin-shirt", name: "Essential Poplin Shirt", category: "Essentials", price: 380, image: shirt, description: "Crisp Egyptian cotton poplin with a precision spread collar and mother-of-pearl buttons." },
  { id: "raw-selvedge-denim", name: "Raw Selvedge Denim", category: "Runway", price: 550, image: denim, description: "14oz Japanese selvedge denim with a relaxed straight cut, woven on vintage shuttle looms." },
  { id: "minimalist-loafer", name: "Minimalist Loafer", category: "Footwear", price: 890, image: loafer, description: "Hand-stitched from full-grain Italian calfskin with a sculpted leather sole." },
  { id: "bias-cut-silk-slip", name: "Bias-Cut Silk Slip Dress", category: "New Arrival", price: 920, image: silk, description: "A floor-grazing slip in heavyweight silk charmeuse, cut on the bias for fluid drape." },
  { id: "sculpted-merino-coat", name: "Sculpted Merino Wool Coat", category: "Atelier Line", price: 1850, image: coat, description: "Oversized double-faced merino with sculptural lapels and concealed horn buttons." },
  { id: "modernist-blazer", name: "Modernist Oversized Blazer", category: "Tailoring", price: 1200, image: coat, description: "A relaxed double-breasted silhouette in dry-handle wool." },
  { id: "monolith-clutch", name: "The Monolith Clutch", category: "Accessories", price: 1200, image: bag, description: "Architectural envelope clutch in vegetable-tanned tan leather with brass hardware." },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
