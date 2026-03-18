import type { BookingUrgency } from '@prisma/client';
import { URGENCY_MULTIPLIERS } from './constants';

/**
 * Calculate upfront price estimate for a booking.
 * basePrice × urgencyMultiplier
 */
export function calculateEstimate(
  basePrice: number,
  urgency: BookingUrgency
): number {
  const multiplier = URGENCY_MULTIPLIERS[urgency];
  return Math.round(basePrice * multiplier * 100) / 100;
}
