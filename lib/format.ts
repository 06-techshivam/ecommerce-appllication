/**
 * Formats a number into a clean Indian Rupee (INR) currency string.
 * e.g. 195 -> "₹195" or 195.5 -> "₹195.50" or 380 -> "₹380"
 */
export function money(amount: number): string {
  if (amount % 1 === 0) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats an amount into an Indian Rupee (INR) currency string with Indian numbering (en-IN).
 * e.g. 380 -> "₹380"
 */
export function inr(amount: number): string {
  return money(amount);
}


