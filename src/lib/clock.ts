// The Demo clock, persisted in the database (decision B9). Never reads the real date.
import { getDemoClock, setDemoClock } from '@/src/db/queries';
import type { ISODate } from '@/src/engine/types';

export const getToday = (): ISODate => getDemoClock();
export const setToday = (d: ISODate): void => setDemoClock(d);

export function addDays(d: ISODate, n: number): ISODate {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
