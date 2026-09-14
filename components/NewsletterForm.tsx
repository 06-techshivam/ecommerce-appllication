"use client";

import React, { useState } from "react";
import { useToast } from "@/lib/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast("Subscribed to the Gazette", `Updates will be sent to ${email}`);
    setEmail("");
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="Enter your email address"
        className="newsletter-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        className="btn-link"
        style={{ color: "#ffffff", cursor: "pointer" }}
      >
        Subscribe &rarr;
      </button>
    </form>
  );
}

