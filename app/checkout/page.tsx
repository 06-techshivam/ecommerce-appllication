"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { insforge } from "@/lib/insforge";
import { SafeImage } from "@/components/SafeImage";
import { CheckIcon, ArrowRightIcon, ShieldCheckIcon, TruckIcon } from "@/components/Icons";
import { money, inr } from "@/lib/format";
import { PAYMENT_CONFIG } from "@/lib/payment-config";

const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING_FEE = 15;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCR)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const POPULAR_INDIAN_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

const ALL_INDIAN_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "IDFC FIRST Bank",
  "Federal Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Bank",
  "RBL Bank",
  "AU Small Finance Bank",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const { user } = useAuth();

  // Indian Delivery Address Format
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "", // Flat / House / Building
    apartment: "", // Street / Area / Locality
    landmark: "", // Landmark (Near / Opp)
    city: "",
    state: "Maharashtra",
    zip: "", // PIN Code (6 digits)
    country: "India",
  });

  // Indian Payment Methods state
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiOption, setUpiOption] = useState<"id" | "qr">("id");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [confirmedPaymentSummary, setConfirmedPaymentSummary] = useState("");
  const [confirmedItems, setConfirmedItems] = useState(items);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  // Pre-fill user data when logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.profile?.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(\d{4})/g, "$1 ").trim();
      setCardData((prev) => ({ ...prev, number: formatted }));
    } else if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted = digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setCardData((prev) => ({ ...prev, expiry: formatted }));
    } else if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCardData((prev) => ({ ...prev, cvv: digits }));
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[`card_${name}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`card_${name}`];
        return next;
      });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: Record<string, string> = {};

    // 1. Contact Validation
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Valid email address is required";
    }

    // Phone validation: Indian 10-digit mobile number
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = "Mobile number is required";
    } else if (phoneDigits.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    // 2. Indian Address Validation
    if (!formData.address.trim()) newErrors.address = "Flat / House No. / Building is required";
    if (!formData.apartment.trim()) newErrors.apartment = "Street / Locality / Area is required";
    if (!formData.city.trim()) newErrors.city = "City / District is required";
    if (!formData.state.trim()) newErrors.state = "State / UT is required";

    // PIN Code validation (6 digits for India)
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!formData.zip.trim()) {
      newErrors.zip = "PIN Code is required";
    } else if (formData.country === "India" && !pinRegex.test(formData.zip.trim())) {
      newErrors.zip = "Please enter a valid 6-digit Indian PIN Code";
    }



    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your shopping bag is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsSnapshot = items.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      const { data: orderRows, error: orderErr } = await insforge.database
        .from("orders")
        .insert([
          {
            user_id: user?.id || null,
            items: itemsSnapshot,
            subtotal,
            shipping,
            total: grandTotal,
            status: "pending",
            payment_status: "unpaid",
            payment_method: "google pay",
            contact: {
              name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: `+91 ${phoneDigits.slice(-10)}`,
            },
            shipping_address: {
              address: formData.address.trim(),
              apartment: formData.apartment.trim() || null,
              landmark: formData.landmark.trim() || null,
              city: formData.city.trim(),
              state: formData.state,
              zip: formData.zip.trim(),
              country: formData.country,
              delivery_service: "Blue Dart / Delhivery Express (3–5 Business Days)",
              payment_method: `Google Pay (${PAYMENT_CONFIG.upiId})`,
            },
          },
        ])
        .select();

      if (orderErr || !orderRows || orderRows.length === 0) {
        throw new Error(orderErr?.message || "Failed to create order record.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdOrder = orderRows[0] as any;
      clearCart();
      router.push(`/payment/${createdOrder.id}`);
    } catch (err: unknown) {
      console.error("Order submission failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="site-container section-sm">
        <span className="micro-caps">Loading Checkout...</span>
      </div>
    );
  }

  // ==========================================================================
  // ORDER CONFIRMATION VIEW (Indian Format)
  // ==========================================================================
  if (orderConfirmed) {
    return (
      <div className="site-container section-sm">
        <div style={{ maxWidth: "680px", margin: "2rem auto", textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-gold)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <CheckIcon size={28} />
          </div>

          <span className="section-eyebrow">Order Placed Successfully</span>
          <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
            Dhanyavaad, {formData.fullName.split(" ")[0]}
          </h1>
          <p className="body-large" style={{ marginTop: "0.8rem", color: "var(--text-secondary)" }}>
            Your order <strong>#{orderNumber}</strong> has been registered with our atelier. Dispatch tracking and
            updates have been forwarded to <strong>{formData.email}</strong> and SMS to{" "}
            <strong>+91 {formData.phone.replace(/\D/g, "").slice(-10)}</strong>.
          </p>

          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-hairline)",
              padding: "2rem",
              marginTop: "2.5rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="heading-3" style={{ margin: 0 }}>
                Order Details
              </h3>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  backgroundColor: "rgba(146, 92, 56, 0.12)",
                  color: "var(--accent-gold)",
                  borderRadius: "2px",
                }}
              >
                Status: {orderStatus}
              </span>
            </div>

            {/* Line Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {confirmedItems.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      Size: {item.size} &times; {item.quantity}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 500 }}>{money(item.price * item.quantity)}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {inr(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hairline-divider" style={{ marginBottom: "1rem" }} />

            <div className="summary-row">
              <span style={{ color: "var(--text-secondary)" }}>Total Amount</span>
              <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                {money(confirmedTotal)}
              </span>

            </div>

            {/* Indian Delivery & Payment Details */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "var(--bg-subtle)",
                fontSize: "0.84rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ marginBottom: "0.4rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>Payment Method:</strong>{" "}
                {confirmedPaymentSummary || "Prepaid"}
              </div>
              <div style={{ marginBottom: "0.4rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>Delivery Address:</strong> {formData.address},{" "}
                {formData.apartment}
                {formData.landmark ? `, Landmark: ${formData.landmark}` : ""}, {formData.city}, {formData.state} —{" "}
                <strong>{formData.zip}</strong>, {formData.country}
              </div>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Courier Service:</strong> Blue Dart / Delhivery Air
                Express (Estimated 3–5 Business Days)
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {user ? (
              <Link href="/profile" className="btn btn-primary">
                View in Order History →
              </Link>
            ) : null}
            <Link href="/" className={user ? "btn btn-outline" : "btn btn-primary"}>
              Return to Maison Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If bag is empty
  if (items.length === 0) {
    return (
      <div className="site-container section-sm">
        <div className="listing-header">
          <span className="section-eyebrow">Checkout</span>
          <h1 className="heading-1">Your Bag is Empty</h1>
        </div>
        <div className="empty-state">
          <p className="body-regular">Add items to your shopping bag before proceeding to checkout.</p>
          <Link href="/women" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Explore The Collection
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN CHECKOUT FORM (Indian Format)
  // ==========================================================================
  return (
    <div className="site-container section-sm">
      <div className="listing-header">
        <span className="section-eyebrow">Secure Checkout</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Delivery & Payment
        </h1>
      </div>

      {submitError && (
        <div
          style={{
            backgroundColor: "rgba(180, 50, 50, 0.08)",
            border: "1px solid rgba(180, 50, 50, 0.3)",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            borderRadius: "2px",
          }}
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left: Input Forms */}
        <div className="checkout-form-container">
          {/* 1. Contact Information */}
          <div className="checkout-section">
            <h3 className="heading-3">1. Contact Information</h3>
            <p className="body-small" style={{ color: "var(--text-muted)" }}>
              Order confirmation, GST invoice, and Blue Dart / courier tracking OTP will be dispatched here.
            </p>

            <div className="form-grid-2" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Aisha Sharma"
                  className={`form-input ${errors.fullName ? "has-error" : ""}`}
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Mobile Number (India) *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 0.85rem",
                      backgroundColor: "var(--bg-subtle)",
                      border: "1px solid var(--border-hairline)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      userSelect: "none",
                    }}
                  >
                    🇮🇳 +91
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    className={`form-input ${errors.phone ? "has-error" : ""}`}
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ flex: 1 }}
                  />
                </div>
                {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="aisha.sharma@example.com"
                className={`form-input ${errors.email ? "has-error" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>
          </div>

          {/* 2. Indian Delivery Details & Shipping Destination */}
          <div className="checkout-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="heading-3">2. Delivery Destination & Address</h3>
              <span className="dummy-badge" style={{ backgroundColor: "#16130f", color: "#ffffff" }}>
                PAN-INDIA DELIVERY
              </span>
            </div>

            {/* Indian Logistics Note */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.85rem 1rem",
                backgroundColor: "rgba(146, 92, 56, 0.07)",
                border: "1px solid rgba(146, 92, 56, 0.22)",
                margin: "1rem 0 1.25rem",
                fontSize: "0.82rem",
                lineHeight: 1.5,
              }}
            >
              <div style={{ marginTop: "2px", color: "var(--accent-gold)" }}>
                <TruckIcon size={18} />
              </div>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Complimentary Pan-India Shipping:</strong> Dispatched
                via <strong>Blue Dart Express</strong> and <strong>Delhivery Priority</strong>. Delivery in 3–5 business
                days with live SMS & OTP verification.
              </div>
            </div>

            {/* Flat / House / Building */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Flat, House No., Building Name, Floor *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="e.g. Flat 402, Royale Crest, 4th Floor"
                className={`form-input ${errors.address ? "has-error" : ""}`}
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <span className="form-error-msg">{errors.address}</span>}
            </div>

            {/* Street / Area / Locality */}
            <div className="form-group">
              <label className="form-label" htmlFor="apartment">
                Street, Colony, Locality, Sector *
              </label>
              <input
                id="apartment"
                name="apartment"
                type="text"
                placeholder="e.g. Linking Road, Bandra West"
                className={`form-input ${errors.apartment ? "has-error" : ""}`}
                value={formData.apartment}
                onChange={handleChange}
              />
              {errors.apartment && <span className="form-error-msg">{errors.apartment}</span>}
            </div>

            {/* Landmark */}
            <div className="form-group">
              <label className="form-label" htmlFor="landmark">
                Landmark (Optional)
              </label>
              <input
                id="landmark"
                name="landmark"
                type="text"
                placeholder="e.g. Near National College / Opp. Metro Pillar 42"
                className="form-input"
                value={formData.landmark}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid-3">
              {/* City */}
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City / District *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Mumbai"
                  className={`form-input ${errors.city ? "has-error" : ""}`}
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <span className="form-error-msg">{errors.city}</span>}
              </div>

              {/* State (Indian States Dropdown) */}
              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State / UT *
                </label>
                <select
                  id="state"
                  name="state"
                  className={`form-input ${errors.state ? "has-error" : ""}`}
                  value={formData.state}
                  onChange={handleChange}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && <span className="form-error-msg">{errors.state}</span>}
              </div>

              {/* PIN Code */}
              <div className="form-group">
                <label className="form-label" htmlFor="zip">
                  PIN Code (6 digits) *
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400050"
                  className={`form-input ${errors.zip ? "has-error" : ""}`}
                  value={formData.zip}
                  onChange={handleChange}
                />
                {errors.zip && <span className="form-error-msg">{errors.zip}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="country">
                Country *
              </label>
              <select
                id="country"
                name="country"
                className="form-input"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="India">India</option>
              </select>

            </div>
          </div>

          {/* 3. Indian Payment Methods */}
          <div className="checkout-section">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <h3 className="heading-3">3. Payment Method</h3>
              <span
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  padding: "0.2rem 0.55rem",
                  backgroundColor: "rgba(146, 92, 56, 0.12)",
                  color: "var(--accent-gold)",
                  borderRadius: "2px",
                }}
              >
                100% SECURE &bull; RBI COMPLIANT
              </span>
            </div>
            <p className="body-small" style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Select your preferred Indian payment method. All transactions are 256-bit SSL encrypted.
            </p>

            {/* Payment Method: Google Pay */}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1.5rem",
                backgroundColor: "var(--bg-subtle)",
                border: "2px solid var(--accent-gold)",
                borderRadius: "2px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-gold)",
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
                    Google Pay / UPI Payment
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      fontFamily: "monospace",
                      letterSpacing: "0.05em",
                      padding: "0.25rem 0.65rem",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-hairline)",
                      borderRadius: "2px",
                      color: "var(--accent-gold)",
                    }}
                  >
                    {PAYMENT_CONFIG.upiId}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.15rem 0.45rem",
                      backgroundColor: "rgba(46, 125, 50, 0.1)",
                      color: "#2e7d32",
                      fontWeight: 600,
                      borderRadius: "2px",
                    }}
                  >
                    ✓ {PAYMENT_CONFIG.payeeName}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Your transaction of <strong>{money(grandTotal)}</strong> is processed via Google Pay (<strong>{PAYMENT_CONFIG.upiId}</strong>). Upon clicking &quot;Confirm &amp; Place Order&quot;, you will be transferred to Google Pay Authorization to complete your payment.
              </p>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "RuPay UPI"].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.55rem",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-hairline)",
                      borderRadius: "2px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Side Panel (Dual Currency USD + INR) */}
        <div className="order-summary-card">
          <h3 className="heading-3" style={{ fontSize: "1.35rem" }}>
            Summary ({items.length} items)
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxHeight: "360px",
              overflowY: items.length > 3 ? "auto" : "visible",
              paddingRight: items.length > 3 ? "0.25rem" : 0,
            }}
          >
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "74px",
                    position: "relative",
                    flexShrink: 0,
                    backgroundColor: "var(--bg-subtle)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    border: "1px solid var(--border-hairline)",
                  }}
                >
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="60px"
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Size: {item.size} &times; {item.quantity}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                    {money(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hairline-divider" />

          <div className="summary-row">
            <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
            <div style={{ textAlign: "right", fontWeight: 600, fontSize: "0.92rem" }}>
              {money(subtotal)}
            </div>
          </div>

          <div className="summary-row">
            <span style={{ color: "var(--text-secondary)" }}>Shipping (Pan-India)</span>
            <div style={{ textAlign: "right", fontWeight: 500, color: "var(--accent-gold)" }}>
              {shipping === 0 ? "Complimentary" : money(shipping)}
            </div>
          </div>


          <div className="hairline-divider" />

          <div className="summary-row total">
            <div>
              <div>Estimated Total</div>
              <div style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>
                Incl. GST & Pan-India duties
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {money(grandTotal)}
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-full"
            style={{ marginTop: "1.5rem", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              "Confirming Order..."
            ) : (
              <>
                Confirm & Place Order ({inr(grandTotal)}) <ArrowRightIcon size={16} />
              </>
            )}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1.25rem",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
            }}
          >
            <ShieldCheckIcon size={16} />
            <span>Encrypted Atelier Pan-India Order System</span>
          </div>
        </div>
      </form>
    </div>
  );
}
