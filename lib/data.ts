import { GENERATED_PRODUCTS } from "./generated-products";

export interface Product {
  id: string;
  name: string;
  category: "women" | "men";
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  sizes: string[];
  images: [string, string]; // [primary, hover]
  featured?: boolean;
  isNew?: boolean;
  trending?: boolean;
}

export const CATEGORIES = {
  women: [
    "Coats & Jackets",
    "Knitwear",
    "Dresses",
    "Trousers",
    "Shirts & Blouses",
    "Accessories",
  ],
  men: [
    "Outerwear",
    "Knitwear",
    "Tailoring",
    "Trousers",
    "Shirts",
    "Accessories",
  ],
} as const;

export const BASE_PRODUCTS: Product[] = [
  // ===================== WOMEN'S COLLECTION (12) =====================
  {
    id: "cashmere-belted-coat",
    name: "Pure Cashmere Belted Overcoat",
    category: "women",
    subcategory: "Coats & Jackets",
    price: 380,
    compareAtPrice: 460,
    description: "Tailored in Florence from double-faced brushed Mongolian cashmere. Features generous notch lapels, dropped shoulders, and a self-fabric tie belt for an effortless cinched silhouette.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: true,
  },
  {
    id: "ribbed-wool-turtleneck",
    name: "Ribbed Merino Turtleneck",
    category: "women",
    subcategory: "Knitwear",
    price: 145,
    description: "Spun from superfine Australian Merino wool with an accordion rib structure. Lightweight yet insulating, perfect for modular seasonal layering.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: true,
    trending: false,
  },
  {
    id: "silk-slip-dress-noir",
    name: "Bias-Cut Mulberry Silk Slip",
    category: "women",
    subcategory: "Dresses",
    price: 220,
    compareAtPrice: 280,
    description: "Crafted from heavy 22mm Mulberry silk charmeuse cut on the bias to drape gracefully over the body. Features a clean scoop neckline and adjustable French rouleau straps.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "pleated-wide-leg-trousers-sand",
    name: "High-Rise Pleated Wide-Leg Trousers",
    category: "women",
    subcategory: "Trousers",
    price: 175,
    description: "Woven from a structured wool-lyocell twill in warm sand. Designed with deep front pleats, slant pockets, and a fluid wide leg that pools slightly at the shoe.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    ],

    featured: true,
    isNew: false,
    trending: false,
  },
  {
    id: "oversized-poplin-shirt-bone",
    name: "Relaxed Organic Poplin Shirt",
    category: "women",
    subcategory: "Shirts & Blouses",
    price: 120,
    description: "Crisp 100% GOTS-certified organic cotton poplin tailored with an architectural back box pleat, elongated cuffs, and genuine mother-of-pearl buttons.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "structured-wool-trench",
    name: "Double-Breasted Wool Trench",
    category: "women",
    subcategory: "Coats & Jackets",
    price: 340,
    description: "An architectural interpretation of the classic trench coat in heavy virgin wool. Features storm flaps, raglan sleeves, horn buttons, and an inverted back box pleat.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: false,
  },
  {
    id: "cable-knit-cashmere-crew",
    name: "Chunky Cable-Knit Crewneck",
    category: "women",
    subcategory: "Knitwear",
    price: 260,
    compareAtPrice: 320,
    description: "Hand-finished 5-gauge cable knit sweater in un-dyed ecru cashmere. Substantial warmth with a cloud-soft hand feel and ribbed trims.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: false,
    trending: true,
  },
  {
    id: "sculptural-crepe-maxi-dress",
    name: "Column Crepe Maxi Dress",
    category: "women",
    subcategory: "Dresses",
    price: 240,
    description: "Cut from weighty Japanese crepe that skims the silhouette without clinging. Features a high boat neckline, clean darts, and an alluring low back slit.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: false,
  },
  {
    id: "tailored-cigarette-trousers",
    name: "Cropped Wool Cigarette Trousers",
    category: "women",
    subcategory: "Trousers",
    price: 160,
    description: "Sharp mid-rise trousers crafted in Italian stretch wool flannel. Tailored with neat pressed creases, concealed side zip, and subtle ankle vents.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    ],

    featured: false,
    isNew: false,
    trending: false,
  },
  {
    id: "draped-silk-halter-blouse",
    name: "Draped Mulberry Silk Halter",
    category: "women",
    subcategory: "Shirts & Blouses",
    price: 155,
    compareAtPrice: 190,
    description: "Flowing silk top with an artful high-neck cowl drape that ties delicately at the nape. Seamless edges and a lustrous liquid sheen.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "minimalist-leather-tote",
    name: "Structured Calfskin Shopper Tote",
    category: "women",
    subcategory: "Accessories",
    price: 290,
    description: "Handcrafted from vegetable-tanned Italian calf leather with micro-painted edges, suede lining, interior zip pouch, and magnetic tab closure.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: true,
  },
  {
    id: "fine-cashmere-scarf",
    name: "Fringed Cashmere Wrap Scarf",
    category: "women",
    subcategory: "Accessories",
    price: 110,
    description: "Woven in Scotland on traditional looms from 100% fine spun cashmere. Generously proportioned with delicate eyelash fringe along the hem.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: false,
  },

  // ===================== MEN'S COLLECTION (12) =====================
  {
    id: "wool-cashmere-overcoat-camel",
    name: "Tailored Wool-Cashmere Overcoat",
    category: "men",
    subcategory: "Outerwear",
    price: 395,
    compareAtPrice: 480,
    description: "Constructed from an Italian wool-cashmere blend with a clean fly front, welt pockets, full cupro lining, and single back vent for unrestricted movement.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: true,
  },
  {
    id: "merino-half-zip-sweater",
    name: "Extra-Fine Merino Half-Zip Pullover",
    category: "men",
    subcategory: "Knitwear",
    price: 165,
    description: "Spun from 19.5-micron Italian Merino wool with a brushed silver metal zip, mock neck collar, and reinforced rib knit hems.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: true,
    trending: false,
  },
  {
    id: "unstructured-linen-blazer",
    name: "Unstructured Wool-Linen Blazer",
    category: "men",
    subcategory: "Tailoring",
    price: 310,
    compareAtPrice: 380,
    description: "Crafted without canvassing or shoulder pads for an effortless Italian sprezzatura feel. Patch pockets, double vented back, and notch lapels.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "pleated-tailored-trousers-charcoal",
    name: "Relaxed Pleated Wool Trousers",
    category: "men",
    subcategory: "Trousers",
    price: 180,
    description: "Woven in Yorkshire from resilient tropical wool. Designed with twin inward-facing pleats, side waist adjusters, and a softly tapered leg.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: false,
  },
  {
    id: "egyptian-cotton-oxford-shirt",
    name: "Supima Cotton Button-Down Shirt",
    category: "men",
    subcategory: "Shirts",
    price: 130,
    description: "Crafted from long-staple Supima cotton with a relaxed rolled button-down collar, single chest pocket, and rounded mother-of-pearl buttons.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "shearling-collar-bomber",
    name: "Water-Repellent Wool Bomber",
    category: "men",
    subcategory: "Outerwear",
    price: 360,
    description: "Modern bomber silhouette engineered in dense double-weave wool with a detachable genuine shearling collar, two-way zipper, and storm cuffs.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: false,
  },
  {
    id: "chunky-ribbed-fisherman-sweater",
    name: "Heavy Ribbed Fisherman Knit",
    category: "men",
    subcategory: "Knitwear",
    price: 195,
    compareAtPrice: 240,
    description: "Inspired by seafaring knits, crafted in heavy British wool with a rugged cardigan rib stitch, saddle shoulders, and snug ribbed collar.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: false,
    trending: true,
  },
  {
    id: "modern-suit-jacket-navy",
    name: "Structured Minimalist Suit Jacket",
    category: "men",
    subcategory: "Tailoring",
    price: 340,
    description: "Clean two-button tailored jacket in high-twist Italian wool twill that resists creasing. Flap pockets, chest welt, and kissing four-button cuffs.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: false,
  },
  {
    id: "heavy-cotton-drawstring-trousers",
    name: "Tapered Cotton Chino Trousers",
    category: "men",
    subcategory: "Trousers",
    price: 140,
    description: "Substantial garment-dyed combed cotton drill with an internal drawstring waist, zip fly, front slant pockets, and subtle rear welt pockets.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: false,
    trending: false,
  },
  {
    id: "camp-collar-silk-linen-shirt",
    name: "Silk-Linen Camp Collar Shirt",
    category: "men",
    subcategory: "Shirts",
    price: 150,
    compareAtPrice: 185,
    description: "Textured weave combining natural linen with Mulberry silk for breathability and refined drape. Features an open camp collar and straight hem with side splits.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: true,
  },
  {
    id: "pebbled-leather-weekend-bag",
    name: "Full-Grain Pebbled Leather Holdall",
    category: "men",
    subcategory: "Accessories",
    price: 390,
    description: "Crafted from durable vegetable-tanned grain calfskin. Features reinforced handles, detachable webbing shoulder strap, solid brass hardware, and interior laptop divider.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
    isNew: false,
    trending: true,
  },
  {
    id: "ribbed-cashmere-beanie",
    name: "Architectural Cashmere Beanie",
    category: "men",
    subcategory: "Accessories",
    price: 85,
    description: "Knitted from 100% pure Scottish cashmere with a 7-gauge fisherman rib and adjustable turn-up brim for bespoke styling.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    ],
    featured: false,
    isNew: true,
    trending: false,
  },
];

// Merged active catalog: BASE_PRODUCTS + GENERATED_PRODUCTS.
// To switch to generated-only mode, replace the line below with: export const PRODUCTS: Product[] = GENERATED_PRODUCTS;
export const PRODUCTS: Product[] = [...BASE_PRODUCTS, ...GENERATED_PRODUCTS];

/**
 * Returns available subcategories for the given category based on the ACTIVE catalogue.
 * Curated CATEGORIES order is prioritized, followed by any custom subcategories.
 */
export function subcategoriesFor(category: "women" | "men"): string[] {
  const activeSubs = new Set(
    PRODUCTS.filter((p) => p.category === category).map((p) => p.subcategory)
  );

  const curated = CATEGORIES[category] || [];
  const ordered: string[] = [];

  // Add curated subcategories that actually exist in active products
  for (const sub of curated) {
    if (activeSubs.has(sub)) {
      ordered.push(sub);
      activeSubs.delete(sub);
    }
  }

  // Append any extra subcategories from custom/imported listings
  for (const extra of activeSubs) {
    ordered.push(extra);
  }

  return ordered;
}

