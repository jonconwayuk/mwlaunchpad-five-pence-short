import { getPathwayDraft, getPathwaySemver, listJourneys } from '@/src/db/queries';
import { PathwayCanvas } from '@/src/ui/components/canvas/PathwayCanvas';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = getPathwayDraft(id);
  if (!draft) return <main className="p-8 text-ink">That Pathway was not found.</main>;
  const library = listJourneys().map((j) => ({ id: j.id, version: j.version, title: j.title, stage: j.stage, tags: j.tags }));
  return <PathwayCanvas draft={draft} library={library} liveSemver={getPathwaySemver(id) ?? null} />;
}
