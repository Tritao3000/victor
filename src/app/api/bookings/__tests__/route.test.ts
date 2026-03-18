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
    serviceCategory: { findUnique: vi.fn() },
    service: { findUnique: vi.fn() },
    booking: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock('@/lib/booking-pipeline', () => ({
  triggerMatching: vi.fn().mockResolvedValue({ matched: true, booking: {} }),
  createPaymentHold: vi.fn().mockResolvedValue({ payment: {}, clientSecret: 'cs_test' }),
}));

// Import after mocks
const { POST, GET } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  describe('Uber-style flow', () => {
    const validBody = {
      serviceType: 'PLUMBING',
      serviceCategoryId: 'cat-1',
      urgency: 'SCHEDULED',
      scheduledFor: '2026-04-01T10:00:00Z',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      problemDescription: 'Leaky faucet',
      estimatedPrice: 100,
    };

    it('returns 400 when required fields are missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      const res = await POST(makeRequest({ serviceType: 'PLUMBING', serviceCategoryId: 'cat-1' }));
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Missing required fields');
    });

    it('returns 404 when service category not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      vi.mocked(prisma.serviceCategory.findUnique).mockResolvedValueOnce(null);

      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Service category not found');
    });

    it('creates a booking with server-calculated price', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      vi.mocked(prisma.serviceCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-1',
        basePrice: 100,
        serviceType: 'PLUMBING',
        name: 'Leak Repair',
        description: 'Fix leaks',
        estimatedDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdBooking = {
        id: 'booking-1',
        customerId: 'user-1',
        serviceType: 'PLUMBING',
        status: 'REQUESTED',
        estimatedPrice: 100,
      };
      vi.mocked(prisma.booking.create).mockResolvedValueOnce(createdBooking as never);
      // Re-fetch after matching
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(createdBooking as never);

      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(201);

      // Verify the booking was created with correct data
      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerId: 'user-1',
            serviceType: 'PLUMBING',
            serviceCategoryId: 'cat-1',
            urgency: 'SCHEDULED',
            estimatedPrice: 100, // 100 * 1.0 for SCHEDULED
            status: 'REQUESTED',
          }),
        }),
      );
    });

    it('applies urgency multiplier to price', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      vi.mocked(prisma.serviceCategory.findUnique).mockResolvedValueOnce({
        id: 'cat-1',
        basePrice: 100,
        serviceType: 'PLUMBING',
        name: 'Leak Repair',
        description: 'Fix leaks',
        estimatedDuration: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const createdBooking = { id: 'b-1', estimatedPrice: 150 };
      vi.mocked(prisma.booking.create).mockResolvedValueOnce(createdBooking as never);
      vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce(createdBooking as never);

      await POST(makeRequest({ ...validBody, urgency: 'EMERGENCY' }));

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estimatedPrice: 150, // 100 * 1.5 for EMERGENCY
            urgency: 'EMERGENCY',
          }),
        }),
      );
    });
  });

  describe('Legacy flow', () => {
    const legacyBody = {
      serviceId: 'svc-1',
      providerId: 'prov-1',
      scheduledFor: '2026-04-01T10:00:00Z',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      problemDescription: 'Leaky faucet',
      quotedPrice: 75,
    };

    it('returns 400 when required fields are missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      const res = await POST(makeRequest({ serviceId: 'svc-1' }));
      expect(res.status).toBe(400);
    });

    it('returns 404 when service not found', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      vi.mocked(prisma.service.findUnique).mockResolvedValueOnce(null);

      const res = await POST(makeRequest(legacyBody));
      expect(res.status).toBe(404);
    });

    it('creates a legacy booking', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
      vi.mocked(prisma.service.findUnique).mockResolvedValueOnce({
        id: 'svc-1',
        serviceType: 'PLUMBING',
        name: 'Leak Repair',
        description: 'Fix leaks',
        category: 'Leak Repair',
        basePrice: 75,
        priceUnit: 'per job',
        estimatedDuration: 60,
        providerId: 'prov-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.booking.create).mockResolvedValueOnce({ id: 'b-1' } as never);

      const res = await POST(makeRequest(legacyBody));
      expect(res.status).toBe(201);
    });
  });
});

describe('GET /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns user bookings', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    const bookings = [
      { id: 'b-1', customerId: 'user-1', status: 'REQUESTED' },
      { id: 'b-2', customerId: 'user-1', status: 'COMPLETED' },
    ];
    vi.mocked(prisma.booking.findMany).mockResolvedValueOnce(bookings as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });
});
