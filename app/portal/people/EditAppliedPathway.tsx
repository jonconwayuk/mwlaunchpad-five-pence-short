import { getAppliedBasis, getAppliedPathway, listJourneys, listPersons } from '@/src/db/queries';
import { shortDate } from '@/src/ui/components/starter/format';
import { EditAppliedPathwayClient } from './EditAppliedPathwayClient';

/** "Edit this pathway" (feedback item 23): HR adds Journeys to one Applied Pathway through Additions. */
export function EditAppliedPathway({ personId }: { personId: string }) {
  const applied = getAppliedPathway(personId);
  const basis = getAppliedBasis(personId);
  if (!applied || !basis) return null;
  const onPathway = new Set(applied.snapshot.items.map((i) => i.journeyId));
  const titleOf = new Map(listJourneys().map((j) => [j.id, j.title]));
  return (
    <div data-slot="edit-applied-pathway" data-person={personId} className="mb-4">
      <p className="text-[15px]">{basis.text}</p>
      {basis.changes.length > 0 && (
        <ul className="mt-1 text-[13px] text-muted" aria-label="Change record">
          {basis.changes.map((c) => (
            <li key={c.itemId}>Added {titleOf.get(c.journeyId) ?? c.journeyId}, by {c.by}{c.on ? `, on ${shortDate(c.on)}` : ''}</li>
          ))}
        </ul>
      )}
      <EditAppliedPathwayClient
        personId={personId}
        hrId={listPersons().find((p) => p.role === 'hr')?.id ?? ''}
        items={applied.snapshot.items.map((i) => ({ id: i.id, title: titleOf.get(i.journeyId) ?? i.journeyId, addedBy: i.addedBy?.personId }))}
        library={listJourneys().filter((j) => !onPathway.has(j.id)).map((j) => ({ id: j.id, title: j.title, tags: j.tags }))}
      />
    </div>
  );
}
