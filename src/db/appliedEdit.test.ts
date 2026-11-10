import { randomUUID } from 'node:crypto';
import { filterForViewer } from '@/src/lib/roleFilter';
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/ae-${randomUUID()}.db`;

const load = async () => ({ q: await import('./queries'), seedMod: await import('./seed'), engine: await import('../engine') });
let m: Awaited<ReturnType<typeof load>>;
const hr = 'hr-partner';

beforeAll(async () => {
  m = await load();
  m.seedMod.seed();
  m.q.applyPathway('pw-infra-e', 'person-bob', '2026-11-10');
  m.q.applyPathway('pw-infra-e', 'person-a', '2026-11-10');
});

const ids = (p: string) => m.engine.computeState(m.q.buildEngineInput(p)).items.map((i) => i.journeyId);
const item = (journeyId: string) => ({
  id: `add-${journeyId}`, journeyId, journeyVersion: m.q.getJourney(journeyId)!.version, mandatory: false, dependsOn: [],
  lane: m.q.getJourney(journeyId)!.stage, x: 0, y: 0, addedBy: { personId: hr, name: 'HR Partner', addedOn: '2026-11-10' },
});

describe('editing an Applied Pathway', () => {
  it('shows an unmodified base, when nothing is added, and refuses removing a template Journey', () => {
    const b = m.q.getAppliedBasis('person-bob')!;
    expect(b.added).toBe(0);
    expect(b.text).not.toContain('modified');
    const templateId = m.q.getAppliedPathway('person-bob')!.snapshot.items.find((i) => !i.addedBy)!.id;
    expect(() => m.q.removeAdditionFromApplied('person-bob', templateId, hr)).toThrow(/template/);
  });

  it('adds the Journey for Bob only, flags the base version as modified, and leaves a second person unchanged', () => {
    const extra = m.q.listJourneys().find((j) => !ids('person-bob').includes(j.id) && !ids('person-a').includes(j.id))!;
    const aBefore = ids('person-a');
    const aAdded = m.q.getAppliedBasis('person-a')!.added;
    m.q.addAdditionToApplied('person-bob', item(extra.id));
    expect(ids('person-bob')).toContain(extra.id);
    expect(m.engine.computeState(m.q.buildEngineInput('person-bob')).items.find((i) => i.journeyId === extra.id)?.addedBy?.name).toBe('HR Partner');
    const b = m.q.getAppliedBasis('person-bob')!;
    const live = m.q.getPathwayVersionSemver('pw-infra-e', m.q.getAppliedPathway('person-bob')!.snapshot.version)!;
    expect(b.text).toBe(`Based on ${b.title} ${live}, modified: 1 Journey added`);
    expect(b.changes[0]).toMatchObject({ by: 'HR Partner', on: '2026-11-10' });
    const seen = filterForViewer(m.engine.computeState(m.q.buildEngineInput('person-bob')), 'starter');
    expect(seen.items.find((i) => i.journeyId === extra.id)?.addedBy?.name).toBe('HR Partner');
    expect(ids('person-a')).toEqual(aBefore);
    expect(m.q.getAppliedBasis('person-a')!.added).toBe(aAdded);
    expect(m.q.listPathways().find((p) => p.id === 'pw-infra-e')!.modifiedCount).toBe(aAdded ? 2 : 1);
  });

  it('answers 403 over the route, when HR tries to remove a template Journey', async () => {
    const { DELETE } = await import('@/app/api/additions/route');
    const res = await (DELETE as (r: Request, c: unknown) => Promise<Response>)(new Request('http://x/api/additions', {
      method: 'DELETE', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ personId: 'person-bob', itemId: 'i-contracting', byPersonId: hr }),
    }), {});
    expect(res.status).toBe(403);
  });
});
