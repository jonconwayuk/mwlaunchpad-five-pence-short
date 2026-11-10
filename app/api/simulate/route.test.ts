import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/sim-${randomUUID()}.db`;
const load = async () => ({
  q: await import('@/src/db/queries'), seedMod: await import('@/src/db/seed'), engine: await import('@/src/engine'),
  route: await import('./route'), sn: await import('@/src/adapters/mockServiceNow'), rf: await import('@/src/lib/roleFilter'),
});
let m: Awaited<ReturnType<typeof load>>;
beforeAll(async () => { m = await load(); });

const MSG = 'Your equipment request is complete';
const post = () => m.route.POST(new Request('http://x/api/simulate', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ personId: 'person-bob', itemId: 'i-equipment', actionId: 'j-equipment-request-a1', result: 'returned' }),
}), undefined);
const state = () => m.engine.computeState(m.q.buildEngineInput('person-bob'));

describe('ServiceNow Equipment request', () => {
  it('waits with no Notification, when ServiceNow has not reported', () => {
    m.seedMod.seed();
    m.q.applyPathway('pw-infra-e', 'person-bob', m.q.getDemoClock());
    const item = state().items.find((i) => i.itemId === 'i-equipment')!;
    expect(item.currentAction?.id).toBe('j-equipment-request-a1');
    expect(state().notifications.some((n) => n.message.startsWith(MSG))).toBe(false);
  });

  it('raises the Notification to the starter and moves the Journey on, when ServiceNow returns the result', async () => {
    m.seedMod.seed();
    m.q.applyPathway('pw-infra-e', 'person-bob', m.q.getDemoClock());
    const res = await post();
    expect(res.status).toBe(200);
    expect(await m.sn.mockServiceNow.getResult('person-bob')).toBe('returned');
    const st = state();
    expect(st.items.find((i) => i.itemId === 'i-equipment')).toMatchObject({ status: 'done' });
    expect(m.rf.filterForViewer(st, 'starter').notifications.some((n) => n.message.startsWith(MSG) && n.to === 'starter')).toBe(true);
  });

  it('never shows the Notification to a Buddy, when the request completes', async () => {
    m.seedMod.seed();
    m.q.applyPathway('pw-infra-e', 'person-bob', m.q.getDemoClock());
    await post();
    expect(JSON.stringify(m.rf.filterForViewer(state(), 'buddy'))).not.toContain(MSG);
  });

  it('seeds the same Pathway Items, when seeded twice', () => {
    const ids = () => { m.seedMod.seed(); return m.q.getPathwayDraft('pw-infra-e')!.items.map((i) => i.id); };
    expect(ids()).toEqual(ids());
    expect(ids()).toContain('i-equipment');
  });
});
