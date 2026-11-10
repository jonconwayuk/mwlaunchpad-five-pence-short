import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/db/queries', () => ({
  listHandovers: vi.fn(() => [{ id: 1, personId: 'person-bob', question: 'When do I get my laptop?', at: '2026-12-01', agentName: 'Handover agent', summary: 'Laptop question' }]),
  getPerson: vi.fn(() => ({ name: 'Bob Warwick' })),
  buildEngineInput: vi.fn(),
}));

const { handoversFor } = await import('./load');

describe('handoversFor', () => {
  it('lists the starter and question, when the Line Manager asks', () => {
    expect(handoversFor('line-manager', 'lm-hannah')).toEqual([
      { id: 1, personId: 'person-bob', starterName: 'Bob Warwick', question: 'When do I get my laptop?', at: '2026-12-01',
        source: 'From a Teams chat', agentName: 'Handover agent', summary: 'Laptop question' },
    ]);
  });
  it('falls back to the question, when an old handover has no agent or summary', async () => {
    const q = await import('@/src/db/queries');
    vi.mocked(q.listHandovers).mockReturnValueOnce([{ id: 2, personId: 'person-bob', question: 'Old one', at: '2026-11-01', agentName: null, summary: null }]);
    expect(handoversFor('line-manager', 'lm-hannah')[0]).toMatchObject({ agentName: null, summary: 'Old one', source: 'From a Teams chat' });
  });
  it('lists nothing, when a Buddy asks', () => {
    expect(handoversFor('buddy', 'buddy-leo')).toEqual([]);
  });
});
