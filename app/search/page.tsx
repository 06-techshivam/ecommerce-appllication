import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Search Results | ZENVORA",
  description: "Search results across the ZENVORA collection.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const products = await getProducts({ query });

  return (
    <div className="site-container section-sm">
      <div className="listing-header">
        <span className="section-eyebrow">Search Results</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          {query ? `"${query}"` : "All Pieces"}
        </h1>
        <p className="body-regular" style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
          Found {products.length} {products.length === 1 ? "piece" : "pieces"} matching your query.
        </p>
      </div>

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
          <h3 className="heading-3">No results found for &ldquo;{query}&rdquo;</h3>
          <p className="body-regular" style={{ maxWidth: "420px" }}>
            Try refining your search terms or explore our curated collections.
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/women" className="btn btn-outline">
              Shop Women
            </Link>
            <Link href="/men" className="btn btn-outline">
              Shop Men
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

