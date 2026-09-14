"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { SafeImage } from "@/components/SafeImage";
import { PlusIcon, MinusIcon, TrashIcon, ArrowRightIcon, ShieldCheckIcon, TruckIcon } from "@/components/Icons";
import { money } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING_FEE = 15;

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, totalCount, isHydrated } = useCart();

  // If loading from localStorage, show a clean skeleton/placeholder
  if (!isHydrated) {
    return (
      <div className="site-container section-sm">
        <div className="listing-header">
          <span className="section-eyebrow">Shopping Bag</span>
          <h1 className="heading-1">Your Selected Pieces</h1>
        </div>
        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="micro-caps">Loading Bag...</span>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shipping;
  const progressToFree = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="site-container section-sm">
        <div className="listing-header">
          <span className="section-eyebrow">Shopping Bag</span>
          <h1 className="heading-1">Your Bag is Empty</h1>
        </div>

        <div className="empty-state">
          <p className="body-large" style={{ maxWidth: "460px" }}>
            You haven&apos;t added any pieces to your bag yet. Explore our latest arrivals
            crafted from noble fibres and pure cashmere.
          </p>
          <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
            <Link href="/women" className="btn btn-primary">
              Shop Women&apos;s
            </Link>
            <Link href="/men" className="btn btn-outline">
              Shop Men&apos;s
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container section-sm">
      <div className="listing-header">
        <span className="section-eyebrow">Shopping Bag</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Your Selected Pieces ({totalCount})
        </h1>
      </div>

      <div className="cart-layout">
        {/* Line Items List */}
        <div className="cart-items-list">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="cart-item-row">
              {/* Image */}
              <Link href={`/product/${item.id}`} className="cart-item-img-wrap">
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="100px"
                  style={{ objectFit: "cover" }}
                />
              </Link>

              {/* Item Meta */}
              <div className="cart-item-info">
                <span className="micro-caps">{item.subcategory}</span>
                <Link href={`/product/${item.id}`} className="cart-item-title">
                  {item.name}
                </Link>
                <div className="cart-item-meta">Size: <strong>{item.size}</strong></div>
                <div style={{ fontWeight: 500, marginTop: "0.25rem" }}>
                  {money(item.price)} each
                </div>

                {/* Stepper & Actions */}
                <div className="cart-item-actions">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.size, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={12} />
                    </button>
                    <span className="qty-val" style={{ width: "32px", fontSize: "0.82rem" }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.size, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-item-remove-btn"
                    onClick={() => removeItem(item.id, item.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Line Total */}
              <div style={{ textAlign: "right", fontWeight: 600, fontSize: "1.05rem" }}>
                {money(item.price * item.quantity)}
              </div>
            </div>
          ))}

          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/women" className="btn-link">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="order-summary-card">
          <h3 className="heading-3" style={{ fontSize: "1.35rem" }}>
            Order Summary
          </h3>

          {/* Free Shipping Progress Indicator */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
              <span>
                {amountNeeded > 0
                  ? `Add ${money(amountNeeded)} for Free Delivery`
                  : "You've qualified for Free Delivery!"}
              </span>
              <span style={{ fontWeight: 600 }}>{progressToFree}%</span>
            </div>
            <div className="free-shipping-bar">
              <div className="free-shipping-progress" style={{ width: `${progressToFree}%` }} />
            </div>
          </div>

          <div className="summary-row">
            <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
            <span style={{ fontWeight: 500 }}>{money(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span style={{ color: "var(--text-secondary)" }}>Estimated Delivery</span>
            <span style={{ fontWeight: 500 }}>
              {shipping === 0 ? "Complimentary" : money(shipping)}
            </span>
          </div>

          <div className="summary-row summary-row-total">
            <span>Total</span>
            <span>{money(grandTotal)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary btn-full" style={{ marginTop: "0.5rem" }}>
            Proceed to Checkout <ArrowRightIcon size={16} />
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-hairline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <ShieldCheckIcon size={16} color="var(--accent-gold)" />
              <span>Complimentary 30-day returns worldwide</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <TruckIcon size={16} color="var(--accent-gold)" />
              <span>Carbon-neutral luxury packaging & shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

