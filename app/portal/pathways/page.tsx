import { listPathways } from '@/src/db/queries';
import { Library } from '@/src/ui/components/journey-builder/JourneyLibrary';

export const dynamic = 'force-dynamic';

export default function Page() {
  const rows = listPathways().map((p) => ({
    id: p.id, title: p.title, href: `/portal/pathways/${p.id}`, tags: p.tags,
    cells: [p.liveVersion ? `v${p.liveVersion}` : 'Draft', `Applied ${p.appliedCount} ${p.appliedCount === 1 ? 'time' : 'times'}`],
  }));
  return (
    <main className="p-6">
      <h1 className="mb-4 text-[26px]">Pathway library</h1>
      <Library rows={rows} searchable columns={['Live version', 'Applied']} />
    </main>
  );
}
