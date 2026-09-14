import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { HeroSlideshow } from "./HeroSlideshow";

export function Hero() {
  // Check if a local transcoded video exists in public/videos/hero.mp4
  const videoPath = path.join(process.cwd(), "public", "videos", "hero.mp4");
  const hasVideo = fs.existsSync(videoPath);

  return (
    <section className="hero">
      {hasVideo ? (
        <div className="hero-media-wrapper">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-poster.jpg"
            className="hero-video"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>
      ) : (
        <HeroSlideshow />
      )}

      {/* Cinematic luxury vignette and dark overlay */}
      <div className="hero-overlay" />

      {/* Hero Typography and Staggered Entrance */}
      <div className="hero-content">
        <span className="hero-eyebrow">Autumn / Winter &apos;26 Collection</span>
        <h1 className="hero-title">The Art of Pure Form</h1>
        <p className="hero-subtitle">
          Architectural silhouettes, raw Mongolian cashmere, and noble fabrications
          crafted for the discerning minimalist.
        </p>

        <div className="hero-actions">
          <Link href="/women" className="btn btn-outline-light">
            Shop Women
          </Link>
          <Link href="/men" className="btn btn-outline-light">
            Shop Men
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}

