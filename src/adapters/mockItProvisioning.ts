import { adapterStore, type ItProvisioningAdapter } from './types';

const results = adapterStore('itProvisioning');

export const mockItProvisioning: ItProvisioningAdapter = {
  async getResult(personId) {
    return results.get(personId) ?? 'pending';
  },
  simulate(personId, result) {
    results.set(personId, result);
  },
};
