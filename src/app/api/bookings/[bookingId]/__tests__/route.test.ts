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
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const { GET, PATCH } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');

function makeParams(bookingId: string) {
  return { params: Promise.resolve({ bookingId }) };
}

function makePatchRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/bookings/b-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/bookings/:bookingId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await GET(
      new NextRequest('http://localhost/api/bookings/b-1'),
      makeParams('b-1'),
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when booking not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(null);

    const res = await GET(
      new NextRequest('http://localhost/api/bookings/b-1'),
      makeParams('b-1'),
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not the customer or provider', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'other-user',
      providerId: 'prov-1',
    } as never);
    // User lookup — not a service provider
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      serviceProvider: null,
    } as never);

    const res = await GET(
      new NextRequest('http://localhost/api/bookings/b-1'),
      makeParams('b-1'),
    );
    expect(res.status).toBe(403);
  });

  it('returns booking when user is the customer', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    const booking = { id: 'b-1', customerId: 'user-1', status: 'REQUESTED' };
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(booking as never);

    const res = await GET(
      new NextRequest('http://localhost/api/bookings/b-1'),
      makeParams('b-1'),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('b-1');
  });
});

describe('PATCH /api/bookings/:bookingId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not the booking owner', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'other-user',
      status: 'REQUESTED',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(403);
  });

  it('allows customer to cancel a REQUESTED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
    } as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({
      id: 'b-1',
      status: 'CANCELLED',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(200);
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('allows customer to cancel a MATCHING booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'MATCHING',
    } as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({
      id: 'b-1',
      status: 'CANCELLED',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(200);
  });

  it('rejects cancellation of IN_PROGRESS booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'IN_PROGRESS',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Cannot cancel');
  });

  it('rejects cancellation of COMPLETED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'COMPLETED',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'CANCELLED' }), makeParams('b-1'));
    expect(res.status).toBe(400);
  });

  it('rejects non-CANCELLED status transitions from customer', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
    } as never);

    const res = await PATCH(makePatchRequest({ status: 'COMPLETED' }), makeParams('b-1'));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid status transition');
  });

  it('rejects rescheduling an IN_PROGRESS booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'IN_PROGRESS',
    } as never);

    const res = await PATCH(
      makePatchRequest({ scheduledFor: '2026-05-01T10:00:00Z' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(400);
  });

  it('allows rescheduling a REQUESTED booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
    } as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({
      id: 'b-1',
      scheduledFor: new Date('2026-05-01T10:00:00Z'),
    } as never);

    const res = await PATCH(
      makePatchRequest({ scheduledFor: '2026-05-01T10:00:00Z' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(200);
  });
});
