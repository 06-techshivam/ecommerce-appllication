import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "ZENVORA | Luxury Minimal Apparel & Haute Prêt-à-Porter",
  description:
    "Refined garments, Italian wool tailoring, raw cashmere, and architectural silhouettes for modern living.",
  keywords: ["fashion", "luxury apparel", "minimalist fashion", "cashmere", "tailoring", "ZENVORA"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
