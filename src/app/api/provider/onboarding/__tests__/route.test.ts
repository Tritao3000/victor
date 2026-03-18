import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSession = {
  user: { id: 'user-1', email: 'test@test.com', name: 'Test User', role: 'CUSTOMER' },
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
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    serviceProvider: {
      create: vi.fn(),
    },
  },
}));

const { POST } = await import('../route');
const { auth } = await import('@/lib/auth');
const { prisma } = await import('@/lib/prisma');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/provider/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  phone: '+1234567890',
  bio: 'Expert plumber',
  serviceTypes: ['PLUMBING'],
  specialties: ['leak repair'],
  city: 'Austin',
  state: 'TX',
  serviceRadius: 25,
  licenseNumber: 'LIC-123',
};

describe('POST /api/provider/onboarding', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 409 when user is already a service provider', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      serviceProviderId: 'existing-provider-id',
    } as never);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('Already onboarded as a service provider');
  });

  it('returns 400 for invalid input', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

    const res = await POST(makeRequest({ phone: '+1234567890' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid input');
  });

  it('creates a new service provider when valid', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'user-1',
      serviceProviderId: null,
    } as never);
    vi.mocked(prisma.serviceProvider.create).mockResolvedValueOnce({
      id: 'provider-1',
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as never);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.providerId).toBe('provider-1');
  });

  it('rejects bio exceeding 500 characters', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);

    const res = await POST(makeRequest({
      ...validBody,
      bio: 'a'.repeat(501),
    }));
    expect(res.status).toBe(400);
  });
});
