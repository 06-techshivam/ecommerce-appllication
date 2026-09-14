"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ListingControlsProps {
  basePath: string; // e.g. "/women" or "/men"
  subcategories: string[];
  activeSubcategory?: string;
  activeSort: string;
  totalCount: number;
}

export function ListingControls({
  basePath,
  subcategories,
  activeSubcategory,
  activeSort,
  totalCount,
}: ListingControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubChange = (sub?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sub) {
      params.set("sub", sub);
    } else {
      params.delete("sub");
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "featured") {
      params.set("sort", val);
    } else {
      params.delete("sort");
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="listing-controls-bar">
      {/* Filter Pills */}
      <div className="filter-pills">
        <button
          type="button"
          onClick={() => handleSubChange(undefined)}
          className={`filter-pill ${!activeSubcategory ? "is-active" : ""}`}
        >
          All Items
        </button>

        {subcategories.map((sub) => {
          const isActive =
            activeSubcategory?.toLowerCase() === sub.toLowerCase();
          return (
            <button
              key={sub}
              type="button"
              onClick={() => handleSubChange(sub)}
              className={`filter-pill ${isActive ? "is-active" : ""}`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Sort & Count Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <span className="results-count">{totalCount} Pieces</span>

        <div className="sort-select-wrap">
          <label htmlFor="sort-dropdown" className="micro-caps" style={{ color: "var(--text-muted)" }}>
            Sort:
          </label>
          <select
            id="sort-dropdown"
            className="sort-select"
            value={activeSort}
            onChange={handleSortChange}
          >
            <option value="featured">Curated (Featured)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}

