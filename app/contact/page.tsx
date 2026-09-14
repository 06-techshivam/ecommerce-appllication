"use client";

import React, { useState } from "react";
import { useToast } from "@/lib/toast";

export default function ContactPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast("Message Transmitted", "A concierge advisor will respond within 4 hours.");
  };

  return (
    <div className="site-container section-sm">
      <div className="listing-header" style={{ maxWidth: "700px" }}>
        <span className="section-eyebrow">Client Services</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Contact Our Concierge
        </h1>
        <p className="body-large" style={{ marginTop: "0.75rem" }}>
          Our private advisory team is available for styling guidance, sizing consultations,
          bespoke orders, and order inquiries.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem", margin: "2rem 0" }}>
        {/* Contact Information */}
        <div>
          <h3 className="heading-3" style={{ marginBottom: "1.5rem" }}>
            Atelier Headquarters
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", color: "var(--text-secondary)" }}>
            <div>
              <span className="micro-caps">Locations</span>
              <p style={{ marginTop: "0.25rem", color: "var(--text-primary)" }}>
                480 Madison Avenue, 14th Floor<br />
                New York, NY 10022<br />
                United States
              </p>
            </div>

            <div>
              <span className="micro-caps">Direct Inquiries</span>
              <p style={{ marginTop: "0.25rem", color: "var(--text-primary)" }}>
                concierge@zenvora.com<br />
                +1 (800) 489-3682
              </p>
            </div>

            <div>
              <span className="micro-caps">Atelier Hours</span>
              <p style={{ marginTop: "0.25rem", color: "var(--text-primary)" }}>
                Monday – Friday: 09:00 – 18:00 EST<br />
                Saturday: 10:00 – 16:00 EST
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-hairline)", padding: "2.5rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <h3 className="heading-3">Thank You</h3>
              <p className="body-regular" style={{ marginTop: "0.5rem" }}>
                Your message has been safely received. A dedicated concierge advisor
                will get back to you shortly.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: "1.5rem" }}
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">
                  Inquiry Nature
                </label>
                <select id="contact-subject" className="form-input">
                  <option value="styling">Styling & Sizing Consultation</option>
                  <option value="order">Existing Order Assistance</option>
                  <option value="press">Press & Partnerships</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How may we assist you today?"
                  className="form-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Transmit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

