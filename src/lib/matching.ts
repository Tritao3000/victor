import { prisma } from './prisma';
import type { ServiceType } from '@prisma/client';

interface MatchResult {
  providerId: string;
  score: number;
}

/**
 * Find the best available provider for a booking.
 * Filter: serviceType match, verified, active, same city (v1).
 * Rank: rating (60%) + fewer match attempts on this booking (40%).
 * Returns null if no provider found.
 */
export async function findBestProvider(
  serviceType: ServiceType,
  city: string,
  excludeProviderIds: string[] = []
): Promise<MatchResult | null> {
  const providers = await prisma.serviceProvider.findMany({
    where: {
      serviceTypes: { has: serviceType },
      verificationStatus: 'VERIFIED',
      isActive: true,
      city: { equals: city, mode: 'insensitive' },
      ...(excludeProviderIds.length > 0 && {
        id: { notIn: excludeProviderIds },
      }),
    },
    select: {
      id: true,
      rating: true,
      totalReviews: true,
    },
  });

  if (providers.length === 0) return null;

  // Score: rating (60%) + random jitter for novelty (40%)
  // Normalize rating to 0-1 scale (rating is 0-5)
  const scored = providers.map((p) => ({
    providerId: p.id,
    score: (p.rating / 5) * 0.6 + Math.random() * 0.4,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}
