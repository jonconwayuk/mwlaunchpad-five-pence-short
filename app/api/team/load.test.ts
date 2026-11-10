import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/db/queries', () => ({
  listHandovers: vi.fn(() => [{ id: 1, personId: 'person-bob', question: 'When do I get my laptop?', at: '2026-12-01' }]),
  getPerson: vi.fn(() => ({ name: 'Bob Warwick' })),
  buildEngineInput: vi.fn(),
}));

const { handoversFor } = await import('./load');

describe('handoversFor', () => {
  it('lists the starter and question, when the Line Manager asks', () => {
    expect(handoversFor('line-manager', 'lm-hannah')).toEqual([
      { id: 1, personId: 'person-bob', starterName: 'Bob Warwick', question: 'When do I get my laptop?', at: '2026-12-01' },
    ]);
  });
  it('lists nothing, when a Buddy asks', () => {
    expect(handoversFor('buddy', 'buddy-leo')).toEqual([]);
  });
});
