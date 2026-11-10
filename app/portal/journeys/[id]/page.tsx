import { notFound } from 'next/navigation';
import { getJourney } from '@/src/db/queries';
import { JourneyBuilder } from '@/src/ui/components/journey-builder/JourneyBuilder';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') return <JourneyBuilder />;
  const journey = getJourney(id);
  if (!journey) notFound();
  return <JourneyBuilder initial={journey} />;
}
