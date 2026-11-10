import { and, desc, eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { db } from './client';
import { fileToJourney, loadJourneyFiles, writeJourneyFileRaw } from './files';
import * as s from './schema';
import type {
  ActionProgress, EngineInput, HardStopDecision, ISODate, ItemOverride, JourneyDef, PathwayItem, PathwaySnapshot,
  PersonRef, Tags, TimerDef,
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

export function insertJourney(def: JourneyDef & { semver?: string }): void {
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

const journeySemvers = (id: string) =>
  db.select({ version: s.journeys.version, semver: s.journeys.semver }).from(s.journeys).where(eq(s.journeys.id, id))
    .orderBy(desc(s.journeys.version)).all();
/** The semver of the newest version that has one. */
export const getJourneySemver = (id: string): string | undefined =>
  journeySemvers(id).find((r) => r.semver)?.semver ?? undefined;

export type SemverBump = 'patch' | 'minor' | 'major';
const bumpSemver = (v: string, bump: SemverBump) => {
  const [ma = 1, mi = 0, pa = 0] = v.split('.').map(Number);
  return bump === 'major' ? `${ma + 1}.0.0` : bump === 'minor' ? `${ma}.${mi + 1}.0` : `${ma}.${mi}.${pa + 1}`;
};

// Key order differs between files and builder publishes, so compare content with sorted keys.
const canon = (v: unknown) => JSON.stringify(v, (_k, x: unknown) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x);
const content = (j: JourneyDef) => canon({ ...j, id: undefined, version: undefined, semver: undefined });

const cmpSemver = (a: string, b: string) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  return [0, 1, 2].map((i) => (x![i] ?? 0) - (y![i] ?? 0)).find((d) => d !== 0) ?? 0;
};

/**
 * Re-reads journeys/: a new file becomes version 1, a file with a higher semver or changed content becomes the next version.
 * A file with a lower semver, or the same semver but different content, is stale and listed in `skipped`.
 */
export function syncJourneysFromFiles(): { added: string[]; updated: string[]; skipped?: string[] } {
  const files = loadJourneyFiles();
  return db.transaction(() => {
    const added: string[] = [];
    const updated: string[] = [];
    const skipped: string[] = [];
    for (const f of files) {
      const current = getJourney(f.id);
      if (!current) {
        insertJourney({ ...fileToJourney(f, 1), semver: f.semver });
        added.push(f.id);
        continue;
      }
      const dbSemver = getJourneySemver(f.id);
      const sameContent = content(current) === content(fileToJourney(f, 0));
      const cmp = dbSemver ? cmpSemver(f.semver, dbSemver) : 1;
      if (cmp > 0) {
        insertJourney({ ...fileToJourney(f, current.version + 1), semver: f.semver });
        updated.push(f.id);
      } else if (cmp < 0 || !sameContent) skipped.push(f.id);
    }
    return skipped.length ? { added, updated, skipped } : { added, updated };
  });
}

/** Writes a published Journey back to journeys/<id>.json and records its semver (default: a minor bump on the last one). */
export function writeJourneyFile(def: JourneyDef & { semver?: string }, bump: SemverBump = 'minor'): string {
  const rows = journeySemvers(def.id);
  const own = rows.find((r) => r.version === def.version)?.semver;
  const prev = rows.find((r) => r.version !== def.version && r.semver)?.semver;
  const semver = def.semver ?? own ?? (prev ? bumpSemver(prev, bump) : '1.0.0');
  let name: string;
  try {
    name = writeJourneyFileRaw({ ...def, semver }); // validates before writing, so a bad def changes nothing
  } catch (e) {
    if (!(e instanceof ZodError)) throw e;
    const i = e.issues[0];
    throw new Error(`That journey is not valid: ${i?.path.join('.') || 'journey'} ${i?.message ?? ''}`.trim());
  }
  db.update(s.journeys).set({ semver }).where(and(eq(s.journeys.id, def.id), eq(s.journeys.version, def.version))).run();
  return name;
}

export { listConnectors } from './files';

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
    for (const t of [s.pathwayItems, s.containers, s.timers, s.hardStops]) db.delete(t).where(eq(t.pathwayId, id)).run();
    snap.items.forEach((def, position) => db.insert(s.pathwayItems).values({ pathwayId: id, id: def.id, position, def }).run());
    snap.containers.forEach((def, position) => db.insert(s.containers).values({ pathwayId: id, id: def.id, position, def }).run());
    snap.timers.forEach((def, position) => db.insert(s.timers).values({ pathwayId: id, id: def.id, position, def }).run());
    snap.hardStops.forEach((def, position) => db.insert(s.hardStops).values({ pathwayId: id, id: def.id, position, def }).run());
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

export const getPathwaySemver = (id: string): string | undefined =>
  db.select({ semver: s.pathwayVersions.semver }).from(s.pathwayVersions).where(eq(s.pathwayVersions.pathwayId, id))
    .orderBy(desc(s.pathwayVersions.version)).get()?.semver ?? undefined;

/** The semver of one published version: Applied Pathways pin the integer, People shows this. */
export const getPathwayVersionSemver = (id: string, version: number): string | undefined =>
  db.select({ semver: s.pathwayVersions.semver }).from(s.pathwayVersions)
    .where(and(eq(s.pathwayVersions.pathwayId, id), eq(s.pathwayVersions.version, version))).get()?.semver ?? undefined;

/** publishPathway plus a semantic version on top of the integer one. The first publish is 1.0.0. */
export function publishPathwaySemver(id: string, bump: SemverBump = 'minor'): { version: number; semver: string } {
  return db.transaction(() => {
    const prev = getPathwaySemver(id);
    const version = publishPathway(id);
    const semver = prev ? bumpSemver(prev, bump) : '1.0.0';
    db.update(s.pathwayVersions).set({ semver })
      .where(and(eq(s.pathwayVersions.pathwayId, id), eq(s.pathwayVersions.version, version))).run();
    return { version, semver };
  });
}

// ---- Applied Pathways (ADR-0002: a snapshot of the live version) ---------------------------
export function applyPathway(pathwayId: string, personId: string, today: ISODate): string {
  return db.transaction(() => {
    const p = db.select().from(s.pathways).where(eq(s.pathways.id, pathwayId)).get();
    if (p?.liveVersion == null) throw new Error(`Pathway ${pathwayId} has no published version`);
    if (!getPerson(personId)) throw new Error(`Unknown person ${personId}`);
    const live = db.select().from(s.pathwayVersions)
      .where(and(eq(s.pathwayVersions.pathwayId, pathwayId), eq(s.pathwayVersions.version, p.liveVersion))).get()!.snapshot;
    const id = `applied-${personId}`;
    // Re-applying keeps the story: Additions (and the Timers they use), plus progress, overrides and Hard Stop decisions that still match.
    const old = getAppliedPathway(personId);
    const carried = (old?.snapshot.items ?? []).filter((i) => i.addedBy && !live.items.some((l) => l.id === i.id));
    const oldTimers = old?.snapshot.timers ?? [];
    const timers = [...live.timers, ...oldTimers.filter((t) => !live.timers.some((l) => l.id === t.id)
      && carried.some((i) => i.dependsOn.some((d) => d.kind === 'timer' && d.timerId === t.id)))];
    const knownDep = (d: PathwayItem['dependsOn'][number]) =>
      d.kind === 'item' ? [...live.items, ...carried].some((i) => i.id === d.itemId)
        : d.kind === 'container' ? live.containers.some((c) => c.id === d.containerId)
          : timers.some((t) => t.id === d.timerId);
    const additions = carried.filter((i) => i.dependsOn.every(knownDep));
    const snapshot = { ...live, items: [...live.items, ...additions], timers };
    const itemIds = new Set(snapshot.items.map((i) => i.id));
    const prune = <T extends { personId: string; itemId: string }>(table: typeof s.actionProgress | typeof s.itemOverrides) =>
      (db.select().from(table).where(eq(table.personId, personId)).all() as T[])
        .filter((r) => !itemIds.has(r.itemId)).forEach((r) => db.delete(table)
          .where(and(eq(table.personId, personId), eq(table.itemId, r.itemId))).run());
    prune(s.actionProgress);
    prune(s.itemOverrides);
    for (const r of db.select().from(s.hardStopDecisions).where(eq(s.hardStopDecisions.personId, personId)).all()) {
      // Hard Stop ids are shared across templates, so a different Pathway starts with no decisions (same Pathway: decision 29).
      const samePathway = old?.snapshot.pathwayId === pathwayId;
      if (!samePathway || !snapshot.hardStops.some((h) => h.id === r.data.hardStopId)) db.delete(s.hardStopDecisions).where(eq(s.hardStopDecisions.id, r.id)).run();
    }
    const appliedOn = old && old.snapshot.pathwayId === pathwayId ? old.appliedOn : today;
    db.delete(s.appliedPathways).where(eq(s.appliedPathways.personId, personId)).run();
    db.insert(s.appliedPathways).values({ id, personId, snapshot, appliedOn }).run();
    return id;
  });
}

export const getAppliedPathway = (personId: string) =>
  db.select().from(s.appliedPathways).where(eq(s.appliedPathways.personId, personId)).get();

export function addAdditionToApplied(personId: string, item: PathwayItem, timers: TimerDef[] = []): void {
  db.transaction(() => {
    const a = getAppliedPathway(personId);
    if (!a) throw new Error(`${personId} has no Applied Pathway to add a Journey to`);
    const snap = a.snapshot;
    if (snap.items.some((i) => i.id === item.id)) throw new Error(`Pathway Item ${item.id} is already on this Applied Pathway`);
    if (!getJourney(item.journeyId, item.journeyVersion)) throw new Error(`Journey ${item.journeyId}@${item.journeyVersion} does not exist`);
    const allTimers = [...snap.timers, ...timers];
    const known = (d: PathwayItem['dependsOn'][number]) =>
      d.kind === 'item' ? snap.items.some((i) => i.id === d.itemId) || d.itemId === item.id
        : d.kind === 'container' ? snap.containers.some((c) => c.id === d.containerId)
          : allTimers.some((t) => t.id === d.timerId);
    const bad = item.dependsOn.find((d) => !known(d));
    if (bad) throw new Error(`Dependency ${JSON.stringify(bad)} does not match anything on this Applied Pathway`);
    const snapshot = { ...snap, items: [...snap.items, item], timers: allTimers };
    db.update(s.appliedPathways).set({ snapshot }).where(eq(s.appliedPathways.personId, personId)).run();
  });
}

/** An Addition can be removed by its author until someone has started its Actions. */
export function removeAdditionFromApplied(personId: string, itemId: string, byPersonId: string): void {
  db.transaction(() => {
    const a = getAppliedPathway(personId);
    const item = a?.snapshot.items.find((i) => i.id === itemId);
    if (!a || !item) throw new Error(`Pathway Item ${itemId} is not on the Applied Pathway for ${personId}`);
    if (item.addedBy?.personId !== byPersonId) throw new Error(`Only the person who added ${itemId} can remove it`);
    const started = db.select().from(s.actionProgress)
      .where(and(eq(s.actionProgress.personId, personId), eq(s.actionProgress.itemId, itemId))).get();
    if (started) throw new Error(`${itemId} has already started and can no longer be removed`);
    const snapshot = { ...a.snapshot, items: a.snapshot.items.filter((i) => i.id !== itemId) };
    db.update(s.appliedPathways).set({ snapshot }).where(eq(s.appliedPathways.personId, personId)).run();
  });
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
    today: getDemoClock(), person, appliedOn: applied.appliedOn, pathway: applied.snapshot, journeys,
    progress: db.select().from(s.actionProgress).where(eq(s.actionProgress.personId, personId)).all().map((r) => r.data),
    overrides: db.select().from(s.itemOverrides).where(eq(s.itemOverrides.personId, personId)).all().map((r) => r.data),
    hardStopDecisions: db.select().from(s.hardStopDecisions).where(eq(s.hardStopDecisions.personId, personId)).all().map((r) => r.data),
    history: db.select().from(s.durationHistory).all()
      .map((h) => ({ journeyId: h.journeyId, journeyVersion: h.journeyVersion, days: h.days })),
  };
}

// ---- People extras: Delegate, manual Reminders, handovers -------------------------------------
export function setDelegate(personId: string, delegateId: string | null): void {
  if (!getPerson(personId)) throw new Error(`Unknown person ${personId}`);
  if (delegateId !== null && !getPerson(delegateId)) throw new Error(`Unknown person ${delegateId}`);
  db.update(s.persons).set({ delegateId }).where(eq(s.persons.id, personId)).run();
}
export function addManualReminder(personId: string, message: string, at: ISODate): void {
  db.insert(s.manualReminders).values({ personId, message, at }).run();
}
export const listManualReminders = (personId: string) =>
  db.select().from(s.manualReminders).where(eq(s.manualReminders.personId, personId)).orderBy(s.manualReminders.id).all();
export function addHandover(personId: string, question: string, at: ISODate, agentName?: string, summary?: string): void {
  db.insert(s.handovers).values({ personId, question, at, agentName, summary }).run();
}
/** Handovers from every starter this Line Manager manages, oldest first. */
export function listHandovers(lineManagerId: string) {
  const mine = new Set(listPersons().filter((p) => p.lineManagerId === lineManagerId).map((p) => p.id));
  return db.select().from(s.handovers).orderBy(s.handovers.id).all().filter((h) => mine.has(h.personId));
}

// ---- Insights: every history sample with its Pathway, Journey, Stage and who the starter was --------
export function insightsData() {
  const pathways = new Map(db.select().from(s.pathways).all().map((p) => [p.id, p.title]));
  const journeys = new Map(db.select().from(s.journeys).all().map((j) => [`${j.id}@${j.version}`, j]));
  return db.select().from(s.durationHistory).orderBy(s.durationHistory.id).all().map((h) => {
    const j = journeys.get(`${h.journeyId}@${h.journeyVersion}`);
    return {
      pathwayId: h.pathwayId, pathwayTitle: pathways.get(h.pathwayId) ?? h.pathwayId, pathwayVersion: h.pathwayVersion,
      journeyId: h.journeyId, journeyTitle: j?.title ?? h.journeyId, stage: (j?.stage ?? 'pre-employment') as JourneyDef['stage'],
      businessArea: h.businessArea, role: h.role, grade: h.grade, days: h.days,
    };
  });
}
