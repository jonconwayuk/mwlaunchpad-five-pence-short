import { adapterStore, type VettingAdapter } from './types';

const results = adapterStore('vetting');

export const mockVetting: VettingAdapter = {
  async getResult(personId) {
    return results.get(personId) ?? 'pending';
  },
  simulate(personId, result) {
    results.set(personId, result);
  },
};
