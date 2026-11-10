import { z } from 'zod';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { applyPathway, getPerson, listPathways } from '@/src/db/queries';
import { getToday } from '@/src/lib/clock';

export const dynamic = 'force-dynamic';

const Body = z.object({ pathwayId: z.string().min(1), personId: z.string().min(1) });

export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError('Choose a Pathway and a person.');
  const { pathwayId, personId } = parsed.data;
  if (!getPerson(personId)) throw new ApiError('That person was not found.', 404);
  const p = listPathways().find((x) => x.id === pathwayId);
  if (!p) throw new ApiError('That Pathway was not found.', 404);
  if (p.liveVersion == null) throw new ApiError('Publish this Pathway before applying it.');
  return { appliedPathwayId: applyPathway(pathwayId, personId, getToday()) };
});
