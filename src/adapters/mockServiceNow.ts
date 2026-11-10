import { adapterStore, type ServiceNowAdapter } from './types';

const results = adapterStore('serviceNow');

export const mockServiceNow: ServiceNowAdapter = {
  async getResult(personId) {
    return results.get(personId) ?? 'pending';
  },
  simulate(personId, result) {
    results.set(personId, result);
  },
};
