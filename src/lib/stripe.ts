import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

// Platform fee percentage (20%)
export const PLATFORM_FEE_PERCENT = 20;

/**
 * Calculate platform fee and provider payout from a total amount (in cents).
 */
export function calculateFees(amountCents: number) {
  const platformFee = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
  const providerPayout = amountCents - platformFee;
  return { platformFee, providerPayout };
}

/**
 * Convert euros (float) to cents (integer) for Stripe.
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convert cents (integer) to euros (float) for display.
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

// Re-export formatPrice for server-side usage
export { formatPrice } from './format-price';
