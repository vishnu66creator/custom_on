import hoodie from "@/assets/product-hoodie.jpg";
import tee from "@/assets/product-tee.jpg";
import mug from "@/assets/product-mug.jpg";
import polo from "@/assets/product-polo.jpg";
import oversized from "@/assets/product-oversized.jpg";

export type Category = "T-Shirts" | "Hoodies" | "Polo Shirts" | "Oversized" | "Mugs";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  colors: string[]; // hex
  sizes: string[];
  image: string;
  blurb: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "boxy-tee",
    name: "Boxy Fit Heavyweight Tee",
    category: "T-Shirts",
    price: 28,
    colors: ["#0A0A0A", "#FFFFFF", "#FF5F1F", "#1F2A44"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: tee,
    blurb: "220 GSM combed cotton. Built to be printed.",
  },
  {
    id: "essential-hoodie",
    name: "The Essential Hoodie",
    category: "Hoodies",
    price: 45,
    colors: ["#FFFFFF", "#0A0A0A", "#9CA3AF", "#FF5F1F"],
    sizes: ["S", "M", "L", "XL"],
    image: hoodie,
    blurb: "Brushed fleece interior. 400 GSM heavyweight.",
  },
  {
    id: "corporate-polo",
    name: "Corporate Piqué Polo",
    category: "Polo Shirts",
    price: 34,
    colors: ["#1F2A44", "#0A0A0A", "#FFFFFF", "#7F1D1D"],
    sizes: ["S", "M", "L", "XL"],
    image: polo,
    blurb: "Classic pique knit. Ideal for team uniforms.",
  },
  {
    id: "oversized-tee",
    name: "Drop Shoulder Oversized Tee",
    category: "Oversized",
    price: 32,
    colors: ["#F5EFE0", "#0A0A0A", "#FFFFFF"],
    sizes: ["M", "L", "XL", "XXL"],
    image: oversized,
    blurb: "Streetwear cut. Drops perfectly off the shoulder.",
  },
  {
    id: "studio-mug",
    name: "The Studio Mug",
    category: "Mugs",
    price: 18,
    colors: ["#FFFFFF", "#0A0A0A"],
    sizes: ["11oz", "15oz"],
    image: mug,
    blurb: "Matte ceramic. Dishwasher safe full-color print.",
  },
];

export const CATEGORIES: Category[] = [
  "T-Shirts",
  "Hoodies",
  "Polo Shirts",
  "Oversized",
  "Mugs",
];
