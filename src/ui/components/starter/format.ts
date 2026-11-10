import type { ISODate, ItemState, StageId } from '@/src/engine/types';

export const STAGES: StageId[] = ['pre-contract', 'pre-employment', 'onboarding', 'first-30-days'];

/** The starter's friendly Stage labels, Design.MD D8. */
export const STAGE_LABEL: Record<StageId, string> = {
  'pre-contract': 'Your offer',
  'pre-employment': 'Getting ready',
  onboarding: 'Your first week',
  'first-30-days': 'Your first month',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-11-10' -> '10 Nov', without touching the real clock. */
export const shortDate = (d: ISODate): string =>
  `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;

/** Positions (0 to 100) for the Usual Range band: a day axis in whole weeks with room past the top. */
export function bandScale(days: number, [lo, hi]: [number, number]) {
  const max = Math.ceil((Math.max(hi, days) + 7) / 7) * 7;
  const pct = (n: number) => (Math.min(n, max) / max) * 100;
  return { max, lo: pct(lo), hi: pct(hi), today: pct(days), ticks: Array.from({ length: max / 7 + 1 }, (_, i) => pct(i * 7)) };
}

/**
 * D2f.4: the starter never hears of a failure from the app first. A Failed Outcome keeps showing as the
 * wait until its Hard Stop is decided; once Confirm has Cancelled items, the Pathway is stopped.
 * shortcut: after Dismiss a Failed item still shows as a wait; upgrade when the engine reports decided Hard Stops.
 */
export function starterView(items: ItemState[]): { stopped: boolean; items: ItemState[] } {
  const failed = items.some((i) => i.outcome === 'failed');
  return {
    stopped: failed && items.some((i) => i.status === 'cancelled'),
    items: items.map((i) => (i.outcome === 'failed' ? { ...i, status: 'in-progress', outcome: undefined, doneAt: undefined } : i)),
  };
}
