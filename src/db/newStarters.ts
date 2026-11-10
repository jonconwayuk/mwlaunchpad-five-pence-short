import { eq } from 'drizzle-orm';
import { db } from './client';
import { persons } from './schema';
import type { WorkdayNewHire } from '../adapters/mockWorkday';

// The Person id is derived from the Workday id, so the same hire cannot be added twice.
export const personIdForHire = (hireId: string) => `workday-${hireId}`;

export const isHireAdded = (hireId: string): boolean =>
  db.select({ id: persons.id }).from(persons).where(eq(persons.id, personIdForHire(hireId))).get() !== undefined;

/** Stores only the fields the app already keeps for a Person (ADR-0005). Returns false if already added. */
export function addNewStarter(h: WorkdayNewHire, offerAcceptedDate: string): boolean {
  const r = db.insert(persons).values({
    id: personIdForHire(h.id), name: h.name, role: 'starter',
    tags: { jobFamily: h.jobFamily, role: h.role, grade: h.grade, platform: h.platform, location: h.location },
    offerAcceptedDate, startDate: h.startDate, lineManagerId: h.lineManagerId,
  }).onConflictDoNothing().run();
  return r.changes > 0;
}
