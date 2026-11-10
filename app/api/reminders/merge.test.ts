import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/g3-merge-${randomUUID()}.db`;

const load = async () => ({
  q: await import('@/src/db/queries'), seedMod: await import('@/src/db/seed'),
  engine: await import('@/src/engine'), rf: await import('@/src/lib/roleFilter'), merge: await import('./merge'),
});
let m: Awaited<ReturnType<typeof load>>;
beforeAll(async () => { m = await load(); m.seedMod.seed(); });

const view = (as: 'starter' | 'delegate' | 'buddy') => m.rf.filterForViewer(
  m.merge.withManualReminders(m.engine.computeState(m.q.buildEngineInput('person-c')), m.q.listManualReminders('person-c')), as);

describe('withManualReminders', () => {
  it('shows a sent Reminder to the starter and their Delegate, when HR sends one now', () => {
    const before = view('starter').notifications.length;
    m.q.addManualReminder('person-c', 'Have you received your merch?', m.q.getDemoClock());
    const n = { to: 'starter', message: 'Have you received your merch?', sentOn: m.q.getDemoClock() };
    expect(view('starter').notifications).toHaveLength(before + 1);
    expect(view('starter').notifications).toContainEqual(n);
    expect(view('delegate').notifications).toContainEqual(n);
  });
  it('keeps the Reminder from the Buddy, when the Buddy views the starter', () => {
    expect(view('buddy').notifications.some((x) => x.message === 'Have you received your merch?')).toBe(false);
  });
});

describe('withManualReminders order', () => {
  it('puts the engine Notification last, when a manual Reminder and a ServiceNow Notification share a day', () => {
    const base = m.engine.computeState(m.q.buildEngineInput('person-c'));
    const sn = { to: 'starter' as const, message: 'Your equipment request is complete.', sentOn: '2026-11-10' };
    const out = m.merge.withManualReminders({ ...base, notifications: [sn] }, [{ message: 'Nudge', at: '2026-11-10' }]);
    expect(out.notifications.map((n) => n.message)).toEqual(['Nudge', sn.message]);
  });
});
