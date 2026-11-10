import { describe, expect, it } from 'vitest';
import { bandScale, shortDate } from './format';

describe('starter format', () => {
  it('shortDate, when given an ISO date, reads as day and month', () => {
    expect(shortDate('2026-11-10')).toBe('10 Nov');
    expect(shortDate('2027-01-08')).toBe('8 Jan');
  });

  it('bandScale, when Day 18 of a 21 to 35 range, puts today before the band', () => {
    const s = bandScale(18, [21, 35]);
    expect(s.max).toBe(42);
    expect(s.lo).toBe(50);
    expect(s.today).toBeLessThan(s.lo);
    expect(s.ticks).toHaveLength(7);
  });

  it('bandScale, when past the range, stretches the axis to keep today on it', () => {
    const s = bandScale(40, [21, 35]);
    expect(s.max).toBe(49);
    expect(s.today).toBeGreaterThan(s.hi);
    expect(s.today).toBeLessThan(100);
  });
});
