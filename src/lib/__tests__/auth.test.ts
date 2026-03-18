import { describe, it, expect, vi } from 'vitest';

// Mock Prisma before auth module loads
vi.mock('../prisma', () => ({
  prisma: {},
}));

// Mock better-auth to capture the config passed to it
let capturedConfig: Record<string, unknown> = {};
vi.mock('better-auth', () => ({
  betterAuth: (config: Record<string, unknown>) => {
    capturedConfig = config;
    return { api: {} };
  },
}));

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: (prisma: unknown, opts: unknown) => ({ prisma, opts }),
}));

// Import after mocks
await import('../auth');

describe('auth config', () => {
  it('enables email and password authentication', () => {
    expect(capturedConfig.emailAndPassword).toEqual({ enabled: true });
  });

  it('sets default user role to CUSTOMER', () => {
    const userConfig = capturedConfig.user as Record<string, unknown>;
    const fields = userConfig.additionalFields as Record<string, unknown>;
    const role = fields.role as Record<string, unknown>;
    expect(role.defaultValue).toBe('CUSTOMER');
    expect(role.required).toBe(true);
    expect(role.type).toBe('string');
  });

  it('configures session to expire in 7 days', () => {
    const session = capturedConfig.session as Record<string, unknown>;
    expect(session.expiresIn).toBe(60 * 60 * 24 * 7);
  });

  it('configures session update age to 1 day', () => {
    const session = capturedConfig.session as Record<string, unknown>;
    expect(session.updateAge).toBe(60 * 60 * 24);
  });

  it('uses prisma adapter with postgresql provider', () => {
    const db = capturedConfig.database as Record<string, unknown>;
    expect(db.opts).toEqual({ provider: 'postgresql' });
  });
});
