import { z } from 'zod';
import { getPerson, setDelegate } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const Id = z.string().min(1).max(100);
const Body = z.object({ personId: Id, delegateId: Id.nullable() });

// Sets or removes a starter's Delegate (feedback item 13). null removes it.
export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError('Choose a person and a Delegate.');
  const { personId, delegateId } = parsed.data;
  if (!getPerson(personId)) throw new ApiError('That person was not found.', 404);
  if (delegateId !== null && !getPerson(delegateId)) throw new ApiError('That Delegate was not found.', 404);
  if (delegateId === personId) throw new ApiError('A person cannot be their own Delegate.');
  setDelegate(personId, delegateId);
  return { personId, delegateId };
});
