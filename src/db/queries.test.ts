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
});
