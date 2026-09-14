import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TruckIcon, ShieldCheckIcon, RefreshIcon, ArrowRightIcon } from "@/components/Icons";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getFeatured, getNewArrivals, getTrending } from "@/lib/api";

export default async function HomePage() {
  const [featuredProducts, newArrivals, trendingProducts] = await Promise.all([
    getFeatured(8),
    getNewArrivals(4),
    getTrending(4),
  ]);

  return (
    <>
      {/* 1. Large Animated Hero */}
      <Hero />

      {/* 2. Category Highlights (Women / Men with hover zoom) */}
      <section className="section">
        <div className="site-container">
          <ScrollReveal>
            <div className="section-header text-center">
              <span className="section-eyebrow">The Wardrobe</span>
              <h2 className="section-title">Explore by Department</h2>
              <p className="section-subtitle">
                Considered silhouettes tailored with uncompromising precision.
              </p>
            </div>
          </ScrollReveal>

          <div className="category-split-grid">
            <ScrollReveal delay={1}>
              <Link href="/women" className="category-card">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                  alt="ZENVORA Women's Collection"
                  fill
                  sizes="(max-width: 820px) 100vw, 50vw"
                  className="category-card-img"
                />
                <div className="category-card-overlay">
                  <span className="micro-caps" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Collection
                  </span>
                  <h3 className="category-card-title">Women</h3>
                  <span className="category-card-cta">
                    Discover Wardrobe <ArrowRightIcon size={14} color="#ffffff" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <Link href="/men" className="category-card">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80"
                  alt="ZENVORA Men's Collection"
                  fill
                  sizes="(max-width: 820px) 100vw, 50vw"
                  className="category-card-img"
                />
                <div className="category-card-overlay">
                  <span className="micro-caps" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Collection
                  </span>
                  <h3 className="category-card-title">Men</h3>
                  <span className="category-card-cta">
                    Discover Tailoring <ArrowRightIcon size={14} color="#ffffff" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="site-container">
          <ScrollReveal>
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">The Icons</span>
                <h2 className="section-title">Featured Pieces</h2>
              </div>
              <Link href="/women" className="btn-link">
                View All Icons &rarr;
              </Link>
            </div>
          </ScrollReveal>

          <div className="products-grid">
            {featuredProducts.map((product, idx) => (
              <ScrollReveal key={product.id} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Banner (Winter Sale & Editorial) */}
      <section className="promo-banner">
        <div className="site-container" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="promo-banner-inner">
            <ScrollReveal>
              <div className="promo-banner-content">
                <span className="section-eyebrow">Limited Seasonal Offer</span>
                <h2 className="heading-1">Winter Editorial Sale</h2>
                <p className="body-large">
                  Enjoy up to 40% off selected overcoats, heavy knitwear, and tailoring.
                  Complimentary carbon-neutral delivery on orders over ₹75.
                </p>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <Link href="/women?sort=price-asc" className="btn btn-primary">
                    Shop Women&apos;s Sale
                  </Link>
                  <Link href="/men?sort=price-asc" className="btn btn-outline">
                    Shop Men&apos;s Sale
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            <div className="promo-banner-media">
              <Image
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80"
                alt="Winter Editorial Promotion"
                fill
                sizes="(max-width: 820px) 100vw, 50vw"
                className="promo-banner-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Section */}
      <section className="section">
        <div className="site-container">
          <ScrollReveal>
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">Just Landed</span>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <Link href="/women?sort=newest" className="btn-link">
                Explore The Drop &rarr;
              </Link>
            </div>
          </ScrollReveal>

          <div className="products-grid">
            {newArrivals.map((product, idx) => (
              <ScrollReveal key={product.id} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Trending Section */}
      <section className="section" style={{ backgroundColor: "var(--bg-subtle)" }}>
        <div className="site-container">
          <ScrollReveal>
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">Most Coveted</span>
                <h2 className="section-title">Trending This Season</h2>
              </div>
              <Link href="/men?sort=featured" className="btn-link">
                View Highlights &rarr;
              </Link>
            </div>
          </ScrollReveal>

          <div className="products-grid">
            {trendingProducts.map((product, idx) => (
              <ScrollReveal key={product.id} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Value Props Strip */}
      <section className="value-props-strip">
        <div className="site-container">
          <div className="value-props-grid">
            <div className="value-prop-item">
              <TruckIcon size={26} color="var(--accent-gold)" />
              <h4 className="value-prop-title">Complimentary Shipping</h4>
              <p className="value-prop-desc">
                Fast express courier shipping across India on all orders exceeding ₹75 with full tracking.
              </p>

            </div>
            <div className="value-prop-item">
              <ShieldCheckIcon size={26} color="var(--accent-gold)" />
              <h4 className="value-prop-title">Noble Materiality</h4>
              <p className="value-prop-desc">
                Ethically sourced Mongolian cashmere, certified Merino wool, and Mulberry silk.
              </p>
            </div>
            <div className="value-prop-item">
              <RefreshIcon size={26} color="var(--accent-gold)" />
              <h4 className="value-prop-title">Effortless Returns</h4>
              <p className="value-prop-desc">
                30-day complimentary door-to-door returns and exchanges worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Signup Strip */}
      <section className="newsletter-strip">
        <div className="site-container">
          <ScrollReveal>
            <span className="micro-caps" style={{ color: "var(--accent-gold)" }}>
              The Private Club
            </span>
            <h2 className="heading-1" style={{ color: "#ffffff", marginTop: "0.5rem" }}>
              Receive The ZENVORA Gazette
            </h2>
            <p className="body-regular" style={{ color: "var(--text-inverse-muted)", maxWidth: "480px", margin: "1rem auto 0" }}>
              Be first to access private sales, seasonal lookbooks, and limited atelier releases.
            </p>

            <NewsletterForm />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
