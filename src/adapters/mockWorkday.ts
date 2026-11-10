import type { WorkdayAdapter } from './types';

// Synthetic addresses only.
const ADDRESSES: Record<string, string> = {
  'person-a': '1 Example Street, Cardiff, CF00 0AA',
  'person-b': '2 Example Road, Leeds, LS00 0BB',
  'person-c': '3 Example Square, London, EC0A 0CC',
  'person-bob': '4 Example Lane, Edinburgh, EH0 0DD',
};

export const mockWorkday: WorkdayAdapter = {
  async getDeliveryAddress(personId) {
    const address = ADDRESSES[personId];
    if (!address) throw new Error(`No delivery address on the mock system of record for ${personId}`);
    return address;
  },
};
