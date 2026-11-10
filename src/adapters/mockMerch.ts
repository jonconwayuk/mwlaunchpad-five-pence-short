import { adapterStore, type MerchAdapter } from './types';

const results = adapterStore('merch');

export const mockMerch: MerchAdapter = {
  async getResult(personId) {
    return results.get(personId) ?? 'pending';
  },
  simulate(personId, result) {
    results.set(personId, result);
  },
};
