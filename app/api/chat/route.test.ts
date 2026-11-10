import { describe, expect, it } from 'vitest';
import { POST } from './route';

const call = async (body: unknown) => {
  const res = await POST(new Request('http://x/api/chat', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }), {});
  return { status: res.status, json: (await res.json()) as { ok: boolean; data?: Record<string, unknown>; error?: string } };
};

describe('POST /api/chat', () => {
  it('a pay question, when asked, is answered by the Payroll helper', async () => {
    const { status, json } = await call({ personId: 'person-bob', question: 'when do I get paid' });
    expect(status).toBe(200);
    expect(json.data).toMatchObject({ agentId: 'payroll-helper', agentName: 'Payroll helper' });
    expect(String(json.data?.answer)).toMatch(/last working day/);
  });

  it('a question no agent knows, when asked, returns none', async () => {
    expect((await call({ personId: 'person-bob', question: 'zebra quantum teapot' })).json.data).toEqual({ none: true });
  });

  it('a missing or empty question, when posted, is a 400', async () => {
    expect((await call({ personId: 'person-bob', question: '   ' })).status).toBe(400);
    expect((await call({ question: 'when do I get paid' })).status).toBe(400);
    expect((await call('not json')).status).toBe(400);
  });

  it('a question over 300 characters, when posted, is a 400', async () => {
    expect((await call({ personId: 'person-bob', question: 'a'.repeat(301) })).status).toBe(400);
  });
});
