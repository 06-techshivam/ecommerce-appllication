import React from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { subcategoriesFor } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { ListingControls } from "@/components/ListingControls";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Women's Collection | ZENVORA",
  description:
    "Explore the ZENVORA women's wardrobe. Tailored overcoats, pure cashmere knits, bias-cut silk, and structured trousers.",
};

interface PageProps {
  searchParams: Promise<{ sub?: string; sort?: string }>;
}

export default async function WomenPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeSubcategory = resolvedParams.sub;
  const activeSort = resolvedParams.sort || "featured";

  const subcategories = subcategoriesFor("women");
  const products = await getProducts({
    category: "women",
    subcategory: activeSubcategory,
    sort: activeSort,
  });

  return (
    <div className="site-container section-sm">
      {/* Editorial Header */}
      <div className="listing-header">
        <span className="section-eyebrow">Collection</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Women&apos;s Wardrobe
        </h1>
        <p className="body-large" style={{ maxWidth: "680px", marginTop: "0.5rem" }}>
          Quiet confidence expressed through noble natural fabrics, sculptural silhouettes,
          and meticulous European craftsmanship.
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <ListingControls
        basePath="/women"
        subcategories={subcategories}
        activeSubcategory={activeSubcategory}
        activeSort={activeSort}
        totalCount={products.length}
      />

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product, idx) => (
            <ScrollReveal key={product.id} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3 className="heading-3">No pieces found</h3>
          <p className="body-regular">
            There are currently no items matching your selected criteria.
          </p>
          <a href="/women" className="btn btn-outline" style={{ marginTop: "1rem" }}>
            Reset Filters
          </a>
        </div>
      )}
    </div>
  );
}

