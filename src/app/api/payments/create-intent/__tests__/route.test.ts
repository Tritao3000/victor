import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks ---

const mockSession = {
  user: { id: 'user-1', email: 'test@test.com', role: 'CUSTOMER' },
};

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn() },
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: vi.fn() },
    paymentIntents: { create: vi.fn() },
  },
  calculateFees: vi.fn((amount: number) => ({
    platformFee: Math.round(amount * 0.2),
    providerPayout: amount - Math.round(amount * 0.2),
  })),
  eurosToCents: vi.fn((euros: number) => Math.round(euros * 100)),
}));

const { POST } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');
const { stripe } = await import('@/lib/stripe');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/payments/create-intent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when bookingId is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 404 when booking not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not the booking owner', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'other-user',
      status: 'REQUESTED',
      payment: null,
      provider: null,
      estimatedPrice: 100,
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(403);
  });

  it('returns 409 when payment already exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: { id: 'pay-1' },
      provider: null,
      estimatedPrice: 100,
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(409);
  });

  it('returns 400 when booking is not in REQUESTED status', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'IN_PROGRESS',
      payment: null,
      provider: null,
      estimatedPrice: 100,
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(400);
  });

  it('creates payment intent for valid booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: null,
      provider: null,
      estimatedPrice: 100,
      quotedPrice: null,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test User',
      stripeCustomerId: 'cus_existing',
    } as never);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValueOnce({
      id: 'pi_123',
      client_secret: 'secret_123',
    } as never);
    vi.mocked(prisma.payment.create).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.clientSecret).toBe('secret_123');
    expect(data.paymentIntentId).toBe('pi_123');
    expect(data.amount).toBe(10000); // 100 euros = 10000 cents
    expect(data.platformFee).toBe(2000); // 20%
    expect(data.providerPayout).toBe(8000);
  });

  it('creates Stripe customer when user has no stripeCustomerId', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: null,
      provider: null,
      estimatedPrice: 50,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      email: 'test@test.com',
      name: 'Test User',
      stripeCustomerId: null,
    } as never);
    vi.mocked(stripe.customers.create).mockResolvedValueOnce({
      id: 'cus_new',
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as never);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValueOnce({
      id: 'pi_456',
      client_secret: 'secret_456',
    } as never);
    vi.mocked(prisma.payment.create).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(200);

    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@test.com',
        metadata: { victorUserId: 'user-1' },
      }),
    );
  });

  it('sets up transfer for providers with connected account', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: null,
      provider: { stripeConnectedAccountId: 'acct_provider' },
      estimatedPrice: 100,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      stripeCustomerId: 'cus_existing',
    } as never);
    vi.mocked(stripe.paymentIntents.create).mockResolvedValueOnce({
      id: 'pi_789',
      client_secret: 'secret_789',
    } as never);
    vi.mocked(prisma.payment.create).mockResolvedValueOnce({} as never);

    await POST(makeRequest({ bookingId: 'b-1' }));

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        application_fee_amount: 2000,
        transfer_data: { destination: 'acct_provider' },
      }),
    );
  });
});
