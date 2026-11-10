import { z } from 'zod';
import { computeState } from '@/src/engine';
import { buildEngineInput, getAppliedPathway, getDemoClock, getPerson, listManualReminders } from '@/src/db/queries';
import { withManualReminders } from '@/app/api/reminders/merge';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { PERSONAS, getPersona } from '@/src/lib/persona';
import { filterForViewer } from '@/src/lib/roleFilter';

export const dynamic = 'force-dynamic';

const Query = z.object({
  personId: z.string().min(1).max(40).optional(),
  as: z.enum(['starter', 'delegate', 'line-manager', 'buddy', 'hr']).default('starter'),
});

export const GET = apiHandler(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = Query.parse({ personId: sp.get('personId') ?? undefined, as: sp.get('as') ?? undefined });
  const personId = q.personId ?? (await cookiePersonId());
  const row = getPerson(personId);
  if (!row || !getAppliedPathway(personId)) throw new ApiError('No Applied Pathway for that person', 404);
  const engineState = filterForViewer(withManualReminders(computeState(buildEngineInput(personId)), listManualReminders(personId)), q.as, { actingFor: row.name });
  return {
    engineState,
    person: { id: row.id, name: row.name },
    simulatedDate: getDemoClock(),
    personas: PERSONAS.map((p) => ({ id: p.personId, name: p.name })),
  };
});

async function cookiePersonId() {
  const id = await getPersona();
  return PERSONAS.find((p) => p.id === id)!.personId;
}
