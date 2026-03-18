/**
 * Format a price in euros for display.
 * Accepts amount in euros (float).
 */
export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
