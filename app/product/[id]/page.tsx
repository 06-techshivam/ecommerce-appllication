import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getRelated } from "@/lib/api";
import { ProductDetailView } from "@/components/ProductDetailView";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Piece Not Found | ZENVORA",
    };
  }

  return {
    title: `${product.name} | ZENVORA`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelated(id, 4);

  return (
    <div className="site-container section-sm">
      {/* Interactive Detail View (Gallery, Sizing, Qty, Add to Bag) */}
      <ProductDetailView product={product} />

      {/* Related Products Row */}
      {relatedProducts.length > 0 && (
        <section className="section" style={{ marginTop: "4rem", borderTop: "1px solid var(--border-hairline)" }}>
          <ScrollReveal>
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">Complete The Look</span>
                <h2 className="heading-2">Complementary Pieces</h2>
              </div>
            </div>
          </ScrollReveal>

          <div className="products-grid">
            {relatedProducts.map((relProduct, idx) => (
              <ScrollReveal key={relProduct.id} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <ProductCard product={relProduct} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

