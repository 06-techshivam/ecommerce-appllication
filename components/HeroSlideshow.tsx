"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85",
    alt: "ZENVORA Autumn Winter Editorial Campaign",
  },
  {
    url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1800&q=85",
    alt: "ZENVORA Tailored Overcoats and Noble Knitwear",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1800&q=85",
    alt: "ZENVORA Bespoke Sprezzatura Tailoring",
  },
];

export function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-media-wrapper">
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.url}
          className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
        >
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="hero-slide-img"
            quality={85}
          />
        </div>
      ))}
    </div>
  );
}

