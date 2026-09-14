import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About The Maison | ZENVORA",
  description: "The heritage, philosophy, and architectural vision behind ZENVORA.",
};

export default function AboutPage() {
  return (
    <div className="site-container section-sm">
      <div className="listing-header" style={{ maxWidth: "800px" }}>
        <span className="section-eyebrow">The Maison</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Purity in Form. Restraint in Craft.
        </h1>
        <p className="body-large" style={{ marginTop: "1rem" }}>
          Founded with a devotion to quiet luxury, ZENVORA bridges architectural precision
          and tactile ease. We create garments that honour natural raw materiality and withstand
          fleeting trends.
        </p>
      </div>

      <div style={{ position: "relative", width: "100%", height: "480px", margin: "3rem 0", overflow: "hidden", backgroundColor: "var(--bg-subtle)" }}>
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
          alt="ZENVORA Atelier"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem", margin: "4rem 0" }}>
        <div>
          <span className="micro-caps">01 / Provenance</span>
          <h3 className="heading-3" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            Noble Sourcing
          </h3>
          <p className="body-regular" style={{ color: "var(--text-secondary)" }}>
            We work exclusively with heritage spinning mills in the Biella region of Italy
            and the Scottish Highlands. Every spool of cashmere, Merino wool, and Mulberry
            silk is fully certified for environmental stewardship.
          </p>
        </div>

        <div>
          <span className="micro-caps">02 / Silhouette</span>
          <h3 className="heading-3" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            Architectural Cut
          </h3>
          <p className="body-regular" style={{ color: "var(--text-secondary)" }}>
            Our garments are sculpted with calculated drape, drop shoulders, and relaxed proportions
            that flatter the body in motion. Every seam is intentional; every line is essential.
          </p>
        </div>

        <div>
          <span className="micro-caps">03 / Longevity</span>
          <h3 className="heading-3" style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            Enduring Quality
          </h3>
          <p className="body-regular" style={{ color: "var(--text-secondary)" }}>
            Rejecting the fast-fashion churn, our collections are modular and perennial.
            A ZENVORA overcoat or knit is designed to live in your wardrobe for decades.
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "5rem 0 2rem" }}>
        <Link href="/women" className="btn btn-primary" style={{ marginRight: "1rem" }}>
          Explore Women
        </Link>
        <Link href="/men" className="btn btn-outline">
          Explore Men
        </Link>
      </div>
    </div>
  );
}

