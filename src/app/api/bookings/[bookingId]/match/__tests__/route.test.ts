import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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
  },
}));

vi.mock('@/lib/matching', () => ({
  findBestProvider: vi.fn().mockResolvedValue(null),
}));

const { POST } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');

function makeParams(bookingId: string) {
  return { params: Promise.resolve({ bookingId }) };
}

describe('POST /api/bookings/:bookingId/match', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await POST(
      new NextRequest('http://localhost/api/bookings/b-1/match', { method: 'POST' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 when user does not own the booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'other-user',
      status: 'REQUESTED',
    } as never);

    const res = await POST(
      new NextRequest('http://localhost/api/bookings/b-1/match', { method: 'POST' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('Not authorized');
  });

  it('returns 404 when booking not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(null);

    const res = await POST(
      new NextRequest('http://localhost/api/bookings/b-1/match', { method: 'POST' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(404);
  });

  it('allows matching when user owns the booking', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'b-1',
      customerId: 'user-1',
      status: 'REQUESTED',
      serviceType: 'PLUMBING',
      city: 'Austin',
    } as never);
    vi.mocked(prisma.booking.update).mockResolvedValueOnce({
      id: 'b-1',
      status: 'MATCHING',
      matchAttempts: 1,
    } as never);

    const res = await POST(
      new NextRequest('http://localhost/api/bookings/b-1/match', { method: 'POST' }),
      makeParams('b-1'),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.matched).toBe(false);
  });
});
