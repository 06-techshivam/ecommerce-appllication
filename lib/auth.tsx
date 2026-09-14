"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { insforge } from "./insforge";
import type { UserSchema } from "@insforge/shared-schemas";

interface AuthContextType {
  user: UserSchema | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: UserSchema }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string; user?: UserSchema }>;
  verifyEmail: (email: string, otp: string) => Promise<{ error?: string; user?: UserSchema }>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        setUser(null);
      } else {
        setUser(data?.user || null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const unsubscribe = insforge.auth.onAuthStateChange(async () => {
      await refreshUser();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message || "Invalid credentials" };
      }
      if (data?.user) {
        setUser(data.user);
        return { user: data.user };
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      return { error: msg };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: name || undefined,
        redirectTo,
      });
      if (error) {
        return { error: error.message || "Failed to register" };
      }
      if (data?.user) {
        setUser(data.user);
        return { user: data.user };
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign up";
      return { error: msg };
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp,
      });
      if (error) {
        return { error: error.message || "Invalid or expired verification code." };
      }
      if (data?.user) {
        setUser(data.user);
        return { user: data.user };
      }
      await refreshUser();
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify email";
      return { error: msg };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email,
        redirectTo,
      });
      if (error) {
        return { error: error.message || "Failed to resend verification email" };
      }
      return { message: data?.message || "Verification email resent successfully. Please check your inbox." };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend verification email";
      return { error: msg };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
    } catch (err) {
      console.warn("Sign out failed", err);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, verifyEmail, resendVerificationEmail, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

