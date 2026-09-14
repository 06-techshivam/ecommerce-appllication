"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBagIcon,
  SearchIcon,
  UserIcon,
} from "./Icons";

import { SearchOverlay } from "./SearchOverlay";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toggle state: Home, Women, Men menu items hidden by default
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Click outside and ESC key listener to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>Free express delivery on all orders over ₹75</span>
      </div>


      {/* Main Navbar */}
      <header className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`} ref={navRef}>
        <div className="site-container">
          <div className="nav-inner">
            {/* Left: ONLY the three-line hamburger icon (☰) shown by default */}
            <div className="nav-left">
              <button
                type="button"
                className={`nav-hamburger-toggle ${isMenuOpen ? "is-active" : ""}`}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                title={isMenuOpen ? "Hide navigation menu" : "Reveal navigation menu"}
                aria-label={isMenuOpen ? "Hide navigation menu" : "Reveal navigation menu"}
                aria-expanded={isMenuOpen}
              >
                {/* 3-line hamburger icon (☰) that morphs to X when active */}
                <div className="hamburger-box">
                  <span className="hamburger-inner-line" />
                  <span className="hamburger-inner-line" />
                  <span className="hamburger-inner-line" />
                </div>
              </button>

              {/* Desktop revealed menu items: Home, Women, Men (hidden by default, slides in on tap) */}
              <nav
                className={`nav-revealed-menu ${isMenuOpen ? "is-revealed" : ""}`}
                aria-hidden={!isMenuOpen}
              >
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link ${pathname === "/" ? "active" : ""}`}
                >
                  Home
                </Link>
                <Link
                  href="/women"
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link ${pathname.startsWith("/women") ? "active" : ""}`}
                >
                  Women
                </Link>
                <Link
                  href="/men"
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link ${pathname.startsWith("/men") ? "active" : ""}`}
                >
                  Men
                </Link>
              </nav>
            </div>

            {/* Center: Brand Logo */}
            <Link href="/" className="nav-logo" aria-label="ZENVORA Home">
              ZENVORA
            </Link>

            {/* Right: Actions (Search, Account, Cart) */}
            <div className="nav-right">
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search overlay"
              >
                <SearchIcon size={20} />
              </button>

              <Link
                href={user ? "/profile" : "/login"}
                className="nav-icon-btn"
                aria-label={user ? `Account profile (${user.email})` : "Account login"}
                style={{ position: "relative" }}
              >
                <UserIcon size={20} />
                {user && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-gold)",
                      border: "1.5px solid var(--bg-surface)",
                    }}
                    title="Signed in"
                  />
                )}
              </Link>

              <Link
                href="/cart"
                className="nav-icon-btn"
                aria-label={`Shopping bag with ${totalCount} items`}
              >
                <ShoppingBagIcon size={20} />
                {totalCount > 0 && (
                  <span className="cart-badge">{totalCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Full-Screen Search Overlay */}

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
