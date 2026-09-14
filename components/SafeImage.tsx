"use client";

import React, { useState } from "react";
import Image, { type ImageProps } from "next/image";

// Minimalist neutral placeholder SVG data-URI matching brand palette
const NEUTRAL_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22800%22%20viewBox%3D%220%200%20600%20800%22%3E%3Crect%20fill%3D%22%23f3efe9%22%20width%3D%22600%22%20height%3D%22800%22%2F%3E%3Ctext%20fill%3D%22%238f857a%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22500%22%20letter-spacing%3D%224%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3EZENVORA%3C%2Ftext%3E%3C%2Fsvg%3E";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const CLEAN_TROUSER_IMG =
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80";

function sanitizeSrc(src: unknown): string | object {
  if (typeof src === "string" && src.includes("1509631179647-0177331693ae")) {
    return CLEAN_TROUSER_IMG;
  }
  return src as string | object;
}

export function SafeImage({ src, fallbackSrc = NEUTRAL_PLACEHOLDER, alt, ...rest }: SafeImageProps) {
  const normalizedSrc = (sanitizeSrc(src) || fallbackSrc) as any;
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setCurrentSrc((sanitizeSrc(src) || fallbackSrc) as any);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt || "ZENVORA Product Image"}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

