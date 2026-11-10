import { z } from 'zod';
import { getDemoClock, getPerson, recordHardStopDecision } from '@/src/db/queries';
import { apiHandler, ApiError } from '@/src/lib/apiHandler';
import { stateFor } from '../../../team/load';
import { readJson } from '../../../team/json';

export const dynamic = 'force-dynamic';

const Body = z.object({
  personId: z.string().min(1),
  decision: z.enum(['confirm', 'extend', 'dismiss']),
  reason: z.string().trim().min(1, 'A reason is required').max(500),
  extendDays: z.number().int().min(1).max(60).default(7),
});

/** Confirm, Extend or Dismiss a Needs decision (B5). Returns the unfiltered state for HR and the Line Manager. */
export const POST = apiHandler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = Body.safeParse(await readJson(req));
  if (!b.success) throw new ApiError(b.error.issues[0]?.message ?? 'Invalid body');
  const { personId, decision, reason, extendDays } = b.data;
  if (!getPerson(personId)) throw new ApiError('Unknown person', 404);
  const nd = stateFor(personId).needsDecisions.find((n) => n.hardStopId === id);
  if (!nd) throw new ApiError(`Hard Stop ${id} has no Needs decision for ${personId}`, 409);
  if (decision === 'extend' && !nd.extendAllowed) throw new ApiError('This Hard Stop cannot be extended', 409);
  recordHardStopDecision(personId, {
    hardStopId: id, decision, reason, at: getDemoClock(),
    ...(decision === 'extend' && { extendDays }),
  });
  return stateFor(personId);
});
