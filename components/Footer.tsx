import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="site-container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div>
            <span className="nav-logo" style={{ color: "#ffffff", display: "inline-block" }}>
              ZENVORA
            </span>
            <p className="footer-brand-blurb">
              Refined garments defined by architectural cuts, natural noble fibres,
              and timeless minimalist silhouettes. Designed for effortless modern living.
            </p>

            <div className="social-icons-row">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Pinterest"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <path d="m8 12 4 4 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="X (formerly Twitter)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                  <path d="M4 20l6.768-6.768m2.464-2.464L20 4" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="footer-col-title">Shop Collection</h4>
            <ul className="footer-links-list">
              <li><Link href="/women" className="footer-link">Women&apos;s Collection</Link></li>
              <li><Link href="/men" className="footer-link">Men&apos;s Collection</Link></li>
              <li><Link href="/women?sub=Coats+%26+Jackets" className="footer-link">Outerwear</Link></li>
              <li><Link href="/women?sub=Knitwear" className="footer-link">Noble Knitwear</Link></li>
              <li><Link href="/women?sort=newest" className="footer-link">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="footer-col-title">The Maison</h4>
            <ul className="footer-links-list">
              <li><Link href="/about" className="footer-link">Our Philosophy</Link></li>
              <li><Link href="/about#sustainability" className="footer-link">Conscious Craft</Link></li>
              <li><Link href="/contact" className="footer-link">Flagship Ateliers</Link></li>
              <li><Link href="/about#careers" className="footer-link">Careers</Link></li>
            </ul>
          </div>

          {/* Client Service Column */}
          <div>
            <h4 className="footer-col-title">Client Care</h4>
            <ul className="footer-links-list">
              <li><Link href="/contact" className="footer-link">Contact Concierge</Link></li>
              <li><Link href="/contact#shipping" className="footer-link">Shipping & Delivery</Link></li>
              <li><Link href="/contact#returns" className="footer-link">Returns & Exchanges</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {currentYear} ZENVORA Maison Ltd. All rights reserved.</span>
          <span>Curated with understated sophistication.</span>
        </div>
      </div>
    </footer>
  );
}

