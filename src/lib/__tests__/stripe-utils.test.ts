import { describe, it, expect, vi } from 'vitest';

// Mock Stripe constructor to avoid STRIPE_SECRET_KEY check
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      constructor() {}
    },
  };
});

// Set env before module loads
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');

// Import after mocks are set up
const { calculateFees, eurosToCents, centsToEuros, PLATFORM_FEE_PERCENT } = await import('../stripe');

describe('PLATFORM_FEE_PERCENT', () => {
  it('is 20%', () => {
    expect(PLATFORM_FEE_PERCENT).toBe(20);
  });
});

describe('calculateFees', () => {
  it('calculates 20% platform fee', () => {
    const { platformFee, providerPayout } = calculateFees(10000);
    expect(platformFee).toBe(2000);
    expect(providerPayout).toBe(8000);
  });

  it('platform fee + provider payout equals total', () => {
    const amount = 7777;
    const { platformFee, providerPayout } = calculateFees(amount);
    expect(platformFee + providerPayout).toBe(amount);
  });

  it('rounds platform fee to nearest cent', () => {
    // 333 * 0.2 = 66.6 → rounds to 67
    const { platformFee, providerPayout } = calculateFees(333);
    expect(platformFee).toBe(67);
    expect(providerPayout).toBe(266);
  });

  it('handles zero amount', () => {
    const { platformFee, providerPayout } = calculateFees(0);
    expect(platformFee).toBe(0);
    expect(providerPayout).toBe(0);
  });
});

describe('eurosToCents', () => {
  it('converts whole euros', () => {
    expect(eurosToCents(50)).toBe(5000);
  });

  it('converts fractional euros', () => {
    expect(eurosToCents(49.99)).toBe(4999);
  });

  it('rounds to nearest cent', () => {
    // 19.999 * 100 = 1999.9 → 2000
    expect(eurosToCents(19.999)).toBe(2000);
  });

  it('handles zero', () => {
    expect(eurosToCents(0)).toBe(0);
  });
});

describe('centsToEuros', () => {
  it('converts cents to euros', () => {
    expect(centsToEuros(5000)).toBe(50);
  });

  it('converts fractional cents', () => {
    expect(centsToEuros(4999)).toBe(49.99);
  });

  it('handles zero', () => {
    expect(centsToEuros(0)).toBe(0);
  });
});
