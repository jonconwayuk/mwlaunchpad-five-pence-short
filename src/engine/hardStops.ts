import type { EngineInput, HardStopDef, NeedsDecision } from './types';
import type { Evaluator } from './availability';

const DEFAULT_EXTEND_DAYS = 7;

export function targetsOf(hs: HardStopDef, input: EngineInput): string[] {
  const { items, containers } = input.pathway;
  if (hs.stops.wholePathway) return items.map((i) => i.id);
  const inContainers = containers
    .filter((c) => hs.stops.containerIds.includes(c.id))
    .flatMap((c) => c.itemIds);
  return [...new Set([...hs.stops.itemIds, ...inContainers])];
}

const decisionsFor = (id: string, input: EngineInput) =>
  input.hardStopDecisions.filter((d) => d.hardStopId === id);

/** Rule 5: only a Confirm decision cancels anything. */
export function cancelledItemIds(input: EngineInput): Set<string> {
  const confirmed = input.pathway.hardStops.filter((hs) =>
    decisionsFor(hs.id, input).some((d) => d.decision === 'confirm'),
  );
  return new Set(confirmed.flatMap((hs) => targetsOf(hs, input)));
}

/** Days added to a deadline Timer by Extend decisions. */
export function extensionDays(timerId: string, input: EngineInput): number {
  return input.pathway.hardStops
    .filter((hs) => hs.trigger.kind === 'on-deadline' && hs.trigger.timerId === timerId)
    .flatMap((hs) => decisionsFor(hs.id, input))
    .filter((d) => d.decision === 'extend')
    .reduce((sum, d) => sum + (d.extendDays ?? DEFAULT_EXTEND_DAYS), 0);
}

/** Rule 5: a Hard Stop raises a Needs decision and never acts alone. */
export function needsDecisions(input: EngineInput, ev: Evaluator): NeedsDecision[] {
  const raised: NeedsDecision[] = [];
  for (const hs of input.pathway.hardStops) {
    if (decisionsFor(hs.id, input).some((d) => d.decision !== 'extend')) continue;
    const base = { hardStopId: hs.id, label: hs.label, stopsItemIds: targetsOf(hs, input), wholePathway: hs.stops.wholePathway };
    const t = hs.trigger;
    if (t.kind === 'on-failed') {
      const s = ev.item(t.itemId);
      if (s.outcome === 'failed' && s.doneAt) {
        raised.push({ ...base, reason: `${s.title} failed`, raisedOn: s.doneAt, extendAllowed: false });
      }
    } else {
      const firesOn = ev.timerFiresOn(t.timerId);
      const watched = ev.item(t.watchesItemId);
      const timer = input.pathway.timers.find((x) => x.id === t.timerId);
      if (firesOn && firesOn <= input.today && watched.status !== 'done' && watched.status !== 'skipped') {
        raised.push({ ...base, reason: `${watched.title} is not done by ${timer?.label ?? 'its deadline'}`, raisedOn: firesOn, extendAllowed: true });
      }
    }
  }
  return raised;
}
