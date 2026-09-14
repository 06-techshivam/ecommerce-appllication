import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ZENVORA",
  description: "ZENVORA client privacy, data security, and confidentiality policy.",
};

export default function PrivacyPage() {
  return (
    <div className="site-container section-sm" style={{ maxWidth: "800px" }}>
      <div className="listing-header">
        <span className="section-eyebrow">Legal & Compliance</span>
        <h1 className="heading-1" style={{ marginTop: "0.4rem" }}>
          Privacy Policy
        </h1>
        <p className="body-small" style={{ marginTop: "0.5rem" }}>
          Effective Date: January 1, 2026 &bull; Maison ZENVORA
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", color: "var(--text-secondary)", lineHeight: "1.75" }}>
        <section>
          <h3 className="heading-3" style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            1. Commitment to Discretion
          </h3>
          <p>
            Maison ZENVORA treats client confidentiality with utmost reverence. We never monetize,
            rent, or share your personal data with third-party advertisers. All collected information
            serves solely to tailor your bespoke client experience, process orders securely, and
            provide white-glove logistics.
          </p>
        </section>

        <section>
          <h3 className="heading-3" style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            2. Information Gathered
          </h3>
          <p>
            When engaging with our digital platform or ateliers, we may collect contact details
            (name, shipping address, telephone, email), purchase records, and digital preferences
            via necessary session cookies.
          </p>
        </section>

        <section>
          <h3 className="heading-3" style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            3. Payment Security & Encryption
          </h3>
          <p>
            Payment transactions are processed using industry-standard PCI-DSS Level 1 compliant
            gateways with end-to-end 256-bit encryption. ZENVORA does not store raw credit card
            numbers on our servers.
          </p>
        </section>

        <section>
          <h3 className="heading-3" style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            4. Client Rights & Data Portability
          </h3>
          <p>
            You retain the right to review, update, or request permanent deletion of your client profile
            at any moment by contacting our concierge desk at privacy@zenvora.com.
          </p>
        </section>
      </div>
    </div>
  );
}

