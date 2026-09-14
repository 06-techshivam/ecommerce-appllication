"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { CloseIcon, ShoppingBagIcon } from "./Icons";
import { SafeImage } from "./SafeImage";
import { money } from "@/lib/format";

interface QuickAddModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }

    addItem(product, selectedSize, 1);
    showToast("Added to shopping bag", `${product.name} — Size ${selectedSize}`);
    setSelectedSize("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CloseIcon size={20} />
        </button>

        <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "90px", height: "120px", position: "relative", flexShrink: 0, overflow: "hidden", backgroundColor: "var(--bg-subtle)" }}>
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="90px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.3rem" }}>
            <span className="micro-caps">{product.subcategory}</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 500 }}>{product.name}</h3>
            <div className="product-card-prices">
              <span className="product-card-price">{money(product.price)}</span>
              {product.compareAtPrice && (
                <span className="product-card-compare">
                  {money(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="size-selector-wrap" style={{ marginBottom: "1.5rem" }}>
          <div className="size-selector-header">
            <span className="form-label">Select Size</span>
            {error && <span className="form-error-msg">{error}</span>}
          </div>

          <div className="size-options-grid">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`size-btn ${selectedSize === size ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedSize(size);
                  setError("");
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={handleAddToCart}
        >
          <ShoppingBagIcon size={16} />
          Add to Bag
        </button>
      </div>
    </div>
  );
}

