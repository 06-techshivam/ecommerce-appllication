/**
 * ============================================================================
 * ZENVORA API SERVICE LAYER — INSFORGE BACKEND INTEGRATION
 * ============================================================================
 * 
 * All page and component data fetching is routed through this module.
 * Queries are executed against the live InsForge Postgres `products` table.
 * Exact function signatures and returned types (Product, Product[]) are preserved.
 * ============================================================================
 */

import { insforge } from "./insforge";
import type { Product } from "./data";

export type { Product };

export interface GetProductsOptions {
  category?: "women" | "men";
  subcategory?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | string;
  query?: string;
  limit?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    description: row.description,
    sizes: Array.isArray(row.sizes)
      ? row.sizes
      : typeof row.sizes === "string"
      ? JSON.parse(row.sizes)
      : [],
    images: (() => {
      const raw = Array.isArray(row.images)
        ? (row.images as [string, string])
        : typeof row.images === "string"
        ? JSON.parse(row.images)
        : ["", ""];
      return raw.map((img: string) => {
        if (typeof img === "string" && img.includes("1509631179647-0177331693ae")) {
          return "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80";
        }
        return img;
      }) as [string, string];
    })(),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    trending: Boolean(row.trending),
  };
}

/**
 * Retrieves products matching optional category, subcategory, search query, and sorting criteria from InsForge.
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  try {
    const { category, subcategory, sort = "featured", query, limit } = options;

    let queryBuilder = insforge.database.from("products").select("*");

    // Filter by category ("women" | "men")
    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    // Filter by subcategory
    if (subcategory) {
      queryBuilder = queryBuilder.eq("subcategory", subcategory);
    }

    // Filter by search query across name, description, and subcategory
    if (query && query.trim() !== "") {
      const q = query.trim();
      queryBuilder = queryBuilder.or(`name.ilike.%${q}%,description.ilike.%${q}%,subcategory.ilike.%${q}%`);
    }

    // Sort results
    switch (sort) {
      case "price-asc":
        queryBuilder = queryBuilder.order("price", { ascending: true });
        break;
      case "price-desc":
        queryBuilder = queryBuilder.order("price", { ascending: false });
        break;
      case "newest":
        queryBuilder = queryBuilder.order("is_new", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "featured":
      default:
        queryBuilder = queryBuilder.order("featured", { ascending: false }).order("created_at", { ascending: false });
        break;
    }

    if (limit && limit > 0) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const { data, error } = await queryBuilder;
    if (error || !data) {
      console.warn("Failed to fetch products from InsForge:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapRowToProduct);
  } catch (err) {
    console.error("getProducts error:", err);
    return [];
  }
}

/**
 * Retrieves a single product by its unique slug ID from InsForge.
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return mapRowToProduct(data[0]);
  } catch (err) {
    console.error(`getProductById error for ${id}:`, err);
    return null;
  }
}

/**
 * Retrieves products marked as featured from InsForge.
 */
export async function getFeatured(limit = 8): Promise<Product[]> {
  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("featured", true)
      .limit(limit);

    if (error || !data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapRowToProduct);
  } catch (err) {
    console.error("getFeatured error:", err);
    return [];
  }
}

/**
 * Retrieves products marked as new arrivals from InsForge.
 */
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("is_new", true)
      .limit(limit);

    if (error || !data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapRowToProduct);
  } catch (err) {
    console.error("getNewArrivals error:", err);
    return [];
  }
}

/**
 * Retrieves products marked as trending from InsForge.
 */
export async function getTrending(limit = 8): Promise<Product[]> {
  try {
    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("trending", true)
      .limit(limit);

    if (error || !data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(mapRowToProduct);
  } catch (err) {
    console.error("getTrending error:", err);
    return [];
  }
}

/**
 * Retrieves related products for a given product ID (same category/subcategory, excluding self) from InsForge.
 */
export async function getRelated(id: string, limit = 4): Promise<Product[]> {
  try {
    const current = await getProductById(id);
    if (!current) return [];

    const { data, error } = await insforge.database
      .from("products")
      .select("*")
      .eq("category", current.category)
      .neq("id", id)
      .limit(limit * 2);

    if (error || !data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates = (data as any[]).map(mapRowToProduct);

    candidates.sort((a, b) => {
      const aMatch = a.subcategory === current.subcategory ? 1 : 0;
      const bMatch = b.subcategory === current.subcategory ? 1 : 0;
      return bMatch - aMatch;
    });

    return candidates.slice(0, limit);
  } catch (err) {
    console.error(`getRelated error for ${id}:`, err);
    return [];
  }
}
