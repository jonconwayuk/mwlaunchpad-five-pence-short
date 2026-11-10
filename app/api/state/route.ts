import { demoState } from '@/src/engine/fixtures';
import { PERSONAS, getPersona } from '@/src/lib/persona';

export const dynamic = 'force-dynamic';

// Wave C1 replaces the internals; the response shape must not change.
export async function GET() {
  const id = await getPersona();
  const person = PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
  return Response.json({
    ok: true,
    data: { engineState: demoState, person, simulatedDate: '2026-11-10', personas: PERSONAS },
  });
}
