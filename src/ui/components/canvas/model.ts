import { wouldCreateLoop } from '@/src/engine/loops';
import type { DependencyRef, EngineState, HardStopDef, PathwayItem, PathwaySnapshot, StageId, Tags, TimerDef } from '@/src/engine/types';
import { LIBRARY, STAGES } from './library';

// Four lanes of 250 fit the 1020px left beside the library on a 1280px laptop at zoom 1.
export const LANE_W = 250;
export const LANE_H = 1000;
export const CARD_W = 210;
export const CARD_H = 72;
const PAD = 16;
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

/** Seeded positions use a wider grid than the lanes; a card outside its lane moves into it, keeping its row. Saved canvas positions are already inside. */
export function fitToLanes(s: PathwaySnapshot): PathwaySnapshot {
  const inside = (i: PathwayItem) => { const [[x0, y0], [x1]] = laneExtent(i.lane); return i.x >= x0 && i.x + CARD_W <= x1 && i.y >= y0; };
  return { ...s, items: s.items.map((i) => (inside(i) ? i : { ...i, ...snapToLane(i.lane, laneX(i.lane) + PAD, i.y + TOP) })) };
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
  if (n === 0) return `On ${anchor}`;
  return `${days} ${timer.offsetDays < 0 ? 'before' : 'after'} ${anchor}`;
}

// Timers and Hard Stops have no canvas position in PathwaySnapshot, so they are placed from what they gate.
export const TIMER_H = 40;
export const HARD_STOP_H = 100; // three lines, the label wrapping to two
const GAP = 32; // clears a Container's dashed edge below its lowest card

const nextLane = (stage: StageId): StageId => STAGES[Math.min(STAGES.findIndex((x) => x.id === stage) + 1, STAGES.length - 1)]!.id;

/** The Stage lane a Timer sits in: the lane of the Journey it gates, else the lane of its Anchor. */
export function timerLane(s: PathwaySnapshot, t: TimerDef): StageId {
  const gated = s.items.find((i) => i.dependsOn.some((d) => d.kind === 'timer' && d.timerId === t.id));
  if (gated) return gated.lane;
  const a = t.anchor;
  const laneOfItem = (itemId: string | undefined) => s.items.find((i) => i.id === itemId)?.lane;
  if (a.kind === 'item-done') return laneOfItem(a.itemId) ?? 'onboarding';
  if (a.kind === 'container-complete') return laneOfItem(s.containers.find((c) => c.id === a.containerId)?.itemIds[0]) ?? 'onboarding';
  if (a.kind === 'offer-accepted') return 'pre-employment';
  return t.offsetDays < 0 ? 'pre-employment' : nextLane('pre-employment');
}

/** Top-left of every Timer and Hard Stop, keyed by node id, stacked below the lowest Journey card in its lane so none overlaps. */
export function blockPositions(s: PathwaySnapshot): Map<string, { x: number; y: number }> {
  const blocks = [
    ...s.timers.map((t) => ({ id: `timer:${t.id}`, lane: timerLane(s, t), h: TIMER_H })),
    // Hard Stops go in the far-left lane: it holds the fewest cards, so they stay on the first screen and clear of the side panel.
    ...s.hardStops.map((h) => ({ id: `hardStop:${h.id}`, lane: 'pre-contract' as StageId, h: HARD_STOP_H })),
  ];
  const next = new Map<StageId, number>();
  const out = new Map<string, { x: number; y: number }>();
  for (const b of blocks) {
    const y = next.get(b.lane) ?? nextFreeY(s, b.lane);
    out.set(b.id, { x: laneX(b.lane) + PAD, y });
    next.set(b.lane, y + b.h + 16);
  }
  return out;
}

/** The first y in a lane below every Journey card in it, where a new card or block can start. */
export const nextFreeY = (s: PathwaySnapshot, lane: StageId) =>
  Math.max(TOP, ...s.items.filter((i) => i.lane === lane).map((i) => i.y + CARD_H + GAP));

/** A muted second line that tells repeated Journeys apart: the Timer or Dependency that gates the card, else its place among them; null when the title is unique. */
export function cardSubtitle(s: PathwaySnapshot, item: PathwayItem): string | null {
  const twins = s.items.filter((i) => i.journeyId === item.journeyId);
  if (twins.length < 2) return null;
  for (const d of item.dependsOn) {
    if (d.kind === 'timer') {
      const t = s.timers.find((x) => x.id === d.timerId);
      // Day N is offset N-1 (decision 17).
      if (t) return t.anchor.kind === 'start-date' && t.offsetDays > 0 ? `Day ${t.offsetDays + 1}` : timerLabel(t);
    }
    if (d.kind === 'item') return `After ${titleOfItem(s.items, d.itemId)}`;
  }
  return `${twins.indexOf(item) + 1} of ${twins.length}`;
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
    tags: { jobFamily: 'Branch', platform: 'Retail', grade: 'B' },
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

/** One string per Dependency, so two refs to the same item, Container or Timer compare equal. */
export const dependencyKey = (d: DependencyRef) =>
  d.kind === 'item' ? `item:${d.itemId}` : d.kind === 'container' ? `container:${d.containerId}` : `timer:${d.timerId}`;

export type CanvasAction =
  | { type: 'add'; journeyId: string; x: number; y: number }
  | { type: 'move'; itemId: string; x: number; y: number }
  | { type: 'connect'; sourceId: string; targetId: string }
  | { type: 'toggleMandatory'; itemId: string }
  | { type: 'remove'; itemId: string }
  | { type: 'removeDependency'; itemId: string; dependency: DependencyRef }
  | { type: 'tags'; tags: Tags }
  | { type: 'saveTimer'; timer: TimerDef }
  | { type: 'removeTimer'; timerId: string }
  | { type: 'waitForTimer'; itemId: string; timerId: string }
  | { type: 'saveHardStop'; hardStop: HardStopDef }
  | { type: 'removeHardStop'; hardStopId: string };

/** The next free id with this prefix, for a new Timer or Hard Stop. */
export function nextId(prefix: string, taken: { id: string }[]): string {
  let n = 1;
  while (taken.some((x) => x.id === `${prefix}-${n}`)) n += 1;
  return `${prefix}-${n}`;
}

/** Plain-English refusal for a Timer edit; null when it is fine. Engine rule 4: only the start date counts back. */
export function timerMessage(t: TimerDef): string | null {
  if (!t.label.trim()) return 'Give the Timer a label.';
  if (!Number.isInteger(t.offsetDays)) return 'Use a whole number of days.';
  if (t.offsetDays < 0 && t.anchor.kind !== 'start-date') return 'Only a Timer anchored on the start date can count back before it.';
  if (t.anchor.kind === 'item-done' && !t.anchor.itemId) return 'Choose the Journey the Timer waits for.';
  return null;
}

/** Plain-English refusal to remove a Timer something still waits for; null when it is fine. */
export function timerRemovalMessage(s: PathwaySnapshot, timerId: string): string | null {
  const waiting = s.items.filter((i) => i.dependsOn.some((d) => d.kind === 'timer' && d.timerId === timerId));
  const watched = s.hardStops.some((h) => h.trigger.kind === 'on-deadline' && h.trigger.timerId === timerId);
  if (waiting.length === 0 && !watched) return null;
  const label = s.timers.find((t) => t.id === timerId)?.label ?? timerId;
  if (waiting.length === 0) return `A Hard Stop watches ${label}. Remove the Hard Stop first.`;
  return `${waiting.map((i) => titleOfJourney(i.journeyId)).join(', ')} ${waiting.length === 1 ? 'waits' : 'wait'} for ${label}. Remove that Dependency first.`;
}

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
        id: `i-${journey.id}-${n}`, journeyId: journey.id, journeyVersion: journey.version, mandatory: true, dependsOn: [],
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
    case 'removeDependency':
      return update(a.itemId, (i) => ({ ...i, dependsOn: i.dependsOn.filter((d) => dependencyKey(d) !== dependencyKey(a.dependency)) }));
    case 'tags':
      return { ...s, tags: a.tags };
    case 'saveTimer': {
      if (timerMessage(a.timer)) return s;
      const exists = s.timers.some((t) => t.id === a.timer.id);
      return noCycle(s, { ...s, timers: exists ? s.timers.map((t) => (t.id === a.timer.id ? a.timer : t)) : [...s.timers, a.timer] });
    }
    case 'removeTimer':
      return timerRemovalMessage(s, a.timerId) ? s : { ...s, timers: s.timers.filter((t) => t.id !== a.timerId) };
    case 'waitForTimer':
      if (!s.timers.some((t) => t.id === a.timerId)) return s;
      return noCycle(s, update(a.itemId, (i) =>
        i.dependsOn.some((d) => d.kind === 'timer' && d.timerId === a.timerId)
          ? i
          : { ...i, dependsOn: [...i.dependsOn, { kind: 'timer', timerId: a.timerId }] }));
    case 'saveHardStop': {
      if (!a.hardStop.label.trim()) return s;
      const exists = s.hardStops.some((h) => h.id === a.hardStop.id);
      return { ...s, hardStops: exists ? s.hardStops.map((h) => (h.id === a.hardStop.id ? a.hardStop : h)) : [...s.hardStops, a.hardStop] };
    }
    case 'removeHardStop':
      return { ...s, hardStops: s.hardStops.filter((h) => h.id !== a.hardStopId) };
  }
}

/** Keeps the old snapshot when the new one would loop through a Timer; the UI names the loop first. */
const noCycle = (before: PathwaySnapshot, after: PathwaySnapshot) => (findWaitCycle(after, (id) => titleOfItem(after.items, id)) ? before : after);

/**
 * The first wait cycle through a Container or Timer, as names, or null. An item waits for each Dependency,
 * a Container for each Journey in it, a Timer for its Anchor; the engine refuses any cycle in this graph.
 */
export function findWaitCycle(s: Pick<PathwaySnapshot, 'items' | 'containers' | 'timers'>, titleOf: (itemId: string) => string): string[] | null {
  const waitsFor = new Map<string, string[]>();
  for (const i of s.items) waitsFor.set(`item:${i.id}`, i.dependsOn.map(dependencyKey));
  for (const c of s.containers) waitsFor.set(`container:${c.id}`, c.itemIds.map((x) => `item:${x}`));
  for (const t of s.timers) {
    const a = t.anchor;
    waitsFor.set(`timer:${t.id}`, a.kind === 'item-done' ? [`item:${a.itemId}`] : a.kind === 'container-complete' ? [`container:${a.containerId}`] : []);
  }
  const name = (key: string) => {
    const [kind, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
    if (kind === 'item') return titleOf(id);
    if (kind === 'container') return `Container ${s.containers.find((c) => c.id === id)?.label ?? id}`;
    return `Timer ${s.timers.find((t) => t.id === id)?.label ?? id}`;
  };
  const done = new Set<string>();
  const path: string[] = [];
  const visit = (key: string): string[] | null => {
    const at = path.indexOf(key);
    if (at >= 0) return [...path.slice(at), key].map(name);
    if (done.has(key)) return null;
    path.push(key);
    for (const next of waitsFor.get(key) ?? []) { const c = visit(next); if (c) return c; }
    path.pop();
    done.add(key);
    return null;
  };
  for (const key of waitsFor.keys()) { const c = visit(key); if (c) return c; }
  return null;
}
