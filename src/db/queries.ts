import { and, desc, eq } from 'drizzle-orm';
import { db } from './client';
import * as s from './schema';
import type {
  ActionProgress, EngineInput, HardStopDecision, ISODate, ItemOverride, JourneyDef, PathwayItem, PathwaySnapshot,
  PersonRef, Tags,
} from '../engine/types';

export const getDemoClock = (): ISODate => db.select().from(s.demoClock).get()!.today;
export const setDemoClock = (d: ISODate): void => {
  db.update(s.demoClock).set({ today: d }).where(eq(s.demoClock.id, 1)).run();
};

// ---- People --------------------------------------------------------------------------------
export const listPersons = () => db.select().from(s.persons).all();
export const getPerson = (id: string) => db.select().from(s.persons).where(eq(s.persons.id, id)).get();

// ---- Journeys ------------------------------------------------------------------------------
type JourneyRow = typeof s.journeys.$inferSelect;
const toJourney = (r: JourneyRow, acts: (typeof s.actions.$inferSelect)[]): JourneyDef => ({
  id: r.id, version: r.version, title: r.title, description: r.description, ownerTeam: r.ownerTeam,
  stage: r.stage as JourneyDef['stage'], tags: r.tags, declaresOutcome: r.declaresOutcome,
  ...(r.whileYouWait && { whileYouWait: r.whileYouWait }),
  actions: acts.filter((a) => a.journeyId === r.id && a.journeyVersion === r.version)
    .sort((a, b) => a.position - b.position).map((a) => a.def),
});

export function listJourneys(): JourneyDef[] {
  const acts = db.select().from(s.actions).all();
  const latest = new Map<string, JourneyRow>();
  for (const r of db.select().from(s.journeys).all()) {
    if ((latest.get(r.id)?.version ?? 0) < r.version) latest.set(r.id, r);
  }
  return [...latest.values()].map((r) => toJourney(r, acts));
}

export function getJourney(id: string, version?: number): JourneyDef | undefined {
  const r = db.select().from(s.journeys)
    .where(version === undefined ? eq(s.journeys.id, id) : and(eq(s.journeys.id, id), eq(s.journeys.version, version)))
    .orderBy(desc(s.journeys.version)).get();
  if (!r) return undefined;
  return toJourney(r, db.select().from(s.actions).where(and(eq(s.actions.journeyId, id), eq(s.actions.journeyVersion, r.version))).all());
}

export function insertJourney(def: JourneyDef): void {
  db.insert(s.journeys).values({ ...def, whileYouWait: def.whileYouWait ?? null }).run();
  def.actions.forEach((a, position) =>
    db.insert(s.actions).values({ journeyId: def.id, journeyVersion: def.version, position, def: a }).run());
}

export function publishJourney(def: Omit<JourneyDef, 'version'>): JourneyDef {
  return db.transaction(() => {
    const version = (getJourney(def.id)?.version ?? 0) + 1;
    const published = { ...def, version };
    insertJourney(published);
    return published;
  });
}

// ---- Pathways ------------------------------------------------------------------------------
export function listPathways() {
  const applied = db.select().from(s.appliedPathways).all();
  return db.select().from(s.pathways).all().map((p) => ({
    ...p, appliedCount: applied.filter((a) => a.snapshot.pathwayId === p.id).length,
  }));
}

const draftRows = <T>(table: typeof s.pathwayItems | typeof s.containers | typeof s.timers | typeof s.hardStops, id: string) =>
  db.select().from(table).where(eq(table.pathwayId, id)).orderBy(table.position).all().map((r) => r.def as T);

export function getPathwayDraft(id: string): PathwaySnapshot | undefined {
  const p = db.select().from(s.pathways).where(eq(s.pathways.id, id)).get();
  if (!p) return undefined;
  return {
    id: `${id}@draft`, pathwayId: id, version: p.draftVersion, title: p.title, tags: p.tags,
    items: draftRows(s.pathwayItems, id), containers: draftRows(s.containers, id),
    timers: draftRows(s.timers, id), hardStops: draftRows(s.hardStops, id),
  };
}

export function savePathwayDraft(id: string, snap: Omit<PathwaySnapshot, 'id' | 'pathwayId' | 'version'> & Partial<PathwaySnapshot>): void {
  db.transaction(() => {
    const rows = <T extends { id: string }>(table: typeof s.pathwayItems, defs: T[]) => {
      db.delete(table).where(eq(table.pathwayId, id)).run();
      defs.forEach((def, position) => db.insert(table).values({ pathwayId: id, id: def.id, position, def: def as never }).run());
    };
    rows(s.pathwayItems, snap.items);
    rows(s.containers as never, snap.containers);
    rows(s.timers as never, snap.timers);
    rows(s.hardStops as never, snap.hardStops);
    db.update(s.pathways).set({ title: snap.title, tags: snap.tags as Tags }).where(eq(s.pathways.id, id)).run();
  });
}

export function publishPathway(id: string): number {
  return db.transaction(() => {
    const draft = getPathwayDraft(id);
    if (!draft) throw new Error(`Unknown Pathway ${id}`);
    const version = draft.version;
    db.insert(s.pathwayVersions).values({ pathwayId: id, version, snapshot: { ...draft, id: `${id}@${version}` } }).run();
    db.update(s.pathways).set({ liveVersion: version, draftVersion: version + 1 }).where(eq(s.pathways.id, id)).run();
    return version;
  });
}

// ---- Applied Pathways (ADR-0002: a snapshot of the live version) ---------------------------
export function applyPathway(pathwayId: string, personId: string, today: ISODate): string {
  return db.transaction(() => {
    const p = db.select().from(s.pathways).where(eq(s.pathways.id, pathwayId)).get();
    if (p?.liveVersion == null) throw new Error(`Pathway ${pathwayId} has no published version`);
    if (!getPerson(personId)) throw new Error(`Unknown person ${personId}`);
    const snapshot = db.select().from(s.pathwayVersions)
      .where(and(eq(s.pathwayVersions.pathwayId, pathwayId), eq(s.pathwayVersions.version, p.liveVersion))).get()!.snapshot;
    const id = `applied-${personId}`;
    // Re-applying starts the story again.
    for (const t of [s.appliedPathways, s.actionProgress, s.itemOverrides, s.hardStopDecisions]) {
      db.delete(t).where(eq(t.personId, personId)).run();
    }
    db.insert(s.appliedPathways).values({ id, personId, snapshot, appliedOn: today }).run();
    return id;
  });
}

export const getAppliedPathway = (personId: string) =>
  db.select().from(s.appliedPathways).where(eq(s.appliedPathways.personId, personId)).get();

export function addPathwayItemToApplied(personId: string, item: PathwayItem): void {
  const a = getAppliedPathway(personId);
  if (!a) throw new Error(`No Applied Pathway for ${personId}`);
  const snapshot = { ...a.snapshot, items: [...a.snapshot.items, item] };
  db.update(s.appliedPathways).set({ snapshot }).where(eq(s.appliedPathways.personId, personId)).run();
}

// ---- Progress ------------------------------------------------------------------------------
// personId is the starter the Applied Pathway belongs to (the records themselves do not carry it).
export function recordActionProgress(personId: string, p: ActionProgress): void {
  db.insert(s.actionProgress).values({ personId, itemId: p.itemId, actionId: p.actionId, data: p })
    .onConflictDoUpdate({ target: [s.actionProgress.personId, s.actionProgress.itemId, s.actionProgress.actionId], set: { data: p } }).run();
}
export function recordOverride(personId: string, o: ItemOverride): void {
  db.insert(s.itemOverrides).values({ personId, itemId: o.itemId, data: o })
    .onConflictDoUpdate({ target: [s.itemOverrides.personId, s.itemOverrides.itemId], set: { data: o } }).run();
}
export function recordHardStopDecision(personId: string, d: HardStopDecision): void {
  db.insert(s.hardStopDecisions).values({ personId, data: d }).run();
}
export function addNote(personId: string, authorId: string, body: string, at: ISODate): void {
  db.insert(s.notes).values({ personId, authorId, body, at }).run();
}

// ---- Engine input ----------------------------------------------------------------------------
export function buildEngineInput(personId: string): EngineInput {
  const p = getPerson(personId);
  if (!p?.startDate || !p.offerAcceptedDate) throw new Error(`${personId} is not a starter`);
  const applied = getAppliedPathway(personId);
  if (!applied) throw new Error(`No Applied Pathway for ${personId}`);
  const person: PersonRef = {
    id: p.id, name: p.name, tags: p.tags, offerAcceptedDate: p.offerAcceptedDate, startDate: p.startDate,
    ...(p.lineManagerId && { lineManagerId: p.lineManagerId }),
    ...(p.buddyId && { buddyId: p.buddyId }),
    ...(p.delegateId && { delegateId: p.delegateId }),
  };
  const journeys: Record<string, JourneyDef> = {};
  for (const i of applied.snapshot.items) {
    const j = getJourney(i.journeyId, i.journeyVersion);
    if (!j) throw new Error(`Journey ${i.journeyId}@${i.journeyVersion} is missing`);
    journeys[`${j.id}@${j.version}`] = j;
  }
  return {
    today: getDemoClock(), person, pathway: applied.snapshot, journeys,
    progress: db.select().from(s.actionProgress).where(eq(s.actionProgress.personId, personId)).all().map((r) => r.data),
    overrides: db.select().from(s.itemOverrides).where(eq(s.itemOverrides.personId, personId)).all().map((r) => r.data),
    hardStopDecisions: db.select().from(s.hardStopDecisions).where(eq(s.hardStopDecisions.personId, personId)).all().map((r) => r.data),
    history: db.select().from(s.durationHistory).all()
      .map((h) => ({ journeyId: h.journeyId, journeyVersion: h.journeyVersion, days: h.days })),
  };
}
