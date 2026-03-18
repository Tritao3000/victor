import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  serviceProvider: {
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

const { findBestProvider } = await import('../matching');

function makeProvider(overrides: Record<string, unknown> = {}) {
  return {
    id: 'provider-1',
    rating: 4.5,
    totalReviews: 10,
    ...overrides,
  };
}

describe('findBestProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds a provider and returns their id with a score', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([
      makeProvider({ id: 'p1', rating: 4.8 }),
    ]);

    const result = await findBestProvider('PLUMBING', 'Lisbon');

    expect(result).not.toBeNull();
    expect(result!.providerId).toBe('p1');
    expect(result!.score).toBeGreaterThan(0);
    expect(mockPrisma.serviceProvider.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          serviceTypes: { has: 'PLUMBING' },
          verificationStatus: 'VERIFIED',
          isActive: true,
          city: { equals: 'Lisbon', mode: 'insensitive' },
        }),
      }),
    );
  });

  it('returns null when no providers available', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([]);

    const result = await findBestProvider('ELECTRICAL', 'Porto');

    expect(result).toBeNull();
  });

  it('picks the higher-rated provider more often', async () => {
    const highRated = makeProvider({ id: 'high', rating: 5.0 });
    const lowRated = makeProvider({ id: 'low', rating: 1.0 });

    let highWins = 0;
    const runs = 100;

    for (let i = 0; i < runs; i++) {
      mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([highRated, lowRated]);
      const result = await findBestProvider('PLUMBING', 'Lisbon');
      if (result!.providerId === 'high') highWins++;
    }

    // With 60% rating weight + 40% random, high-rated should win more often
    expect(highWins).toBeGreaterThan(50);
  });

  it('excludes declined providers', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([
      makeProvider({ id: 'p2', rating: 4.0 }),
    ]);

    await findBestProvider('PLUMBING', 'Lisbon', ['declined-1', 'declined-2']);

    expect(mockPrisma.serviceProvider.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { notIn: ['declined-1', 'declined-2'] },
        }),
      }),
    );
  });

  it('does not add notIn filter when excludeProviderIds is empty', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([]);

    await findBestProvider('PLUMBING', 'Lisbon', []);

    const callArgs = mockPrisma.serviceProvider.findMany.mock.calls[0][0];
    expect(callArgs.where.id).toBeUndefined();
  });

  it('applies case-insensitive city filter', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([
      makeProvider({ id: 'p1', rating: 4.0 }),
    ]);

    await findBestProvider('PLUMBING', 'lisbon');

    expect(mockPrisma.serviceProvider.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          city: { equals: 'lisbon', mode: 'insensitive' },
        }),
      }),
    );
  });

  it('returns score between 0 and 1', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([
      makeProvider({ id: 'p1', rating: 3.0 }),
    ]);

    const result = await findBestProvider('PLUMBING', 'Lisbon');

    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(1);
  });

  it('selects only id, rating, totalReviews fields', async () => {
    mockPrisma.serviceProvider.findMany.mockResolvedValueOnce([]);

    await findBestProvider('ELECTRICAL', 'Porto');

    expect(mockPrisma.serviceProvider.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          id: true,
          rating: true,
          totalReviews: true,
        },
      }),
    );
  });
});
