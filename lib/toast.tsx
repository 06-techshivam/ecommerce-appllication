"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckIcon } from "@/components/Icons";

interface Toast {
  id: string;
  message: string;
  submessage?: string;
}

interface ToastContextType {
  showToast: (message: string, submessage?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, submessage?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, submessage }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <CheckIcon size={16} color="var(--accent-gold)" />
            <div>
              <div style={{ fontWeight: 500 }}>{toast.message}</div>
              {toast.submessage && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-inverse-muted)" }}>
                  {toast.submessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

