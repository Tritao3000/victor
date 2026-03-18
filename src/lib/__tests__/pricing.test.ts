import { describe, it, expect } from 'vitest';
import { calculateEstimate } from '../pricing';

describe('calculateEstimate', () => {
  it('applies SCHEDULED multiplier (1.0x)', () => {
    expect(calculateEstimate(100, 'SCHEDULED')).toBe(100);
  });

  it('applies TODAY multiplier (1.2x)', () => {
    expect(calculateEstimate(100, 'TODAY')).toBe(120);
  });

  it('applies EMERGENCY multiplier (1.5x)', () => {
    expect(calculateEstimate(100, 'EMERGENCY')).toBe(150);
  });

  it('rounds to two decimal places', () => {
    // 33.33 * 1.2 = 39.996 → should round to 40.00
    expect(calculateEstimate(33.33, 'TODAY')).toBe(40);
  });

  it('handles zero base price', () => {
    expect(calculateEstimate(0, 'EMERGENCY')).toBe(0);
  });

  it('handles fractional prices correctly', () => {
    // 49.99 * 1.5 = 74.985 → should round to 74.99
    expect(calculateEstimate(49.99, 'EMERGENCY')).toBe(74.99);
  });

  it('handles small base prices', () => {
    // 0.01 * 1.5 = 0.015 → should round to 0.02
    expect(calculateEstimate(0.01, 'EMERGENCY')).toBe(0.02);
  });
});
