"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Product } from "./data";
import { insforge } from "./insforge";
import { useAuth } from "./auth";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  category: "women" | "men";
  subcategory: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (id: string, size: string) => void;
  updateQty: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "zenvora_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

  // 1. Initial hydration: read local storage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const upgraded = parsed.map((item: CartItem) => {
            if (item.image && typeof item.image === "string" && item.image.includes("1509631179647-0177331693ae")) {
              return {
                ...item,
                image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
              };
            }
            return item;
          });
          setItems(upgraded);
        }
      }
    } catch (err) {
      console.warn("Failed to load cart from localStorage", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Sync to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to save cart to localStorage", err);
    }
  }, [items, isHydrated]);

  // 3. When user changes / logs in, load & merge with remote database cart
  const syncWithDatabase = useCallback(async (currentUserId: string) => {
    try {
      // Fetch user's cart rows from DB
      const { data: dbRows, error } = await insforge.database
        .from("carts")
        .select("*, products(*)")
        .eq("user_id", currentUserId);

      if (error) {
        console.warn("Failed to fetch remote cart:", error);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbItems: CartItem[] = (dbRows || []).map((row: any) => {
        const p = row.products || {};
        const images = Array.isArray(p.images)
          ? p.images
          : typeof p.images === "string"
          ? JSON.parse(p.images)
          : [""];
        let primaryImg = images[0] || "";
        if (primaryImg && typeof primaryImg === "string" && primaryImg.includes("1509631179647-0177331693ae")) {
          primaryImg = "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80";
        }
        return {
          id: row.product_id,
          name: p.name || row.product_id,
          price: Number(p.price || 0),
          image: primaryImg,
          size: row.size,
          quantity: row.quantity,
          category: p.category || "women",
          subcategory: p.subcategory || "",
        };
      });

      // Merge local items with DB items
      setItems((prevLocal) => {
        const merged = [...dbItems];
        for (const localItem of prevLocal) {
          const existingIdx = merged.findIndex(
            (m) => m.id === localItem.id && m.size === localItem.size
          );
          if (existingIdx === -1) {
            merged.push(localItem);
            // Also push to DB
            insforge.database
              .from("carts")
              .insert([
                {
                  user_id: currentUserId,
                  product_id: localItem.id,
                  size: localItem.size,
                  quantity: localItem.quantity,
                },
              ])
              .then(() => {});
          }
        }
        return merged;
      });
    } catch (err) {
      console.warn("Cart DB sync error:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      syncWithDatabase(user.id);
    }
  }, [user?.id, syncWithDatabase]);

  const addItem = (product: Product, size: string, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      let newQty = quantity;
      if (existingIndex > -1) {
        newQty = prev[existingIndex].quantity + quantity;
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };

        // Write-through to database if logged in
        if (userRef.current?.id) {
          insforge.database
            .from("carts")
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq("user_id", userRef.current.id)
            .eq("product_id", product.id)
            .eq("size", size)
            .then();
        }

        return updated;
      }

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size,
        quantity,
        category: product.category,
        subcategory: product.subcategory,
      };

      // Write-through to database if logged in
      if (userRef.current?.id) {
        insforge.database
          .from("carts")
          .insert([
            {
              user_id: userRef.current.id,
              product_id: product.id,
              size,
              quantity,
            },
          ])
          .then();
      }

      return [...prev, newItem];
    });
  };

  const removeItem = (id: string, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));

    // Write-through to database if logged in
    if (userRef.current?.id) {
      insforge.database
        .from("carts")
        .delete()
        .eq("user_id", userRef.current.id)
        .eq("product_id", id)
        .eq("size", size)
        .then();
    }
  };

  const updateQty = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );

    // Write-through to database if logged in
    if (userRef.current?.id) {
      insforge.database
        .from("carts")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("user_id", userRef.current.id)
        .eq("product_id", id)
        .eq("size", size)
        .then();
    }
  };

  const clearCart = () => {
    setItems([]);

    // Write-through to database if logged in
    if (userRef.current?.id) {
      insforge.database
        .from("carts")
        .delete()
        .eq("user_id", userRef.current.id)
        .then();
    }
  };

  // Compute total count and subtotal
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalCount: isHydrated ? totalCount : 0,
        subtotal,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
