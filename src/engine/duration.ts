import type { DurationSample, ISODate, PersonStatus, StageId } from './types';
import { diffDays } from './dates';

/** Linear-interpolated quantile of sorted values. */
function quantile(sorted: number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  const hi = Math.ceil(at);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (at - lo);
}

/** Rule 7: the Usual Range is the interquartile range of this Journey version's history. */
export function usualRange(history: DurationSample[], journeyId: string, version: number): [number, number] | undefined {
  const days = history
    .filter((h) => h.journeyId === journeyId && h.journeyVersion === version)
    .map((h) => h.days)
    .sort((a, b) => a - b);
  if (!days.length) return undefined;
  return [Math.round(quantile(days, 0.25)), Math.round(quantile(days, 0.75))];
}

/** Rule 8: the Start date is Day 1, so the day before it is Day 0. */
export function dayNumberOf(today: ISODate, startDate: ISODate): number {
  return diffDays(startDate, today) + 1;
}

export function personStatusOf(dayNumber: number): PersonStatus {
  if (dayNumber < 1) return 'joiner';
  return dayNumber < 30 ? 'starter' : 'onboarded';
}

/** Rule 9: Design.MD D8 table, once Contracting is done. */
export function stageOf(dayNumber: number, contractingDone: boolean): StageId {
  if (!contractingDone) return 'pre-contract';
  if (dayNumber < 1) return 'pre-employment';
  return dayNumber <= 7 ? 'onboarding' : 'first-30-days';
}
