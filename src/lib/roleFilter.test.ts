import { describe, expect, it } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import type { EngineState } from '@/src/engine/types';
import { filterForViewer } from './roleFilter';

const raw: EngineState = {
  ...demoState,
  items: demoState.items.map((i, n) => ({ ...i, blockedFlag: true, outcome: n === 0 ? ('passed' as const) : i.outcome })),
  needsDecisions: [{ hardStopId: 'h', label: 'x', reason: 'r', stopsItemIds: [], wholePathway: true, raisedOn: demoState.today, extendAllowed: true }],
  notifications: [
    { to: 'starter', message: 's', sentOn: demoState.today },
    { to: 'buddy', message: 'b', sentOn: demoState.today },
    { to: 'line-manager', message: 'm', sentOn: demoState.today },
  ],
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
  it('strips check details from every item when the viewer is the buddy', () => {
    const base = raw.items[0];
    const checked = { ...raw, items: [{ ...base, waitingDays: 3, usualRange: [1, 2] as [number, number], overdue: true, currentAction: { actionId: 'x', label: 'Check', type: 'automation' as const } }] };
    const json = JSON.stringify(filterForViewer(checked as unknown as EngineState, 'buddy'));
    expect(json).not.toContain('"overdue":true');
    for (const k of ['"waitingDays"', '"usualRange"', '"type":"automation"']) expect(json).not.toContain(k);
  });
  it('strips Blocked Flags and Needs decisions for the starter and adds actingFor for the delegate', () => {
    const s = filterForViewer(raw, 'starter');
    expect(s.items.some((i) => i.blockedFlag)).toBe(false);
    expect(s.needsDecisions).toEqual([]);
    expect(filterForViewer(raw, 'delegate', { actingFor: 'person-a' }).actingFor).toBe('person-a');
  });
  it('sends each non-managerial viewer only the notifications addressed to them', () => {
    expect(filterForViewer(raw, 'starter').notifications.map((n) => n.to)).toEqual(['starter']);
    expect(filterForViewer(raw, 'delegate').notifications.map((n) => n.to)).toEqual(['starter']);
    expect(filterForViewer(raw, 'buddy').notifications.map((n) => n.to)).toEqual(['buddy']);
  });
  it('keeps everything for the line manager and HR', () => {
    expect(filterForViewer(raw, 'line-manager')).toBe(raw);
    expect(filterForViewer(raw, 'hr').needsDecisions).toHaveLength(1);
  });
});
