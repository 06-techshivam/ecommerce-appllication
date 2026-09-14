/**
 * Centralized Payment Configuration & UPI URI Utilities
 * Single source of truth for UPI ID, Payee/Merchant name, and payment URIs.
 */

export const PAYMENT_CONFIG = {
  upiId: process.env.NEXT_PUBLIC_UPI_ID || process.env.NEXT_PUBLIC_GOOGLE_PAY_ID || "shivamrp100@fam",
  payeeName: process.env.NEXT_PUBLIC_MERCHANT_NAME || process.env.NEXT_PUBLIC_PAYEE_NAME || "Shivam Prajapati",
  currency: "INR",
};

export interface UpiUriParams {
  upiId?: string;
  payeeName?: string;
  amount: number;
  orderId?: string;
  note?: string;
}

/**
 * Builds standard NPCI UPI payment URI:
 * upi://pay?pa=YOUR_UPI_ID&pn=YOUR_NAME&am=AMOUNT&cu=INR&tn=NOTE
 */
export function buildUpiPaymentUri({
  upiId = PAYMENT_CONFIG.upiId,
  payeeName = PAYMENT_CONFIG.payeeName,
  amount,
  orderId,
  note,
}: UpiUriParams): string {
  if (amount <= 0 || isNaN(amount)) {
    return "";
  }

  // UPI specification requires exactly 2 decimal places for amount (e.g. 16.00, 49.00, 125.00)
  const formattedAmount = amount.toFixed(2);
  const transactionNote = note || (orderId ? `Order ${orderId.slice(0, 15)}` : "ZENVORA Atelier");

  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: formattedAmount,
    cu: PAYMENT_CONFIG.currency,
    tn: transactionNote,
  });

  return `upi://pay?${params.toString()}`;
}

export type SupportedUpiApp = "gpay" | "phonepe" | "paytm" | "bhim" | "generic";

/**
 * Builds Google Pay specific direct intent / scheme.
 * On Android Chrome, the Android Intent syntax targeting com.google.android.apps.nbu.paisa.user
 * opens Google Pay directly.
 * On iOS, the gpay:// scheme is used.
 */
export function buildGooglePayIntentUri(params: UpiUriParams, isAndroid = false, isIos = false): string {
  if (params.amount <= 0 || isNaN(params.amount)) return "";

  const formattedAmount = params.amount.toFixed(2);
  const transactionNote = params.note || (params.orderId ? `Order ${params.orderId.slice(0, 15)}` : "ZENVORA Atelier");
  const queryParams = new URLSearchParams({
    pa: params.upiId || PAYMENT_CONFIG.upiId,
    pn: params.payeeName || PAYMENT_CONFIG.payeeName,
    am: formattedAmount,
    cu: PAYMENT_CONFIG.currency,
    tn: transactionNote,
  });

  if (isAndroid) {
    // Android Chrome direct intent for Google Pay
    return `intent://pay?${queryParams.toString()}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  }

  if (isIos) {
    // iOS Google Pay URL scheme
    return `gpay://upi/pay?${queryParams.toString()}`;
  }

  // Standard fallback
  return `upi://pay?${queryParams.toString()}`;
}

/**
 * Builds app-specific intent or deep link for popular Indian UPI apps
 */
export function buildAppSpecificUpiUri(app: SupportedUpiApp, params: UpiUriParams, isAndroid = false): string {
  if (params.amount <= 0 || isNaN(params.amount)) return "";

  const formattedAmount = params.amount.toFixed(2);
  const transactionNote = params.note || (params.orderId ? `Order ${params.orderId.slice(0, 15)}` : "ZENVORA Atelier");
  const queryParams = new URLSearchParams({
    pa: params.upiId || PAYMENT_CONFIG.upiId,
    pn: params.payeeName || PAYMENT_CONFIG.payeeName,
    am: formattedAmount,
    cu: PAYMENT_CONFIG.currency,
    tn: transactionNote,
  });

  if (app === "gpay") {
    return buildGooglePayIntentUri(params, isAndroid, !isAndroid);
  }

  if (isAndroid) {
    if (app === "phonepe") {
      return `intent://pay?${queryParams.toString()}#Intent;scheme=upi;package=com.phonepe.app;end`;
    }
    if (app === "paytm") {
      return `intent://pay?${queryParams.toString()}#Intent;scheme=upi;package=net.one97.paytm;end`;
    }
    if (app === "bhim") {
      return `intent://pay?${queryParams.toString()}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
    }
  }

  // Generic or iOS scheme fallbacks
  if (app === "phonepe") {
    return `phonepe://pay?${queryParams.toString()}`;
  }
  if (app === "paytm") {
    return `paytmmp://pay?${queryParams.toString()}`;
  }

  return `upi://pay?${queryParams.toString()}`;
}

