import { z } from 'zod';
import { addHandover, getDemoClock, getPerson } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const Body = z.object({
  personId: z.string().min(1).max(40),
  question: z.string().trim().min(1).max(300),
});

/** "Talk to a person": stores a handover, which the Line Manager sees as a To-do (G7 lists it). */
export const POST = apiHandler(async (req) => {
  const b = Body.parse(await req.json().catch(() => { throw new ApiError('Body must be valid JSON'); }));
  const person = getPerson(b.personId);
  if (!person) throw new ApiError('Unknown person', 404);
  addHandover(person.id, b.question, getDemoClock());
  const lm = person.lineManagerId ? getPerson(person.lineManagerId) : undefined;
  return { lineManagerName: lm?.name ?? 'Your Line Manager' };
});
