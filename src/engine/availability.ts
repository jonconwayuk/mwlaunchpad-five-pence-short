import type {
  ActionDef, DependencyRef, EngineInput, ISODate, JourneyDef, JourneyStatus, OutcomeValue, PathwayItem, TimerDef,
} from './types';
import { addDays, latest } from './dates';
import { cancelledItemIds, extensionDays } from './hardStops';
import { ownerOf, walkActions, type ActionWalk } from './status';

export interface EvaluatedItem {
  item: PathwayItem; journey: JourneyDef; title: string;
  status: JourneyStatus; available: boolean; availableSince?: ISODate;
  doneAt?: ISODate; outcome?: OutcomeValue; currentAction?: ActionDef; currentSince?: ISODate;
  unmetDependencies: DependencyRef[]; sent: ActionWalk['sent'];
}

export interface Evaluator {
  item(itemId: string): EvaluatedItem;
  containerCompletedOn(containerId: string): ISODate | undefined;
  timerFiresOn(timerId: string): ISODate | undefined;
  anchoredFiresOn(timer: TimerDef): ISODate | undefined;
}

/** Memoised evaluation of items, Containers and Timers, which depend on each other. */
export function createEvaluator(input: EngineInput): Evaluator {
  const { pathway, person, today } = input;
  const cancelled = cancelledItemIds(input);
  const items = new Map<string, EvaluatedItem>();
  const visiting = new Set<string>();

  const isMet = (s: EvaluatedItem): boolean => s.status === 'done' || s.status === 'skipped';

  const metOn = (dep: DependencyRef): ISODate | undefined => {
    if (dep.kind === 'item') {
      const s = ev.item(dep.itemId);
      return isMet(s) ? s.doneAt : undefined;
    }
    if (dep.kind === 'container') return ev.containerCompletedOn(dep.containerId);
    const firesOn = ev.timerFiresOn(dep.timerId);
    return firesOn && firesOn <= today ? firesOn : undefined;
  };

  const evaluate = (id: string): EvaluatedItem => {
    const item = pathway.items.find((i) => i.id === id);
    if (!item) throw new Error(`Unknown Pathway Item ${id}`);
    const journey = input.journeys[`${item.journeyId}@${item.journeyVersion}`];
    if (!journey) throw new Error(`Unknown Journey ${item.journeyId}@${item.journeyVersion}`);
    const met = item.dependsOn.map((dep) => ({ dep, on: metOn(dep) }));
    const unmetDependencies = met.filter((m) => !m.on).map((m) => m.dep);
    const available = unmetDependencies.length === 0;
    // shortcut: an item with no Dependencies counts as available from Offer accepted; use the apply date once stored.
    const availableSince = available
      ? latest([person.offerAcceptedDate, ...met.map((m) => m.on as ISODate)])
      : undefined;
    const base = { item, journey, title: journey.title, available, availableSince, unmetDependencies, sent: [] };

    const override = input.overrides.filter((o) => o.itemId === id).at(-1);
    if (override) {
      return { ...base, status: override.status, doneAt: override.at, outcome: override.status };
    }
    const walk = available ? walkActions(id, journey, input) : undefined;
    if (walk?.done) {
      return { ...base, status: 'done', doneAt: walk.doneAt ?? availableSince, outcome: walk.outcome, sent: walk.sent };
    }
    if (cancelled.has(id)) return { ...base, status: 'cancelled', outcome: 'cancelled' };
    if (!walk) return { ...base, status: 'not-started' };
    const status = walk.currentAction && ownerOf(walk.currentAction) === 'starter' ? 'action-required' : 'in-progress';
    return { ...base, status, currentAction: walk.currentAction, currentSince: walk.currentSince, sent: walk.sent };
  };

  const ev: Evaluator = {
    item(id) {
      const known = items.get(id);
      if (known) return known;
      if (visiting.has(id)) throw new Error(`Dependency loop through ${id}`);
      visiting.add(id);
      const s = evaluate(id);
      visiting.delete(id);
      items.set(id, s);
      return s;
    },
    // Rule 3: complete when every mandatory item inside is done; optional items never hold it up.
    containerCompletedOn(containerId) {
      const c = pathway.containers.find((x) => x.id === containerId);
      if (!c) throw new Error(`Unknown Container ${containerId}`);
      const mandatory = c.itemIds.map((i) => ev.item(i)).filter((s) => s.item.mandatory);
      if (!mandatory.every((s) => s.status === 'done')) return undefined;
      return latest(mandatory.map((s) => s.doneAt as ISODate)) ?? person.offerAcceptedDate;
    },
    timerFiresOn(timerId) {
      const t = pathway.timers.find((x) => x.id === timerId);
      if (!t) throw new Error(`Unknown Timer ${timerId}`);
      return ev.anchoredFiresOn(t);
    },
    // Rule 4: Anchor date plus offset, plus any Extend on a deadline. Moving the Anchor moves the Timer.
    anchoredFiresOn(timer) {
      const { anchor } = timer;
      let anchorDate: ISODate | undefined;
      if (anchor.kind === 'offer-accepted') anchorDate = person.offerAcceptedDate;
      else if (anchor.kind === 'start-date') anchorDate = person.startDate;
      else if (anchor.kind === 'item-done') {
        if (!anchor.itemId) throw new Error(`Timer ${timer.id} has no Anchor item`);
        const s = ev.item(anchor.itemId);
        anchorDate = isMet(s) ? s.doneAt : undefined;
      } else {
        if (!anchor.containerId) throw new Error(`Timer ${timer.id} has no Anchor Container`);
        anchorDate = ev.containerCompletedOn(anchor.containerId);
      }
      return anchorDate && addDays(anchorDate, timer.offsetDays + extensionDays(timer.id, input));
    },
  };
  return ev;
}

/** The date a Timer fires on, or undefined while its Anchor has no date yet. */
export function resolveTimerDate(timer: TimerDef, input: EngineInput): ISODate | undefined {
  return createEvaluator(input).anchoredFiresOn(timer);
}
