import { z } from 'zod';
import { addHandover, getDemoClock, getPerson } from '@/src/db/queries';
import { loadAgents } from '@/src/agents';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const Body = z.object({
  personId: z.string().min(1).max(40),
  question: z.string().trim().min(1).max(300),
  agentName: z.string().max(80).optional(),
});

/** "Talk to a person": stores a handover, which the Line Manager sees as a To-do (G7 lists it). */
export const POST = apiHandler(async (req) => {
  const b = Body.parse(await req.json().catch(() => { throw new ApiError('Body must be valid JSON'); }));
  const person = getPerson(b.personId);
  if (!person) throw new ApiError('Unknown person', 404);
  const handers = loadAgents().filter((a) => a.handsOverTo === 'line-manager');
  const agentName = handers.find((a) => a.name === b.agentName)?.name ?? handers[0]?.name ?? 'Handover agent';
  const summary = b.question.length > 100 ? `${b.question.slice(0, 97)}...` : b.question;
  addHandover(person.id, b.question, getDemoClock(), agentName, summary);
  const lm = person.lineManagerId ? getPerson(person.lineManagerId) : undefined;
  return { lineManagerName: lm?.name ?? 'Your Line Manager', agentName, summary };
});
