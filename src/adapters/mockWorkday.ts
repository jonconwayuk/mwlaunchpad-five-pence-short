import type { WorkdayAdapter } from './types';

// Synthetic addresses only.
const ADDRESSES: Record<string, string> = {
  'person-a': '1 Example Street, Cardiff, CF00 0AA',
  'person-b': '2 Example Road, Leeds, LS00 0BB',
  'person-c': '3 Example Square, London, EC0A 0CC',
  'person-bob': '4 Example Lane, Edinburgh, EH0 0DD',
};

/** A new hire waiting in Workday. Synthetic. Only name, tags, start date and Line Manager are kept when added. */
export interface WorkdayNewHire {
  id: string; name: string; role: string; jobFamily: string; grade: string; location: string;
  startDate: string; lineManagerId: string; lineManagerName: string;
}

const NEW_HIRES: WorkdayNewHire[] = [
  { id: 'wd-1001', name: 'Maya Rahman', role: 'Infrastructure engineer', jobFamily: 'Modern Workplace', grade: 'E', location: 'Edinburgh',
    startDate: '2026-12-07', lineManagerId: 'lm-hannah', lineManagerName: 'Hannah Price' },
  { id: 'wd-1002', name: 'Owen Griffiths', role: 'Customer service colleague', jobFamily: 'Branch', grade: 'B', location: 'Cardiff',
    startDate: '2026-12-14', lineManagerId: 'lm-priya', lineManagerName: 'Priya Shah' },
  { id: 'wd-1003', name: 'Tess Mbeki', role: 'Software engineer', jobFamily: 'Software engineering', grade: 'C', location: 'Leeds',
    startDate: '2027-01-11', lineManagerId: 'lm-chris', lineManagerName: 'Chris Lee' },
  { id: 'wd-1004', name: 'Isla Fraser', role: 'Executive assistant', jobFamily: 'Executive', grade: 'D', location: 'London',
    startDate: '2027-01-18', lineManagerId: 'lm-ruth', lineManagerName: 'Ruth King' },
];

export const mockWorkday: WorkdayAdapter & { listNewHires(): Promise<WorkdayNewHire[]> } = {
  async getDeliveryAddress(personId) {
    const address = ADDRESSES[personId];
    if (!address) throw new Error(`No delivery address on the mock system of record for ${personId}`);
    return address;
  },
  async listNewHires() {
    return NEW_HIRES.map((h) => ({ ...h }));
  },
};
