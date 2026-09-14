"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { insforge } from "@/lib/insforge";
import { money } from "@/lib/format";
import { SafeImage } from "@/components/SafeImage";
import { CheckIcon, ArrowRightIcon } from "@/components/Icons";
import { PAYMENT_CONFIG } from "@/lib/payment-config";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderRecord {
  id: string;
  user_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "paid" | "shipped" | "delivered" | string;
  payment_status?: "paid" | "unpaid" | string;
  payment_method?: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    address: string;
    apartment?: string;
    landmark?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    payment_method?: string;
    delivery_service?: string;
  };
  payment_receipt_url?: string;
  created_at: string;
}

const STATUS_STEPS = [
  { key: "pending", label: "Pending Verification" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "shipped", label: "Shipped & In Transit" },
  { key: "delivered", label: "Delivered" },
] as const;

function getStatusIndex(status: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "paid") return 1; // Map legacy 'paid' status to confirmed
  const idx = STATUS_STEPS.findIndex((s) => s.key === normalized);
  return idx === -1 ? 0 : idx;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  // Fetch orders
  const fetchOrders = useCallback(async (userId: string) => {
    setOrdersLoading(true);
    try {
      const { data, error } = await insforge.database
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch order history:", error);
      } else {
        setOrders((data as unknown as OrderRecord[]) || []);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    }
  }, [user?.id, fetchOrders]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="site-container section-sm text-center">
        <span className="micro-caps">Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="site-container section-sm">
      {/* Profile Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border-hairline)",
          paddingBottom: "2rem",
          marginBottom: "3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <span className="section-eyebrow">Client Atelier Account</span>
          <h1 className="heading-1" style={{ marginTop: "0.25rem" }}>
            {user.profile?.name || "Client Portal"}
          </h1>
          <p className="body-regular" style={{ color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="btn btn-outline"
          style={{ padding: "0.6rem 1.5rem", fontSize: "0.78rem" }}
        >
          Sign Out of Atelier
        </button>
      </div>

      {/* Orders Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.75rem" }}>
          <div>
            <span className="section-eyebrow">Purchase Provenance</span>
            <h2 className="heading-2" style={{ marginTop: "0.2rem" }}>
              Order History
            </h2>
          </div>
          <span className="body-small" style={{ color: "var(--text-muted)" }}>
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {ordersLoading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <span className="micro-caps">Retrieving atelier records...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: "4rem 2rem", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}>
            <h3 className="heading-3">No orders placed yet</h3>
            <p className="body-regular" style={{ marginTop: "0.5rem" }}>
              Discover our latest noble cashmere and tailoring arrivals.
            </p>
            <Link href="/women" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
              Explore The Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {orders.map((order) => {
              const activeIndex = getStatusIndex(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-hairline)",
                    padding: "2rem",
                  }}
                >
                  {/* Order Top Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                      borderBottom: "1px solid var(--border-hairline)",
                      paddingBottom: "1.25rem",
                      marginBottom: "1.75rem",
                    }}
                  >
                    <div>
                      <div className="micro-caps" style={{ color: "var(--text-muted)" }}>
                        Order ID
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.2rem" }}>
                        #{order.id}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Placed on {orderDate}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div className="micro-caps" style={{ color: "var(--text-muted)" }}>
                        Total Amount
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "0.2rem" }}>
                        {money(order.total)}
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          marginTop: "0.4rem",
                          padding: "0.25rem 0.65rem",
                          fontSize: "0.7rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          backgroundColor: "rgba(146, 92, 56, 0.12)",
                          color: "var(--accent-gold)",
                          borderRadius: "2px",
                        }}
                      >
                        Status: {order.status}
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          marginTop: "0.4rem",
                          marginLeft: "0.4rem",
                          padding: "0.25rem 0.65rem",
                          fontSize: "0.7rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          backgroundColor:
                            order.payment_status === "paid" || order.status === "confirmed" || order.status === "paid"
                              ? "rgba(46, 125, 50, 0.12)"
                              : "rgba(217, 119, 6, 0.12)",
                          color:
                            order.payment_status === "paid" || order.status === "confirmed" || order.status === "paid"
                              ? "#2e7d32"
                              : "#b45309",
                          borderRadius: "2px",
                        }}
                      >
                        Payment: {order.payment_status === "paid" || order.status === "confirmed" || order.status === "paid" ? "Paid" : "Unpaid"}
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          marginTop: "0.4rem",
                          marginLeft: "0.4rem",
                          padding: "0.25rem 0.65rem",
                          fontSize: "0.7rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          backgroundColor: "var(--bg-surface)",
                          border: "1px solid var(--border-hairline)",
                          color: "var(--text-secondary)",
                          borderRadius: "2px",
                        }}
                      >
                        {order.payment_method || `Google Pay (${PAYMENT_CONFIG.upiId})`}
                      </div>
                    </div>
                  </div>

                  {/* Status Tracker */}
                  <div style={{ marginBottom: "2rem" }}>
                    <div className="micro-caps" style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                      Live Fulfillment Tracker
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        position: "relative",
                        gap: "0.5rem",
                      }}
                    >
                      {STATUS_STEPS.map((step, idx) => {
                        const isDone = idx < activeIndex;
                        const isCurrent = idx === activeIndex;
                        const isPending = idx > activeIndex;

                        return (
                          <div
                            key={step.key}
                            style={{
                              textAlign: "center",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                backgroundColor: isDone || isCurrent ? "var(--accent-gold)" : "var(--bg-subtle)",
                                color: isDone || isCurrent ? "#ffffff" : "var(--text-muted)",
                                border: isCurrent ? "2px solid var(--text-primary)" : "none",
                                transition: "all 0.3s ease",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {isDone ? <CheckIcon size={14} /> : idx + 1}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: isCurrent ? 600 : 400,
                                color: isPending ? "var(--text-muted)" : "var(--text-primary)",
                                lineHeight: 1.3,
                              }}
                            >
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: "1.5rem" }}>
                    <div className="micro-caps" style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                      Articles ({order.items.length})
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {order.items.map((item, i) => (
                        <div
                          key={`${item.id}-${item.size}-${i}`}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {item.image ? (
                              <div style={{ width: "45px", height: "58px", position: "relative", flexShrink: 0, backgroundColor: "var(--bg-subtle)" }}>
                                <SafeImage
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="45px"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            ) : null}
                            <div>
                              <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{item.name}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                Size: {item.size} &times; {item.quantity}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                            {money(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery destination */}
                  {order.shipping_address && (
                    <div style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-hairline)", paddingTop: "1rem", lineHeight: 1.6 }}>
                      <div>
                        <strong>Shipping to:</strong> {order.shipping_address.address}
                        {order.shipping_address.apartment ? `, ${order.shipping_address.apartment}` : ""}
                        {order.shipping_address.landmark ? ` (Near: ${order.shipping_address.landmark})` : ""},{" "}
                        {order.shipping_address.city}
                        {order.shipping_address.state ? `, ${order.shipping_address.state}` : ""} — <strong>{order.shipping_address.zip}</strong>, {order.shipping_address.country}
                      </div>
                      {order.shipping_address.payment_method && (
                        <div style={{ marginTop: "0.35rem", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                          <strong>Payment:</strong> {order.shipping_address.payment_method}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

