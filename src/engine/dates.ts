import type { ISODate } from './types';

const DAY_MS = 86_400_000;

/** Whole days since the epoch for a 'YYYY-MM-DD' string, in UTC so time zones never shift it. */
function toDays(date: ISODate): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function addDays(date: ISODate, days: number): ISODate {
  return new Date((toDays(date) + days) * DAY_MS).toISOString().slice(0, 10);
}

/** `to` minus `from`, in days. */
export function diffDays(from: ISODate, to: ISODate): number {
  return toDays(to) - toDays(from);
}

/** ISO dates sort as strings, so the latest is the string maximum. */
export function latest(dates: ISODate[]): ISODate | undefined {
  return dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : undefined;
}
