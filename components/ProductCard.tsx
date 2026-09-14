"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { SafeImage } from "./SafeImage";
import { QuickAddModal } from "./QuickAddModal";
import { money } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  return (
    <>
      <div className="product-card group">
        <Link href={`/product/${product.id}`} className="product-card-media">
          {/* Primary image */}
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card-img-primary"
            style={{ objectFit: "cover" }}
          />

          {/* Secondary hover image */}
          {product.images[1] && (
            <SafeImage
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className="product-card-img-hover"
              style={{ objectFit: "cover" }}
            />
          )}

          {/* Badges */}
          <div className="product-badges">
            {product.isNew && <span className="badge badge-new">New</span>}
            {hasDiscount && <span className="badge badge-sale">Sale</span>}
            {product.trending && !product.isNew && (
              <span className="badge badge-trending">Trending</span>
            )}
          </div>
        </Link>

        {/* Quick Add Button */}
        <button
          type="button"
          className="product-quick-add-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickAddOpen(true);
          }}
        >
          + Quick Add
        </button>

        {/* Product Details */}
        <div className="product-card-details">
          <span className="product-card-category">{product.subcategory}</span>
          <Link href={`/product/${product.id}`} className="product-card-title">
            {product.name}
          </Link>
          <div className="product-card-prices">
            <span className="product-card-price">{money(product.price)}</span>
            {hasDiscount && product.compareAtPrice && (
              <span className="product-card-compare">
                {money(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        product={product}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}

