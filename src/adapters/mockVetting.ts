import type { AdapterResult, VettingAdapter } from './types';

const results = new Map<string, AdapterResult>(); // in memory: Reset demo restarts the story

export const mockVetting: VettingAdapter = {
  async getResult(personId) {
    return results.get(personId) ?? 'pending';
  },
  simulate(personId, result) {
    results.set(personId, result);
  },
};
