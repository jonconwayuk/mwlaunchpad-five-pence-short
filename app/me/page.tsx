import { getPerson } from '@/src/db/queries';
import { PERSONAS, getPersona } from '@/src/lib/persona';
import { StarterPreview } from '@/src/ui/components/starter/StarterPreview';

export const dynamic = 'force-dynamic';

// /me for the starter (persona cookie), or /me?as=delegate&personId=... for their Delegate (D12a.4).
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const asDelegate = sp.as === 'delegate';
  const persona = await getPersona();
  const personId = (typeof sp.personId === 'string' && sp.personId.slice(0, 40)) || PERSONAS.find((p) => p.id === persona)!.personId;
  const person = getPerson(personId);
  const query = `?as=${asDelegate ? 'delegate' : 'starter'}&personId=${encodeURIComponent(personId)}`;
  return (
    <StarterPreview
      query={query}
      personId={personId}
      firstName={person?.name.split(' ')[0] ?? 'there'}
      actorPersonId={asDelegate ? person?.delegateId ?? personId : personId}
    />
  );
}
