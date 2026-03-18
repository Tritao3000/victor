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
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: { update: vi.fn() },
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    refunds: { create: vi.fn() },
  },
}));

const { POST } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');
const { stripe } = await import('@/lib/stripe');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/payments/refund', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/payments/refund', () => {
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
      payment: { amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when no payment exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: null,
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(400);
  });

  it('returns 409 when payment is already refunded', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'CANCELLED',
      payment: { id: 'pay-1', amount: 10000, status: 'REFUNDED', stripePaymentIntentId: 'pi_1' },
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(409);
  });

  it('issues full refund for REQUESTED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);
    vi.mocked(stripe.refunds.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.refundAmount).toBe(10000);
    expect(data.isFullRefund).toBe(true);

    expect(stripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_1',
        amount: 10000,
      }),
    );
  });

  it('issues full refund for MATCHING booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'MATCHING',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);
    vi.mocked(stripe.refunds.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    const data = await res.json();
    expect(data.refundAmount).toBe(10000);
    expect(data.isFullRefund).toBe(true);
  });

  it('issues 50% refund for MATCHED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'MATCHED',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);
    vi.mocked(stripe.refunds.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    const data = await res.json();
    expect(data.refundAmount).toBe(5000); // 50%
    expect(data.isFullRefund).toBe(false);
  });

  it('issues 50% refund for PROVIDER_EN_ROUTE booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'PROVIDER_EN_ROUTE',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);
    vi.mocked(stripe.refunds.create).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    const data = await res.json();
    expect(data.refundAmount).toBe(5000);
    expect(data.isFullRefund).toBe(false);
  });

  it('rejects refund for IN_PROGRESS booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'IN_PROGRESS',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Refund not available');
  });

  it('rejects refund for COMPLETED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'COMPLETED',
      payment: { id: 'pay-1', amount: 10000, status: 'CAPTURED', stripePaymentIntentId: 'pi_1' },
    } as never);

    const res = await POST(makeRequest({ bookingId: 'b-1' }));
    expect(res.status).toBe(400);
  });
});
