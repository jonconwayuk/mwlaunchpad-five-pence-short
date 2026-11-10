import Link from 'next/link';
import { listJourneys } from '@/src/db/queries';
import { Library } from '@/src/ui/components/journey-builder/JourneyLibrary';
import { stageLabel } from '@/src/ui/components/journey-builder/constants';

export const dynamic = 'force-dynamic';

export default function Page() {
  // "Applied N times" and skip rate need a new query; shown as a dash until one exists.
  const rows = listJourneys().map((j) => ({
    id: j.id, title: j.title, href: `/portal/journeys/${j.id}`, tags: j.tags,
    cells: [j.ownerTeam, stageLabel(j.stage), `v${j.version}`, '—', '—'],
  }));
  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[26px]">Journey library</h1>
        <Link href="/portal/journeys/new" className="rounded-sm bg-racing px-3 py-1.5 text-[13px] text-paper">New journey</Link>
      </div>
      <Library rows={rows} searchable columns={['Owner team', 'Stage', 'Version', 'Applied', 'Skip rate']} />
    </main>
  );
}
