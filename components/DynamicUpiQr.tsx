"use client";

import React, { useMemo, useState } from "react";
import { PAYMENT_CONFIG, buildUpiPaymentUri } from "@/lib/payment-config";
import { QrMatrix } from "@/lib/qr-matrix";

interface DynamicUpiQrProps {
  amount: number;
  orderId?: string;
  upiId?: string;
  payeeName?: string;
  size?: number;
}

export default function DynamicUpiQr({
  amount,
  orderId,
  upiId = PAYMENT_CONFIG.upiId,
  payeeName = PAYMENT_CONFIG.payeeName,
  size = 280,
}: DynamicUpiQrProps) {
  const [useFallbackImg, setUseFallbackImg] = useState(false);

  // 1. Validate amount edge case
  const isValidAmount = typeof amount === "number" && !isNaN(amount) && amount > 0;

  // 2. Generate standard UPI URI reactively
  const upiUri = useMemo(() => {
    if (!isValidAmount) return "";
    return buildUpiPaymentUri({ upiId, payeeName, amount, orderId });
  }, [isValidAmount, upiId, payeeName, amount, orderId]);

  // 3. Generate QR Matrix synchronously from the URI
  const matrix = useMemo(() => {
    if (!upiUri) return null;
    try {
      return QrMatrix.generate(upiUri);
    } catch (err) {
      console.warn("SVG QR generation error, using fallback image:", err);
      setUseFallbackImg(true);
      return null;
    }
  }, [upiUri]);

  // 4. Invalid amount state (Edge case requirement)
  if (!isValidAmount) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: `${size}px`,
          margin: "0 auto",
          padding: "2rem 1.5rem",
          backgroundColor: "var(--bg-subtle)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "14px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⚠️</div>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
          Awaiting Payable Amount
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          A valid order total is required to generate the Google Pay UPI QR code.
        </p>
      </div>
    );
  }

  // Fallback high-res CDN dynamic QR image if SVG failed
  if (useFallbackImg || !matrix) {
    const dynamicImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
      upiUri
    )}`;
    return (
      <a
        href={upiUri}
        title="Tap to pay via Google Pay or any UPI app"
        style={{
          display: "inline-block",
          backgroundColor: "#ffffff",
          border: "1px solid var(--border-hairline)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          maxWidth: `${size}px`,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        <img
          key={amount.toFixed(2)}
          src={dynamicImgUrl}
          alt={`Scan to pay ₹${amount.toFixed(2)} via Google Pay`}
          width={size}
          height={size}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            aspectRatio: "1/1",
            borderRadius: "14px",
          }}
        />
      </a>
    );
  }

  // 5. Render pure SVG with Google Pay emblem in center
  const matrixSize = matrix.length;
  const padding = 2; // quiet zone
  const totalGridSize = matrixSize + padding * 2;
  const scale = size / totalGridSize;

  // Build SVG path string for dark modules
  let path = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + padding) * scale;
        const y = (r + padding) * scale;
        path += `M${x.toFixed(1)},${y.toFixed(1)}h${scale.toFixed(1)}v${scale.toFixed(1)}h-${scale.toFixed(1)}z `;
      }
    }
  }

  // Center emblem coordinates
  const centerRadius = size * 0.14;
  const centerPos = size / 2;

  return (
    <a
      href={upiUri}
      title="Tap to pay via Google Pay or any UPI app"
      style={{
        display: "inline-block",
        backgroundColor: "#ffffff",
        border: "1px solid var(--border-hairline)",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        maxWidth: `${size}px`,
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      <svg
        key={`qr-${amount.toFixed(2)}`}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "1/1",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Background */}
        <rect width={size} height={size} fill="#ffffff" />

        {/* QR Modules Path */}
        <path d={path} fill="#000000" />

        {/* Center Circular Mask & Google Pay Emblem */}
        <circle cx={centerPos} cy={centerPos} r={centerRadius} fill="#ffffff" stroke="#e0e0e0" strokeWidth="1.5" />
        
        {/* Google Pay Colored Capsule Logo */}
        <g transform={`translate(${centerPos - centerRadius * 0.65}, ${centerPos - centerRadius * 0.65}) scale(${(centerRadius * 1.3) / 24})`}>
          {/* Blue */}
          <path d="M4.5 12a7.5 7.5 0 0 1 15 0" fill="#4285F4" />
          {/* Green */}
          <path d="M19.5 12a7.5 7.5 0 0 1-15 0" fill="#34A853" />
          {/* Yellow */}
          <path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5" fill="#FBBC05" />
          {/* Red */}
          <path d="M4.5 12A7.5 7.5 0 0 1 12 4.5" fill="#EA4335" />
          {/* Center soft capsule shape */}
          <path
            d="M8.5 7.5h7a3.5 3.5 0 0 1 3.5 3.5v2a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 13v-2a3.5 3.5 0 0 1 3.5-3.5z"
            fill="#ffffff"
          />
          <path
            d="M8.5 8.5h7a2.5 2.5 0 0 1 2.5 2.5v2a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 13v-2a2.5 2.5 0 0 1 2.5-2.5z"
            fill="#4285F4"
            opacity="0.1"
          />
          <circle cx="10" cy="12" r="1.5" fill="#4285F4" />
          <circle cx="14" cy="12" r="1.5" fill="#EA4335" />
        </g>
      </svg>
    </a>
  );
}

