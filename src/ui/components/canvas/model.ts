import { wouldCreateLoop } from '@/src/engine/loops';
import type { DependencyRef, EngineState, PathwayItem, PathwaySnapshot, StageId, Tags, TimerDef } from '@/src/engine/types';
import { LIBRARY, STAGES } from './library';

export const LANE_W = 280;
export const LANE_H = 1000;
export const CARD_W = 220;
export const CARD_H = 72;
const PAD = 24;
const TOP = 72; // clears the lane label and a Container label above the first card

export const laneX = (stage: StageId) => STAGES.findIndex((s) => s.id === stage) * LANE_W;

/** The box a card may occupy in its Stage lane: React Flow node extent. */
export const laneExtent = (stage: StageId): [[number, number], [number, number]] =>
  [[laneX(stage) + PAD, TOP], [laneX(stage) + LANE_W - PAD, LANE_H - PAD]];

/** Clamp a drop or drag position into the Journey's Stage lane. */
export function snapToLane(stage: StageId, x: number, y: number): { x: number; y: number } {
  const [[x0, y0], [x1, y1]] = laneExtent(stage);
  return {
    x: Math.min(Math.max(x, x0), x1 - CARD_W),
    y: Math.min(Math.max(y, y0), y1 - CARD_H),
  };
}

export const titleOfJourney = (journeyId: string) =>
  LIBRARY.find((j) => j.id === journeyId)?.title ?? journeyId;

export function titleOfItem(items: PathwayItem[], itemId: string): string {
  const item = items.find((i) => i.id === itemId);
  return item ? titleOfJourney(item.journeyId) : itemId;
}

/** Plain-English refusal for a Dependency that would loop; null when it is fine. */
export function loopMessage(items: PathwayItem[], sourceId: string, targetId: string): string | null {
  const result = wouldCreateLoop(items, sourceId, targetId, (id) => titleOfItem(items, id));
  if (!result.loops) return null;
  const t = result.throughTitles;
  if (t.length === 1) return `${t[0]} cannot wait for itself.`;
  // Path runs from the target to the source: the source already waits for the target.
  const target = t[0];
  const source = t[t.length - 1];
  return `${source} already waits for ${target}, so ${target} cannot wait for ${source}.`;
}

export function timerLabel(timer: TimerDef): string {
  const n = Math.abs(timer.offsetDays);
  const days = `${n} ${n === 1 ? 'day' : 'days'}`;
  const anchor = {
    'offer-accepted': 'offer accepted',
    'start-date': 'start date',
    'item-done': 'a Journey is done',
    'container-complete': 'a Container is complete',
  }[timer.anchor.kind];
  return `${days} ${timer.offsetDays < 0 ? 'before' : 'after'} ${anchor}`;
}

/** Builds the initial PathwaySnapshot from the engine fixture (an EngineState). */
export function snapshotFromFixture(state: EngineState, id: string, title: string): PathwaySnapshot {
  const rowInLane = new Map<StageId, number>();
  const items: PathwayItem[] = state.items.map((s) => {
    const row = rowInLane.get(s.stage) ?? 0;
    rowInLane.set(s.stage, row + 1);
    // Met Dependencies are not in the fixture: SEED-DATA.md section 4 has these unlock after Contracting.
    const dependsOn: DependencyRef[] =
      s.unmetDependencies.length > 0 || s.stage !== 'pre-employment'
        ? s.unmetDependencies
        : [{ kind: 'item', itemId: 'i-contracting' }];
    return {
      id: s.itemId, journeyId: s.journeyId, journeyVersion: 1, mandatory: s.mandatory, dependsOn,
      containerId: state.containers.find((c) => c.remainingItemIds.includes(s.itemId))?.containerId,
      lane: s.stage, ...snapToLane(s.stage, laneX(s.stage) + PAD, TOP + row * (CARD_H + 32)),
    };
  });
  return {
    id: `${id}-draft`, pathwayId: id, version: 1, title,
    tags: { jobFamily: 'Branch', platform: 'Retail', grade: 'Colleague' },
    items,
    containers: state.containers.map((c) => ({ id: c.containerId, label: c.label, itemIds: c.remainingItemIds })),
    timers: [
      { id: 't-payroll-reminder', label: 'Payroll reminder', anchor: { kind: 'start-date' }, offsetDays: -7,
        reminder: { to: 'starter', aboutItemId: 'i-payroll', message: 'Add your bank details so we can pay you.' } },
      ...state.timers.map((t) => ({ id: t.timerId, label: 'Pulse check', anchor: { kind: 'start-date' as const }, offsetDays: 14 })),
    ],
    hardStops: [{
      id: 'hs-checks-failed', label: 'Pre-employment checks failed',
      trigger: { kind: 'on-failed', itemId: 'i-checks' },
      stops: { wholePathway: true, itemIds: [], containerIds: [] },
    }],
  };
}

export type CanvasAction =
  | { type: 'add'; journeyId: string; x: number; y: number }
  | { type: 'move'; itemId: string; x: number; y: number }
  | { type: 'connect'; sourceId: string; targetId: string }
  | { type: 'toggleMandatory'; itemId: string }
  | { type: 'remove'; itemId: string }
  | { type: 'tags'; tags: Tags }
  | { type: 'publish' };

export function canvasReducer(s: PathwaySnapshot, a: CanvasAction): PathwaySnapshot {
  const update = (itemId: string, fn: (i: PathwayItem) => PathwayItem) =>
    ({ ...s, items: s.items.map((i) => (i.id === itemId ? fn(i) : i)) });
  switch (a.type) {
    case 'add': {
      const journey = LIBRARY.find((j) => j.id === a.journeyId);
      if (!journey) return s;
      let n = 1;
      while (s.items.some((i) => i.id === `i-${journey.id}-${n}`)) n += 1;
      const item: PathwayItem = {
        id: `i-${journey.id}-${n}`, journeyId: journey.id, journeyVersion: 1, mandatory: true, dependsOn: [],
        lane: journey.stage, ...snapToLane(journey.stage, a.x, a.y),
      };
      return { ...s, items: [...s.items, item] };
    }
    case 'move':
      return update(a.itemId, (i) => ({ ...i, ...snapToLane(i.lane, a.x, a.y) }));
    case 'connect':
      if (loopMessage(s.items, a.sourceId, a.targetId)) return s;
      return update(a.targetId, (i) =>
        i.dependsOn.some((d) => d.kind === 'item' && d.itemId === a.sourceId)
          ? i
          : { ...i, dependsOn: [...i.dependsOn, { kind: 'item', itemId: a.sourceId }] });
    case 'toggleMandatory':
      return update(a.itemId, (i) => ({ ...i, mandatory: !i.mandatory }));
    case 'remove':
      return {
        ...s,
        items: s.items
          .filter((i) => i.id !== a.itemId)
          .map((i) => ({ ...i, dependsOn: i.dependsOn.filter((d) => !(d.kind === 'item' && d.itemId === a.itemId)) })),
        containers: s.containers.map((c) => ({ ...c, itemIds: c.itemIds.filter((id) => id !== a.itemId) })),
        timers: s.timers.filter((t) => t.reminder?.aboutItemId !== a.itemId),
        hardStops: s.hardStops.filter((h) => h.trigger.kind !== 'on-failed' || h.trigger.itemId !== a.itemId),
      };
    case 'tags':
      return { ...s, tags: a.tags };
    case 'publish':
      return { ...s, version: s.version + 1 };
  }
}
