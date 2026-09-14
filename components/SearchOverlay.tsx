"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, CloseIcon } from "./Icons";
import { SafeImage } from "./SafeImage";
import { PRODUCTS, type Product } from "@/lib/data";
import { money } from "@/lib/format";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSuggestions([]);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Live filter suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 4);

    setSuggestions(matches);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
    onClose();
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  if (!isOpen) return null;

  return (
    <div className={`search-overlay ${isOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
      <div className="search-container">
        <div className="search-header-row">
          <span className="micro-caps">Search The Collection</span>
          <button
            onClick={onClose}
            className="nav-icon-btn"
            aria-label="Close search"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="search-input-wrap">
          <SearchIcon size={28} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Type to search (e.g. Cashmere, Coat, Silk)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {/* Quick Suggestion Tags */}
        {!query && (
          <div style={{ marginTop: "1rem" }}>
            <div className="micro-caps" style={{ marginBottom: "1rem" }}>
              Trending Searches
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {["Cashmere Overcoat", "Merino Turtleneck", "Silk Slip", "Pleated Trousers", "Leather Bag"].map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTag(tag)}
                    className="filter-pill"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Live Suggestions */}
        {query && (
          <div>
            <div className="section-header-flex" style={{ marginBottom: "1.5rem" }}>
              <span className="micro-caps">
                {suggestions.length > 0
                  ? `Suggestions (${suggestions.length})`
                  : "No exact matches"}
              </span>
              <button
                onClick={handleSubmit}
                className="btn-link"
                style={{ fontSize: "0.75rem" }}
              >
                View all results &rarr;
              </button>
            </div>

            <div className="search-suggestions-grid">
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="product-card"
                >
                  <div className="product-card-media" style={{ aspectRatio: "3 / 4" }}>
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 220px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="product-card-details">
                    <span className="product-card-category">{product.subcategory}</span>
                    <span className="product-card-title">{product.name}</span>
                    <span className="product-card-price">{money(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

