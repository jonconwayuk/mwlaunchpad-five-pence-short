import Link from 'next/link';
import { getJourneySemver, listJourneys } from '@/src/db/queries';
import { JourneyCatalogue } from '@/src/ui/components/journey-builder/JourneyCatalogue';

export const dynamic = 'force-dynamic';

export default function Page() {
  const cards = listJourneys()
    .map((j) => ({ ...j, semver: getJourneySemver(j.id) ?? `${j.version}.0.0` }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return (
    <main className="p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px]">Journey library</h1>
        <span className="flex items-center gap-3">
          <span className="text-[13px] text-muted">Admin only — for engineers</span>
          <Link href="/portal/journeys/new" className="rounded-sm bg-racing px-3 py-1.5 text-[13px] text-paper">New journey</Link>
        </span>
      </div>
      <p className="mb-5 max-w-2xl text-[15px] text-charcoal">Every Journey a Pathway can use: what it is, what it does and who owns it. Open one to see its Actions.</p>
      <JourneyCatalogue cards={cards} />
    </main>
  );
}
