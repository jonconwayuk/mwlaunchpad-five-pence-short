import { z } from 'zod';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { mockWorkday } from '@/src/adapters/mockWorkday';
import { addNewStarter, isHireAdded, personIdForHire } from '@/src/db/newStarters';
import { getToday } from '@/src/lib/clock';

export const dynamic = 'force-dynamic';

const Body = z.object({ hireId: z.string().min(1).max(100) });

export const GET = apiHandler(async () =>
  (await mockWorkday.listNewHires()).map((h) => ({ ...h, added: isHireAdded(h.id) })));

export const POST = apiHandler(async (req: Request) => {
  const { hireId } = Body.parse(await req.json().catch(() => null));
  const hire = (await mockWorkday.listNewHires()).find((h) => h.id === hireId);
  if (!hire) throw new ApiError('That new starter was not found in Workday.', 404);
  if (!addNewStarter(hire, getToday())) throw new ApiError(`${hire.name} has already been added.`, 409);
  return { personId: personIdForHire(hire.id) };
});
