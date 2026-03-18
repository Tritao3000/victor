import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Resend
const mockSend = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

// Set RESEND_API_KEY before importing the module
vi.stubEnv('RESEND_API_KEY', 'test_key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://victor.test');

const {
  sendProviderMatchedEmail,
  sendProviderAcceptedEmail,
  sendProviderEnRouteEmail,
  sendJobCompletedEmail,
  sendBookingCancelledEmail,
} = await import('../email');

function makeEmailData(overrides: Record<string, unknown> = {}) {
  return {
    bookingId: 'booking-123',
    serviceType: 'PLUMBING',
    address: '123 Main St',
    city: 'Lisbon',
    scheduledFor: new Date('2026-03-20T10:00:00Z'),
    estimatedPrice: 150,
    customerName: 'John Doe',
    customerEmail: 'john@test.com',
    providerName: 'Pro Plumber',
    providerEmail: 'plumber@test.com',
    estimatedArrival: null as Date | null,
    finalPrice: null as number | null,
    ...overrides,
  };
}

describe('email notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendProviderMatchedEmail', () => {
    it('sends email to provider with booking details', async () => {
      const data = makeEmailData();
      mockSend.mockResolvedValueOnce({});

      await sendProviderMatchedEmail(data);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('plumber@test.com');
      expect(call.subject).toContain('PLUMBING');
      expect(call.html).toContain('John Doe');
      expect(call.html).toContain('123 Main St');
      expect(call.html).toContain('victor.test/provider/dashboard');
    });

    it('skips email when provider email is missing', async () => {
      const data = makeEmailData({ providerEmail: undefined });

      await sendProviderMatchedEmail(data);

      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('sendProviderAcceptedEmail', () => {
    it('sends email to customer with provider name', async () => {
      const data = makeEmailData();
      mockSend.mockResolvedValueOnce({});

      await sendProviderAcceptedEmail(data);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('john@test.com');
      expect(call.subject).toContain('Pro Plumber');
      expect(call.html).toContain('Pro Plumber');
      expect(call.html).toContain('victor.test/bookings/booking-123');
    });
  });

  describe('sendProviderEnRouteEmail', () => {
    it('sends email to customer with ETA', async () => {
      const eta = new Date('2026-03-20T10:30:00Z');
      const data = makeEmailData({ estimatedArrival: eta });
      mockSend.mockResolvedValueOnce({});

      await sendProviderEnRouteEmail(data);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('john@test.com');
      expect(call.subject).toContain('on the way');
      expect(call.html).toContain('Pro Plumber');
    });

    it('shows fallback text when no ETA', async () => {
      const data = makeEmailData({ estimatedArrival: null });
      mockSend.mockResolvedValueOnce({});

      await sendProviderEnRouteEmail(data);

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain('should arrive shortly');
    });
  });

  describe('sendJobCompletedEmail', () => {
    it('sends email with final price and review link', async () => {
      const data = makeEmailData({ finalPrice: 175 });
      mockSend.mockResolvedValueOnce({});

      await sendJobCompletedEmail(data);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('john@test.com');
      expect(call.subject).toContain('completed');
      expect(call.html).toContain('175.00');
      expect(call.html).toContain('victor.test/bookings/booking-123/review');
    });

    it('uses estimated price when final price is null', async () => {
      const data = makeEmailData({ finalPrice: null });
      mockSend.mockResolvedValueOnce({});

      await sendJobCompletedEmail(data);

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain('150.00');
    });
  });

  describe('sendBookingCancelledEmail', () => {
    it('sends cancellation email to customer', async () => {
      const data = makeEmailData();
      mockSend.mockResolvedValueOnce({});

      await sendBookingCancelledEmail(data);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.to).toBe('john@test.com');
      expect(call.subject).toContain('cancelled');
      expect(call.html).toContain('victor.test/book');
    });
  });

  describe('error handling', () => {
    it('does not throw when Resend returns an error', async () => {
      const data = makeEmailData();
      mockSend.mockRejectedValueOnce(new Error('API error'));

      // Should not throw
      await expect(sendProviderAcceptedEmail(data)).resolves.toBeUndefined();
    });
  });
});
