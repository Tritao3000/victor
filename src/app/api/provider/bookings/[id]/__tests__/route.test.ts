import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks ---

const mockSession = {
  user: { id: 'user-1', email: 'provider@test.com', role: 'PROVIDER' },
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

const mockPrisma = {
  user: { findUnique: vi.fn() },
  booking: { findUnique: vi.fn(), update: vi.fn() },
};

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

vi.mock('@/lib/booking-pipeline', () => ({
  triggerMatching: vi.fn().mockResolvedValue({ matched: true, booking: {} }),
  capturePayment: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/email', () => ({
  sendProviderAcceptedEmail: vi.fn(),
  sendProviderEnRouteEmail: vi.fn(),
  sendJobCompletedEmail: vi.fn(),
}));

const { PATCH } = await import('../route');
const { auth } = await import('@/lib/auth');
const { capturePayment } = await import('@/lib/booking-pipeline');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/provider/bookings/booking-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockContext = { params: Promise.resolve({ id: 'booking-1' }) };

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'provider@test.com',
    serviceProvider: { id: 'sp-1', name: 'Test Provider', email: 'provider@test.com' },
    ...overrides,
  };
}

function makeBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: 'booking-1',
    providerId: 'sp-1',
    status: 'MATCHING',
    estimatedPrice: 100,
    quotedPrice: null,
    serviceType: 'PLUMBING',
    address: '123 Main St',
    city: 'Lisbon',
    scheduledFor: new Date(),
    declinedProviderIds: [],
    ...overrides,
  };
}

function setupAuth() {
  vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
  mockPrisma.user.findUnique.mockResolvedValueOnce(makeUser());
}

describe('PATCH /api/provider/bookings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Auth tests ---

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);
    const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not a provider', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      serviceProvider: null,
    });
    const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
    expect(res.status).toBe(403);
  });

  it('returns 404 when booking not found', async () => {
    setupAuth();
    mockPrisma.booking.findUnique.mockResolvedValueOnce(null);
    const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
    expect(res.status).toBe(404);
  });

  it('returns 403 when provider does not own the booking', async () => {
    setupAuth();
    mockPrisma.booking.findUnique.mockResolvedValueOnce(
      makeBooking({ providerId: 'other-provider' }),
    );
    const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
    expect(res.status).toBe(403);
  });

  // --- Accept action ---

  describe('action: accept', () => {
    it('accepts a MATCHING booking', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHING' }),
      );
      const updatedBooking = makeBooking({
        status: 'MATCHED',
        provider: { name: 'Test Provider', email: 'p@test.com' },
        customer: { id: 'c1', name: 'Customer', email: 'c@test.com', phone: null },
        service: null,
        serviceCategory: { name: 'Leak Repair' },
      });
      mockPrisma.booking.update.mockResolvedValueOnce(updatedBooking);

      const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe('MATCHED');
      expect(mockPrisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'MATCHED' }),
        }),
      );
    });

    it('rejects accept when not in MATCHING state', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHED' }),
      );

      const res = await PATCH(makeRequest({ action: 'accept' }), mockContext);
      expect(res.status).toBe(400);
    });
  });

  // --- Decline action ---

  describe('action: decline', () => {
    it('declines a MATCHING booking and re-triggers matching', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHING' }),
      );
      mockPrisma.booking.update.mockResolvedValueOnce(
        makeBooking({ status: 'REQUESTED', providerId: null }),
      );

      const res = await PATCH(makeRequest({ action: 'decline' }), mockContext);

      expect(res.status).toBe(200);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            providerId: null,
            status: 'REQUESTED',
            declinedProviderIds: { push: 'sp-1' },
          }),
        }),
      );
    });

    it('rejects decline when not in MATCHING state', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'IN_PROGRESS' }),
      );

      const res = await PATCH(makeRequest({ action: 'decline' }), mockContext);
      expect(res.status).toBe(400);
    });
  });

  // --- En route action ---

  describe('action: en_route', () => {
    it('marks provider as en route from MATCHED', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHED' }),
      );
      const updatedBooking = makeBooking({
        status: 'PROVIDER_EN_ROUTE',
        provider: { name: 'Test Provider', email: 'p@test.com' },
        customer: { id: 'c1', name: 'Customer', email: 'c@test.com', phone: null },
        service: null,
        serviceCategory: { name: 'Leak Repair' },
      });
      mockPrisma.booking.update.mockResolvedValueOnce(updatedBooking);

      const res = await PATCH(makeRequest({ action: 'en_route' }), mockContext);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe('PROVIDER_EN_ROUTE');
      expect(mockPrisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PROVIDER_EN_ROUTE' }),
        }),
      );
    });

    it('rejects en_route when not in MATCHED state', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHING' }),
      );

      const res = await PATCH(makeRequest({ action: 'en_route' }), mockContext);
      expect(res.status).toBe(400);
    });
  });

  // --- Start action ---

  describe('action: start', () => {
    it('starts job from PROVIDER_EN_ROUTE', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'PROVIDER_EN_ROUTE' }),
      );
      const updatedBooking = makeBooking({
        status: 'IN_PROGRESS',
        service: null,
        serviceCategory: { name: 'Leak Repair' },
        customer: { id: 'c1', name: 'Customer', email: 'c@test.com', phone: null },
      });
      mockPrisma.booking.update.mockResolvedValueOnce(updatedBooking);

      const res = await PATCH(makeRequest({ action: 'start' }), mockContext);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe('IN_PROGRESS');
    });

    it('rejects start when not in PROVIDER_EN_ROUTE state', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'MATCHED' }),
      );

      const res = await PATCH(makeRequest({ action: 'start' }), mockContext);
      expect(res.status).toBe(400);
    });
  });

  // --- Complete action ---

  describe('action: complete', () => {
    it('completes job from IN_PROGRESS and captures payment', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'IN_PROGRESS', quotedPrice: 120, estimatedPrice: 100 }),
      );
      const updatedBooking = makeBooking({
        status: 'COMPLETED',
        finalPrice: 120,
        provider: { name: 'Test Provider', email: 'p@test.com' },
        customer: { id: 'c1', name: 'Customer', email: 'c@test.com', phone: null },
        service: null,
        serviceCategory: { name: 'Leak Repair' },
      });
      mockPrisma.booking.update.mockResolvedValueOnce(updatedBooking);

      const res = await PATCH(makeRequest({ action: 'complete' }), mockContext);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe('COMPLETED');
      expect(capturePayment).toHaveBeenCalledWith('booking-1');
    });

    it('uses finalPrice from request body when provided', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'IN_PROGRESS', quotedPrice: 100 }),
      );
      mockPrisma.booking.update.mockResolvedValueOnce(
        makeBooking({ status: 'COMPLETED', finalPrice: 150, provider: {}, customer: { id: 'c1', name: 'C', email: 'c@t.com', phone: null }, service: null, serviceCategory: null }),
      );

      await PATCH(makeRequest({ action: 'complete', finalPrice: 150 }), mockContext);

      expect(mockPrisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ finalPrice: 150 }),
        }),
      );
    });

    it('rejects complete when not in IN_PROGRESS state', async () => {
      setupAuth();
      mockPrisma.booking.findUnique.mockResolvedValueOnce(
        makeBooking({ status: 'PROVIDER_EN_ROUTE' }),
      );

      const res = await PATCH(makeRequest({ action: 'complete' }), mockContext);
      expect(res.status).toBe(400);
    });
  });
});
