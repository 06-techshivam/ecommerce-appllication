"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { money } from "@/lib/format";
import { ShieldCheckIcon, ArrowRightIcon, CheckIcon } from "@/components/Icons";
import {
  PAYMENT_CONFIG,
  buildUpiPaymentUri,
  buildGooglePayIntentUri,
  buildAppSpecificUpiUri,
  SupportedUpiApp,
} from "@/lib/payment-config";
import { useCart } from "@/lib/store";

interface OrderData {
  id: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  payment_status: string;
  payment_method: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
  }>;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}

function PaymentContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = (params?.orderId as string) || "";

  const { subtotal: cartSubtotal } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasInitiatedPayment, setHasInitiatedPayment] = useState(false);

  // Device & Fallback States
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showFallbackChooser, setShowFallbackChooser] = useState(false);
  const [isOpeningApp, setIsOpeningApp] = useState(false);

  // Parse optional query param overrides (e.g. ?total=16, ?amount=49, ?total=125)
  const queryAmountParam = searchParams.get("total") || searchParams.get("amount");
  const parsedQueryAmount = queryAmountParam ? parseFloat(queryAmountParam) : null;

  // Hydrate initiated payment status from sessionStorage on client
  useEffect(() => {
    if (typeof window !== "undefined" && orderId) {
      try {
        const stored = sessionStorage.getItem(`zenvora_upi_initiated_${orderId}`);
        if (stored === "true") {
          setHasInitiatedPayment(true);
        }
      } catch {
        // ignore storage access issues
      }
    }
  }, [orderId]);

  // Detect mobile vs desktop safely after mounting
  useEffect(() => {
    setIsMounted(true);
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const android = /Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    const mobile =
      android ||
      ios ||
      /webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua) ||
      (typeof window !== "undefined" && window.innerWidth < 768);

    setIsAndroid(android);
    setIsIos(ios);
    setIsMobile(mobile);

    const handleResize = () => {
      const currentMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(currentMobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Fetch order from database and keep reactively synchronized (polling every 3s)
  useEffect(() => {
    if (!orderId || orderId === "cart") {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchOrder() {
      try {
        const { data, error } = await insforge.database
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .limit(1);

        if (!mounted) return;

        if (error || !data || data.length === 0) {
          console.warn("Order fetch warning:", error);
        } else {
          setOrder(data[0] as OrderData);
        }
      } catch (err) {
        if (mounted) console.error("Failed to load order:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  // 2. Single Source of Truth for the Final Payable Amount
  const finalPayableAmount = useMemo(() => {
    if (parsedQueryAmount !== null && !isNaN(parsedQueryAmount) && parsedQueryAmount > 0) {
      return parsedQueryAmount;
    }
    if (order && typeof order.total === "number" && order.total > 0) {
      return order.total;
    }
    if (cartSubtotal > 0) {
      return cartSubtotal;
    }
    return 0;
  }, [parsedQueryAmount, order, cartSubtotal]);

  const isValidAmount = finalPayableAmount > 0 && !isNaN(finalPayableAmount);

  // 3. Reactive UPI Payment URIs
  const genericUpiUri = useMemo(() => {
    if (!isValidAmount) return "";
    return buildUpiPaymentUri({
      upiId: PAYMENT_CONFIG.upiId,
      payeeName: PAYMENT_CONFIG.payeeName,
      amount: finalPayableAmount,
      orderId,
    });
  }, [isValidAmount, finalPayableAmount, orderId]);

  const googlePayIntentUri = useMemo(() => {
    if (!isValidAmount) return "";
    return buildGooglePayIntentUri(
      {
        upiId: PAYMENT_CONFIG.upiId,
        payeeName: PAYMENT_CONFIG.payeeName,
        amount: finalPayableAmount,
        orderId,
      },
      isAndroid,
      isIos
    );
  }, [isValidAmount, finalPayableAmount, orderId, isAndroid, isIos]);

  // 4. Handle "PAY WITH GOOGLE PAY / UPI APP" Click
  const handlePayWithGooglePay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isValidAmount) return;

    // Immediately enable the "I'VE PAID — RETURN TO STORE" button
    setHasInitiatedPayment(true);
    if (typeof window !== "undefined" && orderId) {
      try {
        sessionStorage.setItem(`zenvora_upi_initiated_${orderId}`, "true");
      } catch {
        // ignore
      }
    }

    setIsOpeningApp(true);

    // If on Desktop, trigger generic UPI or default handler
    if (!isMobile) {
      window.location.href = genericUpiUri;
      setIsOpeningApp(false);
      return;
    }

    // On Mobile: Attempt to open Google Pay directly
    const targetUri = googlePayIntentUri || genericUpiUri;
    const startTime = Date.now();

    // Fallback timer: Check if page goes hidden (meaning app opened)
    const fallbackTimeout = setTimeout(() => {
      const timeElapsed = Date.now() - startTime;
      setIsOpeningApp(false);

      // If document is still visible, Google Pay app failed to open or is not installed
      if (!document.hidden && timeElapsed < 3000) {
        setShowFallbackChooser(true);
        // Automatically attempt generic UPI intent to trigger system app chooser
        window.location.href = genericUpiUri;
      }
    }, 1500);

    // Listen for visibility change
    const onVisibilityChange = () => {
      if (document.hidden) {
        // App successfully took foreground
        clearTimeout(fallbackTimeout);
        setIsOpeningApp(false);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Initiate navigation
    window.location.href = targetUri;
  };

  // Launch a specific fallback UPI app
  const handleLaunchApp = (app: SupportedUpiApp) => {
    // Immediately enable the "I'VE PAID — RETURN TO STORE" button
    setHasInitiatedPayment(true);
    if (typeof window !== "undefined" && orderId) {
      try {
        sessionStorage.setItem(`zenvora_upi_initiated_${orderId}`, "true");
      } catch {
        // ignore
      }
    }

    const uri = buildAppSpecificUpiUri(
      app,
      {
        upiId: PAYMENT_CONFIG.upiId,
        payeeName: PAYMENT_CONFIG.payeeName,
        amount: finalPayableAmount,
        orderId,
      },
      isAndroid
    );
    window.location.href = uri;
  };

  const handleCopyUpiId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReturnToStore = () => {
    router.push(`/payment/return?orderId=${encodeURIComponent(orderId || "cart")}`);
  };

  if (loading) {
    return (
      <div
        className="site-container section-sm text-center"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span className="micro-caps">Connecting to Google Pay Authorization...</span>
      </div>
    );
  }

  return (
    <div className="site-container section-sm" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-hairline)",
          padding: "clamp(2rem, 5vw, 3rem)",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
        }}
      >
        {/* Header Eyebrow & Brand */}
        <span className="section-eyebrow">Secure Checkout Handshake</span>
        <h1 className="heading-2" style={{ marginTop: "0.35rem", marginBottom: "0.25rem" }}>
          Google Pay Authorization
        </h1>
        <p className="body-small" style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          Order reference <strong style={{ fontFamily: "monospace" }}>#{orderId ? orderId.slice(0, 13) : "ATELIER"}</strong>
        </p>

        {/* Dynamic Amount Box - Single Source of Truth */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-hairline)",
            padding: "1.5rem",
            marginBottom: "2rem",
            borderRadius: "2px",
          }}
        >
          <span className="micro-caps" style={{ color: "var(--text-muted)" }}>
            Total Amount Due
          </span>
          <div style={{ fontSize: "2.4rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {isValidAmount ? money(finalPayableAmount) : "₹0"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Inclusive of all taxes &amp; complimentary Pan-India delivery
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIRECT DEEP-LINK BUTTON: PAY WITH GOOGLE PAY / UPI APP                     */}
        {/* ========================================================================= */}
        {isValidAmount && (
          <div style={{ marginBottom: "2rem" }}>
            <button
              type="button"
              onClick={handlePayWithGooglePay}
              disabled={isOpeningApp}
              className="btn btn-primary btn-full"
              style={{
                padding: "1.2rem 1.5rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                backgroundColor: "#000000",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                borderRadius: "2px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span>{isOpeningApp ? "Opening Google Pay..." : "PAY WITH GOOGLE PAY / UPI APP"}</span>
              <ArrowRightIcon size={16} />
            </button>

            <span
              style={{
                display: "block",
                fontSize: "0.76rem",
                color: "var(--text-muted)",
                marginTop: "0.6rem",
                lineHeight: 1.4,
              }}
            >
              {isMobile
                ? `Tapping opens Google Pay directly on your mobile with ${isValidAmount ? money(finalPayableAmount) : "amount"} pre-filled.`
                : `Click to open your default UPI payment handler or copy the UPI ID below.`}
            </span>

            {/* Fallback Option Alert: Shown if GPay didn't open or on request */}
            {showFallbackChooser && (
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "1.25rem",
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "4px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#92400e", marginBottom: "0.35rem" }}>
                  Google Pay not opening?
                </div>
                <p style={{ fontSize: "0.78rem", color: "#78350f", lineHeight: 1.5, margin: "0 0 0.85rem 0" }}>
                  Select another installed UPI app to complete your payment, or copy the UPI ID below:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleLaunchApp("phonepe")}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Pay with PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchApp("paytm")}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Pay with Paytm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchApp("bhim")}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Pay with BHIM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchApp("generic")}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 0.5rem", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Choose Other UPI
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dedicated UPI ID Box with Interactive Copy Button */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-hairline)",
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            borderRadius: "2px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span className="micro-caps" style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
              Payee UPI ID
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#2e7d32",
                backgroundColor: "rgba(46, 125, 50, 0.1)",
                padding: "0.15rem 0.5rem",
                borderRadius: "2px",
                fontWeight: 600,
              }}
            >
              ✓ {PAYMENT_CONFIG.payeeName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-hairline)",
              padding: "0.75rem 1rem",
              borderRadius: "2px",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                userSelect: "all",
                wordBreak: "break-all",
              }}
            >
              {PAYMENT_CONFIG.upiId}
            </span>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="btn btn-outline"
              style={{
                padding: "0.4rem 0.85rem",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {copied ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#2e7d32" }}>
                  <CheckIcon size={14} /> Copied
                </span>
              ) : (
                "Copy ID"
              )}
            </button>
          </div>
        </div>

        {/* Invalid Amount Alert Validation State */}
        {!isValidAmount && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(217, 119, 6, 0.08)",
              border: "1px solid rgba(217, 119, 6, 0.25)",
              color: "#b45309",
              fontSize: "0.82rem",
              marginBottom: "1.5rem",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            No payable balance found. Please return to your shopping bag to select items.
          </div>
        )}

        {/* Primary Confirmation Action: "I've paid — return to store" */}
        <button
          type="button"
          onClick={handleReturnToStore}
          disabled={!isValidAmount || !hasInitiatedPayment}
          className="btn btn-secondary btn-full"
          style={{
            padding: "1.1rem",
            fontSize: "0.95rem",
            marginBottom: "1.75rem",
            opacity: isValidAmount && hasInitiatedPayment ? 1 : 0.5,
            cursor: isValidAmount && hasInitiatedPayment ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
          }}
        >
          I&apos;ve paid — return to store <ArrowRightIcon size={16} />
        </button>

        {/* Security Assurance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
          }}
        >
          <ShieldCheckIcon size={16} />
          <span>Encrypted Atelier Pan-India Payment Handshake &bull; 256-Bit SSL</span>
        </div>
      </div>
    </div>
  );
}

export default function GooglePayInterstitialPage() {
  return (
    <Suspense
      fallback={
        <div
          className="site-container section-sm text-center"
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span className="micro-caps">Loading Payment Details...</span>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

