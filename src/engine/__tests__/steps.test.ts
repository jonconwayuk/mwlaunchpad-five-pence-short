import { describe, expect, it } from 'vitest';
import { computeState } from '../computeState';
import { T, branchInput, contracted, done } from './fixtures';

const item = (progress = contracted, id = 'i-contracting') =>
  computeState(branchInput({ progress })).items.find((i) => i.itemId === id)!;

describe('ItemState.actions', () => {
  it('lists the first Action current and the rest upcoming when the item is fresh and open', () => {
    expect(item([], 'i-contracting').actions?.map((a) => a.state)).toEqual(['current', 'upcoming']);
  });
  it('marks every Action upcoming when the item is not yet available', () => {
    expect(item([], 'i-manager').actions?.map((a) => a.state)).toEqual(['upcoming', 'upcoming', 'upcoming']);
  });
  it('marks done Actions with doneAt and the next one current when the item is part done', () => {
    const [a, b] = item([done('i-contracting', 'a-offer', '2026-10-21')]).actions!;
    expect(a).toMatchObject({ id: 'a-offer', state: 'done', doneAt: '2026-10-21' });
    expect(b).toMatchObject({ id: 'a-sign', state: 'current' });
  });
  it('marks every Action done and none current when the item is done', () => {
    expect(item().actions?.map((a) => a.state)).toEqual(['done', 'done']);
  });
  it('includes the owner for tasks and notifications only', () => {
    expect(item(contracted, 'i-manager').actions!.map((a) => a.owner)).toEqual(['line-manager', undefined, 'starter']);
  });
  it('never marks an Action current when the item is Cancelled', () => {
    const s = computeState(branchInput({
      progress: [...contracted, done('i-checks', 'a-rtw', T), done('i-checks', 'a-vetting', T, { automationResult: 'failed' })],
      hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision: 'confirm', at: T }],
    }));
    const cancelled = s.items.filter((i) => i.status === 'cancelled');
    expect(cancelled.length).toBeGreaterThan(0);
    expect(cancelled.some((i) => i.actions!.some((a) => a.state === 'current'))).toBe(false);
  });
});
