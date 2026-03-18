import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks ---

vi.mock('@/lib/prisma', () => ({
  prisma: {
    payment: { findUnique: vi.fn(), update: vi.fn() },
    booking: { update: vi.fn() },
    serviceProvider: { updateMany: vi.fn() },
  },
}));

const mockConstructEvent = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
}));

const { POST } = await import('../route');
const { prisma } = await import('@/lib/prisma');

function makeWebhookRequest(body: string, signature: string | null): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (signature) headers['stripe-signature'] = signature;

  return new NextRequest('http://localhost/api/payments/webhook', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/payments/webhook', () => {
  const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    } else {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    }
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeWebhookRequest('{}', null));
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(makeWebhookRequest('{}', 'sig_invalid'));
    expect(res.status).toBe(400);
  });

  it('handles payment_intent.succeeded event', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    });

    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: 'pay-1',
      bookingId: 'b-1',
      stripePaymentIntentId: 'pi_123',
    } as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);

    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CAPTURED',
        }),
      }),
    );
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b-1' },
        data: { status: 'MATCHING' },
      }),
    );
  });

  it('handles payment_intent.payment_failed event', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_fail' } },
    });

    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: 'pay-2',
      stripePaymentIntentId: 'pi_fail',
    } as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);

    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
  });

  it('handles charge.refunded event with full refund', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'charge.refunded',
      data: {
        object: {
          payment_intent: 'pi_refund',
          amount_refunded: 10000,
        },
      },
    });

    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: 'pay-3',
      bookingId: 'b-3',
      amount: 10000,
      stripePaymentIntentId: 'pi_refund',
    } as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);

    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REFUNDED' }),
      }),
    );
    // Full refund should cancel the booking
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'CANCELLED' },
      }),
    );
  });

  it('handles charge.refunded event with partial refund', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'charge.refunded',
      data: {
        object: {
          payment_intent: 'pi_partial',
          amount_refunded: 5000,
        },
      },
    });

    vi.mocked(prisma.payment.findUnique).mockResolvedValueOnce({
      id: 'pay-4',
      bookingId: 'b-4',
      amount: 10000,
      stripePaymentIntentId: 'pi_partial',
    } as never);
    vi.mocked(prisma.payment.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);

    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PARTIALLY_REFUNDED' }),
      }),
    );
    // Partial refund should NOT cancel the booking
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it('handles account.updated event for fully onboarded provider', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_provider',
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
        },
      },
    });

    vi.mocked(prisma.serviceProvider.updateMany).mockResolvedValueOnce({ count: 1 } as never);

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);

    expect(prisma.serviceProvider.updateMany).toHaveBeenCalledWith({
      where: { stripeConnectedAccountId: 'acct_provider' },
      data: { stripeOnboardingComplete: true },
    });
  });

  it('acknowledges unhandled event types', async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: 'some.unknown.event',
      data: { object: {} },
    });

    const res = await POST(makeWebhookRequest('{}', 'sig_valid'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });
});
