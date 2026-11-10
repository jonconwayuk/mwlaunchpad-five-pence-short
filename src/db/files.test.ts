import { randomUUID } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/ft-${randomUUID()}.db`;
// A copy of journeys/, so sync and write tests never touch the repo folder.
const dir = mkdtempSync(join(tmpdir(), 'journeys-'));
cpSync(join(process.cwd(), 'journeys'), dir, { recursive: true });
process.env.JOURNEYS_DIR = dir;

const load = async () => ({
  q: await import('./queries'), files: await import('./files'), seedMod: await import('./seed'),
  client: await import('./client'), engine: await import('../engine'),
});
let m: Awaited<ReturnType<typeof load>>;
beforeAll(async () => { m = await load(); });

const addDays = (d: string, n: number) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
const dump = () => m.client.sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()
  .map((t) => JSON.stringify(m.client.sqlite.prepare(`SELECT * FROM ${(t as { name: string }).name}`).all())).join('\n');

describe('Journey files', () => {
  it('loads every file with a semver, when the repo folder is valid', () => {
    const all = m.files.loadJourneyFiles();
    expect(all.length).toBeGreaterThanOrEqual(21);
    expect(all.every((j) => /^\d+\.\d+\.\d+$/.test(j.semver))).toBe(true);
    expect(m.q.listConnectors().map((c) => c.id)).toEqual(['oracle', 'servicenow', 'workday']);
  });

  it('rejects the folder, when a file has a bad grade or an unknown connector operation', () => {
    const bad = join(dir, 'j-bad.json');
    const good = JSON.parse(readFileSync(join(dir, 'j-payroll.json'), 'utf8'));
    writeFileSync(bad, JSON.stringify({ ...good, id: 'j-bad', tags: { grade: 'Colleague' } }));
    expect(() => m.files.loadJourneyFiles()).toThrow(/j-bad\.json is not valid/);
    writeFileSync(bad, JSON.stringify({ ...good, id: 'j-bad', actions: [{ id: 'x', type: 'automation', label: 'X', connector: 'workday', operation: 'nope' }] }));
    expect(() => m.files.loadJourneyFiles()).toThrow(/unknown connector operation/);
    writeFileSync(bad, JSON.stringify({ ...good, id: 'j-other' }));
    expect(() => m.files.loadJourneyFiles()).toThrow(/must match the file name/);
    writeFileSync(bad, JSON.stringify({ ...good, id: 'j-bad' })); // leave a valid file for the next tests
  });

  it('adds a new file and versions a changed one, when synced after a reseed', () => {
    m.seedMod.seed();
    expect(m.q.syncJourneysFromFiles()).toEqual({ added: ['j-bad'], updated: [] });
    const lab = JSON.parse(readFileSync(join(dir, 'j-lab-env.json'), 'utf8'));
    writeFileSync(join(dir, 'j-lab-env.json'), JSON.stringify({ ...lab, semver: '1.1.0', title: 'Lab environment and tools' }));
    expect(m.q.syncJourneysFromFiles()).toEqual({ added: [], updated: ['j-lab-env'] });
    expect(m.q.getJourney('j-lab-env')).toMatchObject({ version: 2, title: 'Lab environment and tools' });
    expect(m.q.getJourneySemver('j-lab-env')).toBe('1.1.0');
    expect(m.q.syncJourneysFromFiles()).toEqual({ added: [], updated: [] });
  });

  it('writes a Journey back as a file with a minor bump, when published from the builder', () => {
    m.seedMod.seed();
    const published = m.q.publishJourney({ ...m.q.getJourney('j-events')!, title: 'Events near you' });
    expect(m.q.writeJourneyFile(published)).toBe('j-events.json');
    expect(JSON.parse(readFileSync(join(dir, 'j-events.json'), 'utf8'))).toMatchObject({ semver: '1.1.0', title: 'Events near you' });
    expect(m.q.syncJourneysFromFiles().updated).toEqual(['j-lab-env']); // the file changed in the test above; j-events is in step
  });
});

describe('Journey file safety', () => {
  it('skips a stale file, when its semver is lower than the published one', () => {
    m.seedMod.seed();
    const path = join(dir, 'j-events.json');
    const old = readFileSync(path, 'utf8');
    const published = m.q.publishJourney({ ...m.q.getJourney('j-events')!, title: 'Events v2' });
    m.q.writeJourneyFile(published);
    expect(m.q.getJourneySemver('j-events')).toBe('1.1.0');
    const version = m.q.getJourney('j-events')!.version;
    writeFileSync(path, old); // restore the 1.0.0 file
    const r = m.q.syncJourneysFromFiles();
    expect(r.updated).not.toContain('j-events');
    expect(r.skipped).toContain('j-events');
    expect(m.q.getJourney('j-events')!.version).toBe(version);
    expect(m.q.getJourneySemver('j-events')).toBe('1.1.0');
  });

  it('names the file, when it is not valid JSON', () => {
    const bad = join(dir, 'j-broken.json');
    writeFileSync(bad, '{ nope');
    expect(() => m.files.loadJourneyFiles()).toThrow(/j-broken\.json is not valid JSON: /);
    rmSync(bad);
  });

  it('leaves the db semver unchanged, when the Journey to write is invalid', () => {
    m.seedMod.seed();
    const published = m.q.publishJourney({ ...m.q.getJourney('j-events')!, title: '' });
    const before = m.q.getJourneySemver('j-events');
    expect(() => m.q.writeJourneyFile(published)).toThrow(/^That journey is not valid: /);
    expect(m.q.getJourneySemver('j-events')).toBe(before);
  });

  it('says which Journey is missing, when a template uses one with no file', async () => {
    const d = mkdtempSync(join(tmpdir(), 'journeys-missing-'));
    cpSync(dir, d, { recursive: true });
    rmSync(join(d, 'j-payroll.json'));
    process.env.JOURNEYS_DIR = d;
    vi.resetModules();
    try {
      const sd = await import('./seedData');
      expect(() => sd.TEMPLATES.forEach((t) => sd.buildTemplate(t))).toThrow(/Template uses j-payroll but journeys\/j-payroll\.json is missing/);
    } finally { process.env.JOURNEYS_DIR = dir; }
  });
});

describe('seed', () => {
  it('produces identical data, when run twice', () => {
    m.seedMod.seed();
    const first = dump();
    m.seedMod.seed();
    expect(dump()).toBe(first);
  });

  it('gives Pathways a semver and bumps it, when published again', () => {
    m.seedMod.seed();
    expect(m.q.getPathwaySemver('pw-infra-e')).toBe('1.0.0');
    expect(m.q.publishPathwaySemver('pw-infra-e')).toEqual({ version: 2, semver: '1.1.0' });
    expect(m.q.publishPathwaySemver('pw-infra-e', 'major').semver).toBe('2.0.0');
    expect(m.q.publishPathwaySemver('pw-infra-e', 'patch').semver).toBe('2.0.1');
  });

  it('spreads history across business areas, roles and grades, without moving the checks Usual Range', () => {
    m.seedMod.seed();
    const rows = m.q.insightsData();
    expect(new Set(rows.map((r) => r.businessArea)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(rows.map((r) => r.role)).size).toBeGreaterThanOrEqual(4);
    expect([...new Set(rows.map((r) => r.grade))].sort()).toEqual(['B', 'C', 'D', 'E', 'F']);
    const a = m.engine.computeState(m.q.buildEngineInput('person-a')).items.find((i) => i.itemId === 'i-checks')!;
    expect(a).toMatchObject({ waitingDays: 18, usualRange: [21, 35] });
  });
});

describe("Bob's story", () => {
  it('shows every headline moment, when HR applies Infrastructure engineer E and the clock moves 3 weeks', () => {
    m.seedMod.seed();
    expect(m.q.getAppliedPathway('person-bob')).toBeUndefined();
    const t = m.q.getDemoClock();
    m.q.applyPathway('pw-infra-e', 'person-bob', t);
    m.q.setDemoClock(addDays(t, 21));
    const input = m.q.buildEngineInput('person-bob');
    const st = m.engine.computeState(input);
    const item = (id: string) => st.items.find((i) => i.itemId === id)!;
    expect(item('i-priv-access')).toMatchObject({ blockedFlag: true, waitingDays: 21, usualRange: [19, 28], overdue: false });
    expect(st.containers.find((c) => c.containerId === 'c-cleared')).toMatchObject({ complete: false });
    expect(item('i-pulse-14')).toMatchObject({ available: false, unmetDependencies: [{ kind: 'timer', timerId: 't-pulse-14' }] });
    expect(input.pathway.hardStops.find((h) => h.id === 'hs-failed')!.trigger).toEqual({ kind: 'on-failed', itemId: 'i-checks' });
    expect(st.needsDecisions).toEqual([]);
    const teamJourney = m.q.listJourneys().find((j) => j.id === 'j-mw-access')!;
    expect(teamJourney.tags.jobFamily).toBe('Modern Workplace');
    expect(input.pathway.items.some((i) => i.journeyId === 'j-mw-access')).toBe(false);
    m.q.addAdditionToApplied('person-bob', { ...input.pathway.items.find((i) => i.id === 'i-buddy')!,
      id: 'i-mw-access', journeyId: 'j-mw-access', addedBy: { personId: 'lm-hannah', name: 'Hannah Price' } });
    expect(m.engine.computeState(m.q.buildEngineInput('person-bob')).items.some((i) => i.itemId === 'i-mw-access')).toBe(true);
  });

  it('records Delegates, manual Reminders and handovers, when set', () => {
    m.seedMod.seed();
    m.q.setDelegate('person-bob', 'buddy-leo');
    expect(m.q.getPerson('person-bob')!.delegateId).toBe('buddy-leo');
    m.q.setDelegate('person-bob', null);
    expect(m.q.getPerson('person-bob')!.delegateId).toBeNull();
    expect(() => m.q.setDelegate('person-bob', 'nobody')).toThrow(/Unknown person/);
    m.q.addManualReminder('person-bob', 'Have you received your merch?', '2026-11-10');
    expect(m.q.listManualReminders('person-bob')).toMatchObject([{ message: 'Have you received your merch?' }]);
    m.q.addHandover('person-bob', 'Can I bring my own keyboard?', '2026-11-10');
    expect(m.q.listHandovers('lm-hannah')).toMatchObject([{ personId: 'person-bob' }]);
    expect(m.q.listHandovers('lm-priya')).toEqual([]);
  });
});
