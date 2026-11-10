import { describe, expect, it } from 'vitest';
import type { ItemState } from '@/src/engine/types';
import { bandScale, shortDate, starterView } from './format';

const it_ = (itemId: string, over: Partial<ItemState>): ItemState => ({
  itemId, journeyId: 'j-x', title: itemId, stage: 'pre-employment', status: 'not-started', mandatory: true,
  available: false, blockedFlag: false, overdue: false, unmetDependencies: [], ...over,
});

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

  it('starterView, when a Failed Outcome awaits its Hard Stop decision, still shows the wait', () => {
    const v = starterView([it_('i-checks', { status: 'done', outcome: 'failed', doneAt: '2026-11-10', usualRange: [21, 35] })]);
    expect(v.stopped).toBe(false);
    expect(v.items[0]).toMatchObject({ status: 'in-progress', outcome: undefined, doneAt: undefined });
  });

  it('starterView, when a Failed Outcome has been confirmed and items are Cancelled, is stopped', () => {
    const v = starterView([it_('i-checks', { status: 'done', outcome: 'failed' }), it_('i-id', { status: 'cancelled' })]);
    expect(v.stopped).toBe(true);
  });

  it('starterView, when a deadline Hard Stop cancelled some items, is not stopped', () => {
    expect(starterView([it_('i-buddy', { status: 'cancelled' })]).stopped).toBe(false);
  });
});
