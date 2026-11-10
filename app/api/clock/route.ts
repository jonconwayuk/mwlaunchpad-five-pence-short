import { z } from 'zod';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { addDays, getToday, setToday } from '@/src/lib/clock';

export const dynamic = 'force-dynamic';

// A real calendar date round-trips unchanged; 2026-02-30 would roll over to 2026-03-02.
const isRealDate = (s: string) => {
  try { return addDays(s, 0) === s; } catch { return false; }
};

const MAX_DATE = '2100-12-31';
const STOPS = 'The Demo clock stops at 31 Dec 2100.';

const Body = z.object({
  set: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date as YYYY-MM-DD.').refine(isRealDate, 'Enter a real date as YYYY-MM-DD.').refine((d) => d <= MAX_DATE, STOPS).optional(),
  advanceDays: z.number().int('Enter a whole number of days.').positive('Enter at least 1 day.').max(3650, 'Enter 3650 days or fewer.').optional(),
}).refine((b) => (b.set === undefined) !== (b.advanceDays === undefined), 'Give either a date or a number of days.');

export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
  const today = getToday();
  // Checked on the string before any date maths so an out-of-range value cannot make addDays throw.
  const next = parsed.data.set ?? addDays(today, parsed.data.advanceDays!);
  if (next > MAX_DATE) throw new ApiError(STOPS);
  if (next < today) throw new ApiError('The Demo clock only moves forward. Use Reset demo to start again.');
  setToday(next);
  return { simulatedDate: next };
});
