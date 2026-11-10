import { describe, expect, it } from 'vitest';
import type { EngineState, ItemState } from '@/src/engine/types';
import { progressSummary } from './summary';

const item = (title: string, over: Partial<ItemState> = {}): ItemState => ({
  itemId: title, journeyId: title, title, stage: 'pre-employment', status: 'not-started', mandatory: true,
  available: true, blockedFlag: false, overdue: false, unmetDependencies: [], ...over,
});
const state = (items: ItemState[]): EngineState => ({
  today: '2026-12-01', stage: 'pre-employment', personStatus: 'joiner', dayNumber: 21, items,
  containers: [], timers: [], needsDecisions: [], tasks: [], notifications: [],
});

describe('progressSummary', () => {
  const es = state([
    item('Contract', { status: 'done' }), item('Payroll', { status: 'done' }), item('IT setup', { status: 'done' }),
    item('Privileged access', { status: 'in-progress', blockedFlag: true, usualRange: [19, 28] }),
    item('Team intro', { available: false }), item('Not for me', { status: 'skipped' }),
  ]);

  it('names the Stage, the count in words and the wait, when the Line Manager reads it', () => {
    expect(progressSummary('Bob Warwick', es, true).line)
      .toBe('Bob is in Pre-employment. 3 of 5 things done. Waiting on privileged access, usually 19 to 28 days.');
  });
  it('says the plan stopped, when an item is cancelled by a confirmed Hard Stop', () => {
    expect(progressSummary('Bob Warwick', state([item('Contract', { status: 'done' }), item('IT setup', { status: 'cancelled' })]), true))
      .toEqual({ line: 'Bob is in Pre-employment. Plan stopped.' });
  });
  it('gives no next thing, when the only open item is a wait or locked', () => {
    expect(progressSummary('Bob Warwick', es, true).next).toBeUndefined();
  });
  it('gives the first open available item as the next thing, when there is one', () => {
    expect(progressSummary('Bob Warwick', state([item('Contract', { status: 'done' }), item('IT setup')]), true))
      .toEqual({ line: 'Bob is in Pre-employment. 1 of 2 things done.', next: 'IT setup' });
  });
  it('says the Stage only, when a Buddy reads it', () => {
    expect(progressSummary('Bob Warwick', es, false)).toEqual({ line: 'Bob is in Pre-employment.' });
  });
});
