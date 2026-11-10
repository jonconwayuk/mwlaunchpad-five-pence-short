import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL = `file:/tmp/workday-${randomUUID()}.db`;

let route: typeof import('./route');
beforeAll(async () => {
  (await import('@/src/db/seed')).seed();
  route = await import('./route');
});

type Json = { ok: boolean; data?: any; error?: string }; // eslint-disable-line @typescript-eslint/no-explicit-any -- test helper
const post = async (body: unknown): Promise<{ status: number; json: Json }> => {
  const res = await route.POST(new Request('http://x/api/workday/new-starters', { method: 'POST', body: JSON.stringify(body) }), {});
  return { status: res.status, json: (await res.json()) as Json };
};
const list = async () => ((await (await route.GET(new Request('http://x/api/workday/new-starters'), {})).json()) as Json).data as { id: string; added: boolean }[];

describe('/api/workday/new-starters', () => {
  it('lists at least three hires, none added, when first asked', async () => {
    const hires = await list();
    expect(hires.length).toBeGreaterThanOrEqual(3);
    expect(hires.every((h) => !h.added)).toBe(true);
  });

  it('adding a hire creates a starter with its tags and no Pathway, then marks it added', async () => {
    const { status, json } = await post({ hireId: 'wd-1001' });
    expect(status).toBe(200);
    const { getPerson, getAppliedPathway } = await import('@/src/db/queries');
    expect(getPerson(json.data.personId)).toMatchObject({ name: 'Maya Rahman', role: 'starter', lineManagerId: 'lm-hannah', tags: { grade: 'E', jobFamily: 'Modern Workplace' } });
    expect(getAppliedPathway(json.data.personId)).toBeFalsy();
    expect((await list()).find((h) => h.id === 'wd-1001')?.added).toBe(true);
  });

  it('adding the same hire twice is refused with a 409', async () => {
    expect((await post({ hireId: 'wd-1001' })).status).toBe(409);
  });

  it('an unknown hire is a 404 and a bad body is a 400', async () => {
    expect((await post({ hireId: 'wd-nope' })).status).toBe(404);
    expect((await post({})).status).toBe(400);
  });

  it('reset demo removes anyone added this way', async () => {
    (await import('@/src/db/seed')).seed();
    const { getPerson } = await import('@/src/db/queries');
    expect(getPerson('workday-wd-1001')).toBeFalsy();
    expect(getPerson('person-bob')).toBeTruthy();
  });
});
