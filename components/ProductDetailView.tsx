"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/data";
import { SafeImage } from "./SafeImage";
import { useCart } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { ShoppingBagIcon, PlusIcon, MinusIcon, ChevronDownIcon, CheckIcon } from "./Icons";
import { money } from "@/lib/format";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState<string>("");
  const [openAccordion, setOpenAccordion] = useState<string | null>("materials");

  const images = product.images.length > 0 ? product.images : [""];

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError("Please select a size to continue");
      return;
    }

    setSizeError("");
    addItem(product, selectedSize, quantity);
    showToast(
      "Added to shopping bag",
      `${product.name} — Size ${selectedSize} (Qty: ${quantity})`
    );
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  return (
    <div className="pdp-layout">
      {/* 1. Sticky Gallery with Thumbnails */}
      <div className="pdp-gallery">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="pdp-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`pdp-thumb-btn ${activeImageIndex === idx ? "is-active" : ""}`}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
              >
                <SafeImage
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="pdp-main-image-wrap">
          <SafeImage
            src={images[activeImageIndex] || images[0]}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 820px) 100vw, 55vw"
            style={{ objectFit: "cover" }}
          />

          {/* Badges */}
          <div className="product-badges">
            {product.isNew && <span className="badge badge-new">New</span>}
            {hasDiscount && <span className="badge badge-sale">Sale</span>}
          </div>
        </div>
      </div>

      {/* 2. Product Details & Selection Column */}
      <div className="pdp-details-col">
        <div>
          <span className="section-eyebrow">{product.subcategory}</span>
          <h1 className="heading-2" style={{ marginTop: "0.4rem", marginBottom: "0.75rem" }}>
            {product.name}
          </h1>

          <div className="pdp-price-row">
            <span className="pdp-current-price">{money(product.price)}</span>
            {hasDiscount && product.compareAtPrice && (
              <span className="pdp-compare-price">{money(product.compareAtPrice)}</span>
            )}
          </div>
        </div>

        <p className="pdp-description">{product.description}</p>

        <div className="hairline-divider" />

        {/* Size Selector */}
        <div className="size-selector-wrap">
          <div className="size-selector-header">
            <span className="form-label">Size (Required)</span>
            <span className="micro-caps" style={{ color: "var(--accent-gold)" }}>
              Size Guide
            </span>
          </div>

          <div className="size-options-grid">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`size-btn ${selectedSize === size ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError("");
                }}
              >
                {size}
              </button>
            ))}
          </div>

          {sizeError && <span className="form-error-msg">{sizeError}</span>}
        </div>

        {/* Quantity Stepper & Add to Cart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="qty-selector-row">
            <div className="qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <span className="qty-val">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
            >
              <ShoppingBagIcon size={18} />
              Add to Shopping Bag
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
            <CheckIcon size={16} color="var(--accent-gold)" />
            <span>In stock and ready to dispatch within 24 hours</span>
          </div>
        </div>

        {/* Accordions (Materials, Shipping, Care) */}
        <div className="pdp-accordions">
          {/* Materials & Origin */}
          <div className="pdp-accordion-item">
            <button
              type="button"
              className="pdp-accordion-btn"
              onClick={() => toggleAccordion("materials")}
            >
              <span>Materials & Provenance</span>
              <ChevronDownIcon
                size={16}
                className={openAccordion === "materials" ? "transform rotate-180" : ""}
              />
            </button>
            {openAccordion === "materials" && (
              <div className="pdp-accordion-content">
                Meticulously crafted from selected noble fibres sourced from ethical certified
                mills in Biella, Italy and the Scottish Highlands. Designed to age gracefully
                with proper maintenance.
              </div>
            )}
          </div>

          {/* Delivery & Returns */}
          <div className="pdp-accordion-item">
            <button
              type="button"
              className="pdp-accordion-btn"
              onClick={() => toggleAccordion("shipping")}
            >
              <span>Delivery & Returns</span>
              <ChevronDownIcon
                size={16}
                className={openAccordion === "shipping" ? "transform rotate-180" : ""}
              />
            </button>
            {openAccordion === "shipping" && (
              <div className="pdp-accordion-content">
                Complimentary standard delivery on orders over ₹75. Express delivery
                arrives within 2-3 business days via Blue Dart & Delhivery. 30-day complimentary returns with our pre-paid
                courier pickup service.
              </div>

            )}
          </div>

          {/* Care Instructions */}
          <div className="pdp-accordion-item">
            <button
              type="button"
              className="pdp-accordion-btn"
              onClick={() => toggleAccordion("care")}
            >
              <span>Care Recommendations</span>
              <ChevronDownIcon
                size={16}
                className={openAccordion === "care" ? "transform rotate-180" : ""}
              />
            </button>
            {openAccordion === "care" && (
              <div className="pdp-accordion-content">
                Specialist dry clean only or gentle hand wash in cold water using neutral pH
                wool detergent. Lay flat to dry on a towel away from direct sunlight. Do not tumble dry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

