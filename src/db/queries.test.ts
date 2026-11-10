import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/qt-${randomUUID()}.db`;

const load = async () => ({ q: await import('./queries'), seedMod: await import('./seed'), engine: await import('../engine') });
type Mods = Awaited<ReturnType<typeof load>>;
let m: Mods;

beforeAll(async () => { m = await load(); });

const state = () => m.engine.computeState(m.q.buildEngineInput('person-a'));
const checks = () => state().items.find((i) => i.itemId.includes('checks'))!;

describe('applyPathway', () => {
  it('keeps progress, Additions and appliedOn, when the same Pathway is re-applied, so the seeded story survives', () => {
    m.seedMod.seed();
    const before = m.q.getAppliedPathway('person-a')!;
    const additions = before.snapshot.items.filter((i) => i.addedBy).map((i) => i.id);
    expect(additions.length).toBeGreaterThan(0);
    const waiting = checks().waitingDays;
    expect(waiting).toBe(18);

    m.q.applyPathway('pw-branch', 'person-a', '2026-11-10');

    const after = m.q.getAppliedPathway('person-a')!;
    expect(after.appliedOn).toBe(before.appliedOn);
    expect(after.snapshot.items.filter((i) => i.addedBy).map((i) => i.id)).toEqual(additions);
    expect(checks().waitingDays).toBe(18);
  });

  it('keeps Additions and sets appliedOn to today, when a different Pathway is applied', () => {
    m.seedMod.seed();
    m.q.applyPathway('pw-engineer', 'person-a', '2026-11-10');
    const after = m.q.getAppliedPathway('person-a')!;
    expect(after.appliedOn).toBe('2026-11-10');
    expect(after.snapshot.pathwayId).toBe('pw-engineer');
    expect(after.snapshot.items.some((i) => i.addedBy)).toBe(true);
    expect(() => state()).not.toThrow();
  });

  it('drops every Hard Stop decision, when a different Pathway is applied after a Confirm, so the new Pathway is not stopped at once', () => {
    m.seedMod.seed();
    m.q.recordHardStopDecision('person-a', { hardStopId: 'hs-failed', decision: 'confirm', at: '2026-11-10' });
    m.q.applyPathway('pw-engineer', 'person-a', '2026-11-10');
    expect(m.q.getAppliedPathway('person-a')!.snapshot.hardStops.some((h) => h.id === 'hs-failed')).toBe(true);
    expect(m.q.buildEngineInput('person-a').hardStopDecisions).toEqual([]);
  });
});

describe('getPathwayVersionSemver', () => {
  it('names the pinned version semantically, when HR applies a Pathway after a New content publish, so People shows 1.1.0 not v2', () => {
    m.seedMod.seed();
    expect(m.q.publishPathwaySemver('pw-infra-e', 'minor')).toEqual({ version: 2, semver: '1.1.0' });
    m.q.applyPathway('pw-infra-e', 'person-bob', '2026-11-10');
    const applied = m.q.getAppliedPathway('person-bob')!;
    expect(m.q.getPathwayVersionSemver(applied.snapshot.pathwayId, applied.snapshot.version)).toBe('1.1.0');
  });
});
