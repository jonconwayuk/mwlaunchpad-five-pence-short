import { describe, expect, it } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import { setLibrary } from './library';
import { fitToLanes, canvasReducer, laneX, LANE_W, loopMessage, snapshotFromFixture, snapToLane, timerLabel } from './model';

setLibrary([
  { id: 'j-contracting', version: 1, title: 'Contracting', stage: 'pre-contract', tags: {} },
  { id: 'j-payroll', version: 1, title: 'Payroll', stage: 'pre-employment', tags: {} },
  { id: 'j-branch-induction', version: 2, title: 'Branch induction', stage: 'onboarding', tags: {} },
]);
const snap = () => snapshotFromFixture(demoState, 'branch-colleague', 'Branch colleague');

describe('canvas model', () => {
  it('snapToLane, when dropped in another lane, clamps into the Journey Stage lane', () => {
    const p = snapToLane('onboarding', 10, 200);
    expect(p.x).toBeGreaterThanOrEqual(laneX('onboarding'));
    expect(p.x).toBeLessThan(laneX('onboarding') + LANE_W);
    expect(p.y).toBe(200);
  });

  it('loopMessage, when Contracting would wait for Payroll, names both Journeys in plain English', () => {
    expect(loopMessage(snap().items, 'i-payroll', 'i-contracting'))
      .toBe('Payroll already waits for Contracting, so Contracting cannot wait for Payroll.');
  });

  it('loopMessage, when the Dependency does not loop, returns null', () => {
    expect(loopMessage(snap().items, 'i-payroll', 'i-id')).toBeNull();
  });

  it('connect, when it would loop, leaves the snapshot unchanged', () => {
    const s = snap();
    expect(canvasReducer(s, { type: 'connect', sourceId: 'i-payroll', targetId: 'i-contracting' })).toBe(s);
  });

  it('add, when a Journey is dropped, creates a Pathway Item in its Stage lane', () => {
    const s = canvasReducer(snap(), { type: 'add', journeyId: 'j-branch-induction', x: 0, y: 100 });
    const item = s.items.at(-1);
    expect(item?.lane).toBe('onboarding');
    expect(item?.x).toBeGreaterThanOrEqual(laneX('onboarding'));
    expect(item?.journeyVersion).toBe(2);
  });

  it('removeDependency, when a Dependency is removed, drops only that Dependency', () => {
    const s = canvasReducer(snap(), { type: 'connect', sourceId: 'i-payroll', targetId: 'i-uniform' });
    const before = s.items.find((i) => i.id === 'i-uniform')!.dependsOn;
    const after = canvasReducer(s, { type: 'removeDependency', itemId: 'i-uniform', dependency: { kind: 'item', itemId: 'i-payroll' } })
      .items.find((i) => i.id === 'i-uniform')!.dependsOn;
    expect(before.some((d) => d.kind === 'item' && d.itemId === 'i-payroll')).toBe(true);
    expect(after).toEqual(before.filter((d) => !(d.kind === 'item' && d.itemId === 'i-payroll')));
  });

  it('snapshotFromFixture, when built, has the Container, Timer and Hard Stop', () => {
    const s = snap();
    expect(s.containers[0]?.itemIds).toEqual(['i-payroll', 'i-checks', 'i-id']);
    expect(s.hardStops[0]?.label).toBe('Pre-employment checks failed');
    expect(timerLabel(s.timers[0]!)).toBe('7 days before start date');
  });

  it('fitToLanes, when a card sits outside its lane, moves it in and leaves in-lane cards alone', () => {
    const s = snap();
    const out = { ...s, items: [{ ...s.items[0]!, lane: 'onboarding' as const, x: 640, y: 120 }, s.items[1]!] };
    const fitted = fitToLanes(out).items;
    expect(fitted[0]).toMatchObject({ x: laneX('onboarding') + 16, y: 192 });
    expect(fitted[1]).toBe(s.items[1]);
  });
});
