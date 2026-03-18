import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockPrisma = {
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    capture: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    create: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  calculateFees: (amount: number) => ({
    platformFee: Math.round(amount * 0.2),
    providerPayout: amount - Math.round(amount * 0.2),
  }),
  eurosToCents: (euros: number) => Math.round(euros * 100),
}));

vi.mock('@/lib/matching', () => ({
  findBestProvider: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendProviderMatchedEmail: vi.fn(),
  sendBookingCancelledEmail: vi.fn(),
}));

const { triggerMatching, checkProviderTimeout, capturePayment, releasePayment, createPaymentHold } =
  await import('../booking-pipeline');
const { findBestProvider } = await import('@/lib/matching');

function makeBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-1',
    customerId: 'user-1',
    serviceType: 'PLUMBING',
    city: 'Austin',
    address: '123 Main St',
    status: 'REQUESTED',
    matchAttempts: 0,
    declinedProviderIds: [],
    estimatedPrice: 100,
    matchedAt: null,
    providerId: null,
    payment: null,
    scheduledFor: new Date(),
    serviceCategory: { name: 'Leak Repair' },
    customer: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
    ...overrides,
  };
}

describe('triggerMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds a provider and assigns them', async () => {
    const booking = makeBooking();
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    vi.mocked(findBestProvider).mockResolvedValueOnce({
      providerId: 'provider-1',
      score: 0.9,
    });
    const updatedBooking = { ...booking, providerId: 'provider-1', status: 'MATCHING' };
    mockPrisma.booking.update.mockResolvedValueOnce(updatedBooking);

    const result = await triggerMatching('booking-1');

    expect(result.matched).toBe(true);
    expect(findBestProvider).toHaveBeenCalledWith('PLUMBING', 'Austin', []);
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-1' },
        data: expect.objectContaining({
          providerId: 'provider-1',
          status: 'MATCHING',
        }),
      }),
    );
  });

  it('cancels booking when no provider found', async () => {
    const booking = makeBooking();
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    vi.mocked(findBestProvider).mockResolvedValueOnce(null);
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      status: 'CANCELLED',
    });

    const result = await triggerMatching('booking-1');

    expect(result.matched).toBe(false);
    expect((result as { message?: string }).message).toContain('cancelled');
  });

  it('cancels booking when max attempts reached', async () => {
    const booking = makeBooking({ matchAttempts: 3 });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      status: 'CANCELLED',
    });

    const result = await triggerMatching('booking-1');

    expect(result.matched).toBe(false);
    expect(findBestProvider).not.toHaveBeenCalled();
  });

  it('excludes declined providers from matching', async () => {
    const booking = makeBooking({
      declinedProviderIds: ['declined-1', 'declined-2'],
    });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    vi.mocked(findBestProvider).mockResolvedValueOnce({
      providerId: 'provider-3',
      score: 0.8,
    });
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      providerId: 'provider-3',
    });

    await triggerMatching('booking-1');

    expect(findBestProvider).toHaveBeenCalledWith(
      'PLUMBING',
      'Austin',
      ['declined-1', 'declined-2'],
    );
  });

  it('releases payment hold when booking cancelled and payment exists', async () => {
    const booking = makeBooking({
      matchAttempts: 3,
      payment: {
        id: 'pay-1',
        stripePaymentIntentId: 'pi_123',
      },
    });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      status: 'CANCELLED',
    });
    mockStripe.paymentIntents.cancel.mockResolvedValueOnce({});
    mockPrisma.payment.update.mockResolvedValueOnce({});

    await triggerMatching('booking-1');

    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_123');
    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELLED' },
      }),
    );
  });
});

describe('checkProviderTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing if booking is not in MATCHING state', async () => {
    const booking = makeBooking({ status: 'MATCHED' });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);

    const result = await checkProviderTimeout('booking-1');

    expect(result).toEqual(booking);
    expect(mockPrisma.booking.update).not.toHaveBeenCalled();
  });

  it('does nothing if matchedAt is within timeout', async () => {
    const booking = makeBooking({
      status: 'MATCHING',
      providerId: 'provider-1',
      matchedAt: new Date(), // just now
    });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);

    const result = await checkProviderTimeout('booking-1');

    expect(result).toEqual(booking);
    expect(mockPrisma.booking.update).not.toHaveBeenCalled();
  });

  it('auto-declines and re-matches when provider timed out', async () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const booking = makeBooking({
      status: 'MATCHING',
      providerId: 'provider-1',
      matchedAt: sixMinutesAgo,
      declinedProviderIds: [],
    });
    mockPrisma.booking.findUnique
      .mockResolvedValueOnce(booking) // checkProviderTimeout
      .mockResolvedValueOnce({ ...booking, status: 'REQUESTED', providerId: null, declinedProviderIds: ['provider-1'] }); // triggerMatching re-fetch

    // First update: reset the booking (auto-decline)
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      status: 'REQUESTED',
      providerId: null,
    });

    // triggerMatching finds new provider
    vi.mocked(findBestProvider).mockResolvedValueOnce({
      providerId: 'provider-2',
      score: 0.85,
    });
    mockPrisma.booking.update.mockResolvedValueOnce({
      ...booking,
      providerId: 'provider-2',
      status: 'MATCHING',
    });

    const result = await checkProviderTimeout('booking-1');

    // Should have pushed the timed-out provider to declined list
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          providerId: null,
          declinedProviderIds: { push: 'provider-1' },
          status: 'REQUESTED',
        }),
      }),
    );
  });
});

describe('capturePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('captures payment intent and updates status', async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce({
      id: 'pay-1',
      bookingId: 'booking-1',
      stripePaymentIntentId: 'pi_123',
    });
    mockStripe.paymentIntents.capture.mockResolvedValueOnce({});
    mockPrisma.payment.update.mockResolvedValueOnce({});

    await capturePayment('booking-1');

    expect(mockStripe.paymentIntents.capture).toHaveBeenCalledWith('pi_123');
    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CAPTURED',
        }),
      }),
    );
  });

  it('returns null when no payment exists', async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce(null);

    const result = await capturePayment('booking-1');

    expect(result).toBeNull();
    expect(mockStripe.paymentIntents.capture).not.toHaveBeenCalled();
  });
});

describe('releasePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels payment intent and updates status', async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce({
      id: 'pay-1',
      bookingId: 'booking-1',
      stripePaymentIntentId: 'pi_123',
    });
    mockStripe.paymentIntents.cancel.mockResolvedValueOnce({});
    mockPrisma.payment.update.mockResolvedValueOnce({});

    await releasePayment('booking-1');

    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_123');
    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELLED' },
      }),
    );
  });

  it('returns null when no payment exists', async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce(null);

    const result = await releasePayment('booking-1');

    expect(result).toBeNull();
  });
});

describe('createPaymentHold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a payment intent with manual capture', async () => {
    const booking = makeBooking({ estimatedPrice: 150 });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@test.com',
      stripeCustomerId: 'cus_123',
    });
    mockStripe.paymentIntents.create.mockResolvedValueOnce({
      id: 'pi_new',
      client_secret: 'cs_secret',
    });
    mockPrisma.payment.create.mockResolvedValueOnce({ id: 'pay-new' });

    const result = await createPaymentHold('booking-1', 'user-1');

    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 15000, // 150 * 100
        currency: 'eur',
        capture_method: 'manual',
      }),
    );
    expect(result).toHaveProperty('clientSecret', 'cs_secret');
  });

  it('creates Stripe customer if none exists', async () => {
    const booking = makeBooking({ estimatedPrice: 100 });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@test.com',
      stripeCustomerId: null,
    });
    mockStripe.customers.create.mockResolvedValueOnce({ id: 'cus_new' });
    mockPrisma.user.update.mockResolvedValueOnce({});
    mockStripe.paymentIntents.create.mockResolvedValueOnce({
      id: 'pi_new',
      client_secret: 'cs_secret',
    });
    mockPrisma.payment.create.mockResolvedValueOnce({ id: 'pay-new' });

    await createPaymentHold('booking-1', 'user-1');

    expect(mockStripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@test.com',
      }),
    );
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stripeCustomerId: 'cus_new' },
      }),
    );
  });

  it('returns existing payment if already created', async () => {
    const existingPayment = { id: 'pay-existing' };
    const booking = makeBooking({ payment: existingPayment });
    mockPrisma.booking.findUnique.mockResolvedValueOnce(booking);

    const result = await createPaymentHold('booking-1', 'user-1');

    expect(result).toEqual(existingPayment);
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
  });
});
