import { z } from 'zod';
import { demoState } from '@/src/engine/fixtures';
import { PERSONAS, getPersona } from '@/src/lib/persona';
import { getToday } from '@/src/lib/clock';

export const dynamic = 'force-dynamic';

const Query = z.object({ personId: z.enum(['person-a', 'person-b', 'person-c']).optional() });

// Wave C1 replaces the internals and implements `?as=`; the response shape must not change.
export async function GET(req: Request) {
  const parsed = Query.safeParse({
    personId: new URL(req.url).searchParams.get('personId') ?? undefined,
  });
  if (!parsed.success) return Response.json({ ok: false, error: 'Invalid personId' }, { status: 400 });
  const cookieId = await getPersona();
  const found = PERSONAS.find((p) => p.personId === parsed.data.personId) ?? PERSONAS.find((p) => p.id === cookieId);
  const { personId, name } = found ?? PERSONAS[0];
  const personas = PERSONAS.map((p) => ({ id: p.personId, name: p.name }));
  return Response.json({
    ok: true,
    data: { engineState: demoState, person: { id: personId, name }, simulatedDate: getToday(), personas },
  });
}
