import { notFound } from 'next/navigation';
import { getJourney } from '@/src/db/queries';
import { JourneyBuilder } from '@/src/ui/components/journey-builder/JourneyBuilder';
import { JOURNEY_ID, currentBranch, readJourneyFile } from '@/app/api/journeys/files';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') return <JourneyBuilder branch={currentBranch()} />;
  const journey = getJourney(id);
  if (!journey) notFound();
  // Seeded ids are all Journey slugs; an older non-slug id simply has no file to show.
  const code = JOURNEY_ID.test(id) ? readJourneyFile(id) : undefined;
  return <JourneyBuilder initial={journey} code={code} branch={currentBranch()} />;
}
