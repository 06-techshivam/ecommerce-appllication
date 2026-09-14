import React from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { subcategoriesFor } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { ListingControls } from "@/components/ListingControls";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Men's Collection | ZENVORA",
  description:
    "Explore the ZENVORA men's wardrobe. Italian wool tailoring, unstructured blazers, cashmere knitwear, and structured outerwear.",
};

interface PageProps {
  searchParams: Promise<{ sub?: string; sort?: string }>;
}

export default async function MenPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeSubcategory = resolvedParams.sub;
  const activeSort = resolvedParams.sort || "featured";

  const subcategories = subcategoriesFor("men");
  const products = await getProducts({
    category: "men",
    subcategory: activeSubcategory,
    sort: activeSort,
  });

  return (
    <div className="site-container section-sm">
      {/* Editorial Header */}
      <div className="listing-header">
        <span className="section-eyebrow">Collection</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Men&apos;s Wardrobe
        </h1>
        <p className="body-large" style={{ maxWidth: "680px", marginTop: "0.5rem" }}>
          Sprezzatura tailoring and understated leisurewear engineered in pure Italian wools,
          raw silk blends, and un-dyed Scottish cashmere.
        </p>
      </div>

      {/* Filter and Sort Controls */}
      <ListingControls
        basePath="/men"
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
          <a href="/men" className="btn btn-outline" style={{ marginTop: "1rem" }}>
            Reset Filters
          </a>
        </div>
      )}
    </div>
  );
}

