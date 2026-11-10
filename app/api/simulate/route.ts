import { z } from 'zod';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { buildEngineInput, getAppliedPathway, getPerson, recordActionProgress } from '@/src/db/queries';
import { computeState } from '@/src/engine';
import { getToday } from '@/src/lib/clock';
import { mockServiceNow } from '@/src/adapters/mockServiceNow';

export const dynamic = 'force-dynamic';

const Body = z.object({
  personId: z.string().min(1).max(100), itemId: z.string().min(1).max(100), actionId: z.string().min(1).max(100),
  result: z.enum(['passed', 'failed', 'returned']),
});

export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError('Choose a person, a Journey and a result.');
  const { personId, itemId, actionId, result } = parsed.data;
  if (!getPerson(personId) || !getAppliedPathway(personId)) throw new ApiError('That person has no Applied Pathway.', 404);
  const item = computeState(buildEngineInput(personId)).items.find((i) => i.itemId === itemId);
  const a = item?.currentAction;
  if (!a || a.id !== actionId || a.type !== 'automation') throw new ApiError('That Journey is not waiting on a Hidden automation.');
  if (result !== 'returned' && !a.setsOutcome) throw new ApiError('This automation does not set an Outcome. Use Simulate returned.');
  if (a.connector === 'servicenow') mockServiceNow.simulate(personId, result); // the mocked ServiceNow records what it reported
  recordActionProgress(personId, { itemId, actionId, state: 'done', doneAt: getToday(), automationResult: result });
  return { engineState: computeState(buildEngineInput(personId)) };
});
