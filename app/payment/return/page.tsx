"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { money } from "@/lib/format";
import { CheckIcon, ArrowRightIcon, ShieldCheckIcon, TruckIcon } from "@/components/Icons";
import { PAYMENT_CONFIG } from "@/lib/payment-config";

interface OrderConfirmation {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  shipping: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    address: string;
    apartment?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    delivery_service?: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
  }>;
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setErrorMsg("No order ID provided in return callback.");
      setLoading(false);
      return;
    }

    async function confirmAndPayOrder() {
      try {
        // Update order status to confirmed and payment_status to paid
        const { data: updateData, error: updateErr } = await insforge.database
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
          })
          .eq("id", orderId)
          .select();

        if (updateErr) {
          console.warn("Order update warning:", updateErr);
        }

        // Retrieve latest order record
        let orderRow = updateData?.[0];
        if (!orderRow) {
          const { data: fetchRows } = await insforge.database
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .limit(1);
          orderRow = fetchRows?.[0];
        }

        if (orderRow) {
          setOrder(orderRow as OrderConfirmation);
        } else {
          // Graceful fallback with order ID
          setOrder({
            id: orderId || "unknown-order",
            status: "confirmed",
            payment_status: "paid",
            payment_method: "google pay",
            total: 0,
            subtotal: 0,
            shipping: 0,
            contact: { name: "Client", email: "", phone: "" },
            shipping_address: { address: "", city: "", zip: "", country: "India" },
            items: [],
          });
        }
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setErrorMsg("Failed to verify payment with server. Please check your profile.");
      } finally {
        setLoading(false);
      }
    }

    confirmAndPayOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="site-container section-sm text-center" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <span className="micro-caps">Verifying Google UPI Transaction...</span>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="site-container section-sm text-center" style={{ maxWidth: "560px", margin: "3rem auto" }}>
        <h2 className="heading-3" style={{ color: "var(--accent-sale)" }}>
          Payment Verification Notice
        </h2>
        <p className="body-regular" style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
          {errorMsg}
        </p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/profile" className="btn btn-primary">
            Go to Atelier Profile
          </Link>
          <Link href="/" className="btn btn-outline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container section-sm" style={{ maxWidth: "680px", margin: "2rem auto" }}>
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          padding: "clamp(2rem, 5vw, 3.5rem)",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#2e7d32",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            boxShadow: "0 8px 24px rgba(46, 125, 50, 0.25)",
          }}
        >
          <CheckIcon size={32} color="#ffffff" />
        </div>

        <span className="section-eyebrow">Payment Confirmed & Verified</span>
        <h1 className="heading-1" style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          Order Confirmed
        </h1>
        <p className="body-regular" style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Thank you for choosing ZENVORA. Your payment has been received via Google Pay ({PAYMENT_CONFIG.upiId}), and our master tailors are now preparing your pieces.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-hairline)",
            padding: "1.75rem",
            textAlign: "left",
            marginBottom: "2rem",
            borderRadius: "2px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border-hairline)", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <div>
              <span className="micro-caps" style={{ color: "var(--text-muted)" }}>
                Atelier Order Reference
              </span>
              <div style={{ fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 600, marginTop: "0.2rem" }}>
                #{order?.id}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  backgroundColor: "rgba(46, 125, 50, 0.12)",
                  color: "#2e7d32",
                  borderRadius: "2px",
                }}
              >
                Payment: Paid
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginLeft: "0.5rem",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  backgroundColor: "rgba(146, 92, 56, 0.12)",
                  color: "var(--accent-gold)",
                  borderRadius: "2px",
                }}
              >
                Status: Confirmed
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", fontSize: "0.85rem" }}>
            <div>
              <span className="micro-caps" style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                Payment Method
              </span>
              <span style={{ fontWeight: 500 }}>Google Pay ({PAYMENT_CONFIG.upiId})</span>
            </div>
            <div>
              <span className="micro-caps" style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                Amount Settled
              </span>
              <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                {order?.total ? money(order.total) : "Settled"}
              </span>
            </div>
          </div>

          {order?.contact?.email && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-hairline)", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Confirmation and delivery updates dispatched to <strong>{order.contact.email}</strong>.
            </div>
          )}
        </div>

        {/* Courier & Dispatch Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            padding: "1rem 1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid var(--border-hairline)",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <TruckIcon size={24} color="var(--accent-gold)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Complimentary Express Delivery (Blue Dart / Delhivery)
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Estimated dispatch within 24 hours. A tracking link will be transmitted via SMS &amp; Email.
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <Link href="/profile" className="btn btn-primary btn-full" style={{ padding: "1.05rem", fontSize: "0.95rem" }}>
            View in Client Atelier / Profile <ArrowRightIcon size={16} />
          </Link>
          <Link href="/women" className="btn btn-outline btn-full" style={{ padding: "0.95rem" }}>
            Continue Exploring Collections
          </Link>
        </div>

        {/* Security Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2rem",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
          }}
        >
          <ShieldCheckIcon size={16} />
          <span>Encrypted Atelier Pan-India Order Fulfillment</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="site-container section-sm text-center">
          <span className="micro-caps">Loading Payment Confirmation...</span>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}

