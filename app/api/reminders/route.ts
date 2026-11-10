import { z } from 'zod';
import { addManualReminder, getDemoClock, getPerson, listManualReminders } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const Id = z.string().min(1).max(100);
const Body = z.object({ personId: Id, message: z.string().trim().min(1).max(200), byPersonId: Id.optional() });

function known(id: string) {
  if (!getPerson(id)) throw new ApiError('That person was not found.', 404);
}

// "Send a Reminder now" (decision 35): the Reminder reaches the starter and their Delegate on the next poll of /api/state.
export const POST = apiHandler(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new ApiError('Write a Reminder of up to 200 characters.');
  const { personId, message, byPersonId } = parsed.data;
  known(personId);
  // NEEDS: a `byPersonId` column on manual_reminders (src/db) to record who sent it; it is checked but not stored yet.
  if (byPersonId) known(byPersonId);
  addManualReminder(personId, message, getDemoClock());
  return { reminders: listManualReminders(personId) };
});

export const GET = apiHandler(async (req: Request) => {
  const personId = Id.parse(new URL(req.url).searchParams.get('personId') ?? undefined);
  known(personId);
  return { reminders: listManualReminders(personId) };
});
