// The Demo clock. The only runtime place `new Date()` is allowed (with src/db/seed.ts).
import type { ISODate } from '@/src/engine/types';

let simulated: ISODate | undefined;

export const getToday = (): ISODate => simulated ?? new Date().toISOString().slice(0, 10);
export const setToday = (d: ISODate): void => {
  simulated = d;
};
