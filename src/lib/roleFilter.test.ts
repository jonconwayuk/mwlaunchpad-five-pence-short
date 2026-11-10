import { describe, expect, it } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import type { EngineState } from '@/src/engine/types';
import { filterForViewer } from './roleFilter';

const raw: EngineState = {
  ...demoState,
  items: demoState.items.map((i, n) => ({ ...i, blockedFlag: true, outcome: n === 0 ? ('passed' as const) : i.outcome })),
  needsDecisions: [{ hardStopId: 'h', label: 'x', reason: 'r', stopsItemIds: [], wholePathway: true, raisedOn: demoState.today, extendAllowed: true }],
  tasks: [
    { itemId: 'a', actionId: 'x', label: 'l', owner: 'buddy', personId: 'p', starterName: 's', raisedOn: demoState.today },
    { itemId: 'b', actionId: 'y', label: 'l', owner: 'line-manager', personId: 'p', starterName: 's', raisedOn: demoState.today },
  ],
};

describe('filterForViewer', () => {
  it('strips Blocked Flags, Outcomes, Needs decisions and non-buddy Tasks when the viewer is the buddy', () => {
    const s = filterForViewer(raw, 'buddy');
    expect(s.items.some((i) => i.blockedFlag || 'outcome' in i)).toBe(false);
    expect(s.needsDecisions).toEqual([]);
    expect(s.tasks.map((t) => t.owner)).toEqual(['buddy']);
  });
  it('strips Blocked Flags and Needs decisions for the starter and adds actingFor for the delegate', () => {
    const s = filterForViewer(raw, 'starter');
    expect(s.items.some((i) => i.blockedFlag)).toBe(false);
    expect(s.needsDecisions).toEqual([]);
    expect(filterForViewer(raw, 'delegate', { actingFor: 'person-a' }).actingFor).toBe('person-a');
  });
  it('keeps everything for the line manager and HR', () => {
    expect(filterForViewer(raw, 'line-manager')).toBe(raw);
    expect(filterForViewer(raw, 'hr').needsDecisions).toHaveLength(1);
  });
});
