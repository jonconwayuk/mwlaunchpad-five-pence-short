import { z } from 'zod';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { addDays, getToday, setToday } from '@/src/lib/clock';

export const dynamic = 'force-dynamic';

const Body = z.object({
  set: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date as YYYY-MM-DD.').optional(),
  advanceDays: z.number().int().positive().optional(),
}).refine((b) => (b.set === undefined) !== (b.advanceDays === undefined), 'Give either a date or a number of days.');

export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError(parsed.error.issues[0].message);
  const today = getToday();
  const next = parsed.data.set ?? addDays(today, parsed.data.advanceDays!);
  if (next < today) throw new ApiError('The Demo clock only moves forward. Use Reset demo to start again.');
  setToday(next);
  return { simulatedDate: next };
});
