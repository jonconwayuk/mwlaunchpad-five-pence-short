import { describe, expect, it } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import type { EngineState } from '@/src/engine/types';
import { computeState } from '@/src/engine';
import { T, branchInput, contracted, done } from '@/src/engine/__tests__/fixtures';
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
  it('starter state never contains a Line Manager Task', () => {
    for (const as of ['starter', 'delegate'] as const) expect(filterForViewer(raw, as).tasks.some((t) => t.owner === 'line-manager')).toBe(false);
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

describe('filterForViewer, D2f.4 masking for the starter', () => {
  const waiting = [...contracted, done('i-checks', 'a-rtw', '2026-10-23')];
  const failedToday = [...waiting, done('i-checks', 'a-vetting', T, { automationResult: 'failed' })];
  const starter = (patch: Parameters<typeof branchInput>[0]) => filterForViewer(computeState(branchInput(patch)), 'starter');
  const decided = (decision: 'confirm' | 'dismiss') =>
    starter({ progress: failedToday, hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision, at: T }] });

  it('starter state, while a Hard Stop is pending, is identical to before the failure', () => {
    const before = starter({ progress: waiting });
    const pending = starter({ progress: failedToday });
    expect(pending.items).toEqual(before.items);
    expect(pending.containers).toEqual(before.containers);
    expect(pending.stopped).toBe(false);
  });
  it('starter state, after Dismiss, shows the item normally', () => {
    const s = decided('dismiss');
    expect(s.items.find((i) => i.itemId === 'i-checks')).toMatchObject({ status: 'done', outcome: 'failed', doneAt: T });
    expect(s.items.find((i) => i.itemId === 'i-id')?.available).toBe(true);
    expect(s.stopped).toBe(false);
  });
  it('starter state, after Confirm, keeps the Cancelled items and is stopped', () => {
    const s = decided('confirm');
    expect(s.items.find((i) => i.itemId === 'i-payroll')?.status).toBe('cancelled');
    expect(s.stopped).toBe(true);
  });
  it('starter state, with two Hard Stops pending, masks only the item whose own Hard Stop is pending', () => {
    // A second copy of the same Journey (same title) failed too, but its Hard Stop was Dismissed.
    const input = branchInput({
      progress: [...failedToday, done('i-checks-2', 'a-rtw', '2026-10-23'), done('i-checks-2', 'a-vetting', T, { automationResult: 'failed' })],
      hardStopDecisions: [{ hardStopId: 'hs-checks-2-failed', decision: 'dismiss', reason: 'Retest booked', at: T }],
    });
    const p = input.pathway;
    p.items.push({ ...p.items.find((i) => i.id === 'i-checks')!, id: 'i-checks-2', containerId: undefined });
    p.timers.push({ id: 't-payroll-deadline', label: 'Offer accepted', anchor: { kind: 'offer-accepted' }, offsetDays: 1 });
    p.hardStops.push(
      { id: 'hs-checks-2-failed', label: 'Second checks failed', trigger: { kind: 'on-failed', itemId: 'i-checks-2' }, stops: { wholePathway: true, itemIds: [], containerIds: [] } },
      { id: 'hs-payroll-deadline', label: 'Payroll late', trigger: { kind: 'on-deadline', timerId: 't-payroll-deadline', watchesItemId: 'i-payroll' }, stops: { wholePathway: false, itemIds: ['i-buddy'], containerIds: [] } },
    );
    const raw = computeState(input);
    expect(raw.needsDecisions.map((n) => n.hardStopId).sort()).toEqual(['hs-checks-failed', 'hs-payroll-deadline']);
    const s = filterForViewer(raw, 'starter');
    expect(s.items.find((i) => i.itemId === 'i-checks')).toMatchObject({ status: 'in-progress', outcome: undefined });
    expect(s.items.find((i) => i.itemId === 'i-checks-2')).toMatchObject({ status: 'done', outcome: 'failed' });
  });
  it('starter state, when only a deadline Hard Stop cancelled items, is not stopped', () => {
    expect(filterForViewer({ ...raw, items: raw.items.map((i, n) => (n === 0 ? { ...i, status: 'cancelled' as const } : i)) }, 'starter').stopped).toBe(false);
  });
});
