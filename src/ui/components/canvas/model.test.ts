import { describe, expect, it } from 'vitest';
import { demoState } from '@/src/engine/fixtures';
import { setLibrary } from './library';
import {
  blockPositions, cardSubtitle, CARD_H, CARD_W, fitToLanes, canvasReducer, HARD_STOP_H, laneX, LANE_W, loopMessage, nextFreeY,
  findWaitCycle, snapshotFromFixture, snapToLane, TIMER_H, timerLabel, timerLane,
} from './model';

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

  it('timerLabel, when the offset is 0, reads On start date', () => {
    expect(timerLabel({ id: 't', label: 'x', anchor: { kind: 'start-date' }, offsetDays: 0 })).toBe('On start date');
  });

  it('timerLane, when a Journey waits for the Timer, puts it in that Journey lane, else in its Anchor lane', () => {
    const s = snap();
    const gated = { ...s, items: s.items.map((i) => (i.id === 'i-id' ? { ...i, dependsOn: [{ kind: 'timer' as const, timerId: 't-x' }] } : i)) };
    const t = { id: 't-x', label: 'x', anchor: { kind: 'start-date' as const }, offsetDays: 14 };
    expect(timerLane(gated, t)).toBe(s.items.find((i) => i.id === 'i-id')!.lane);
    expect(timerLane(s, t)).toBe('onboarding');
    expect(timerLane(s, { ...t, offsetDays: -7 })).toBe('pre-employment');
  });

  it('blockPositions, when built, stacks every Timer and Hard Stop below the cards in its lane with no overlap', () => {
    const s = snap();
    const at = blockPositions(s);
    const boxes = [
      ...s.items.map((i) => ({ x: i.x, y: i.y, w: CARD_W, h: CARD_H })),
      ...s.timers.map((t) => ({ ...at.get(`timer:${t.id}`)!, w: CARD_W, h: TIMER_H })),
      ...s.hardStops.map((h) => ({ ...at.get(`hardStop:${h.id}`)!, w: CARD_W, h: HARD_STOP_H })),
    ];
    const overlap = (a: (typeof boxes)[number], b: (typeof boxes)[number]) =>
      a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    boxes.forEach((a, n) => boxes.slice(n + 1).forEach((b) => expect(overlap(a, b)).toBe(false)));
    expect(at.get('hardStop:hs-checks-failed')!.y).toBeGreaterThanOrEqual(nextFreeY(s, 'pre-contract'));
  });

  it('cardSubtitle, when a Journey appears twice, names the Timer day that gates each, and null when unique', () => {
    const s = snap();
    const base = s.items[0]!;
    const twins = {
      ...s,
      timers: [{ id: 't-14', label: 'x', anchor: { kind: 'start-date' as const }, offsetDays: 13 }],
      items: [base, { ...base, id: 'b', dependsOn: [{ kind: 'timer' as const, timerId: 't-14' }] }, { ...base, id: 'c', dependsOn: [] }],
    };
    expect(cardSubtitle(twins, twins.items[1]!)).toBe('Day 14');
    expect(cardSubtitle(twins, twins.items[2]!)).toBe('3 of 3');
    expect(cardSubtitle(s, s.items[1]!)).toBeNull();
  });

  it('findWaitCycle, when a Journey waits for its own Container or a Timer anchored on itself, names the loop', () => {
    const s = snap();
    const c = s.containers[0]!;
    const member = c.itemIds[0]!;
    const viaContainer = { ...s, items: s.items.map((i) => (i.id === member ? { ...i, dependsOn: [{ kind: 'container' as const, containerId: c.id }] } : i)) };
    expect(findWaitCycle(viaContainer, (id) => id)).toEqual([member, `Container ${c.label}`, member]);
    const viaTimer = {
      ...s,
      timers: [{ id: 't-self', label: 'Self', anchor: { kind: 'item-done' as const, itemId: member }, offsetDays: 1 }],
      items: s.items.map((i) => (i.id === member ? { ...i, dependsOn: [{ kind: 'timer' as const, timerId: 't-self' }] } : i)),
    };
    expect(findWaitCycle(viaTimer, (id) => id)).toEqual([member, 'Timer Self', member]);
    expect(findWaitCycle(s, (id) => id)).toBeNull();
  });
});
