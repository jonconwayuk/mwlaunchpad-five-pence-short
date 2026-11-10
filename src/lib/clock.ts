// The Demo clock. Never reads the real date (decision B9, DEMO_T).
// NEEDS: wave C2 persists this via src/db/queries.ts getDemoClock/setDemoClock
import type { ISODate } from '@/src/engine/types';

const DEMO_T: ISODate = '2026-11-10';
// Held on globalThis so Next dev hot reload does not reset it.
const g = globalThis as typeof globalThis & { __demoToday?: ISODate };

export const getToday = (): ISODate => g.__demoToday ?? DEMO_T;
export const setToday = (d: ISODate): void => {
  g.__demoToday = d;
};
