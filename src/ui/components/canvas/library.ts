import type { StageId, Tags } from '@/src/engine/types';

export const STAGES: { id: StageId; label: string }[] = [
  { id: 'pre-contract', label: 'Pre-contract' },
  { id: 'pre-employment', label: 'Pre-employment' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'first-30-days', label: 'First 30 days' },
];

/** Fixed tag lists, SEED-DATA.md section 1. */
export const TAG_LISTS: { key: keyof Tags; label: string; values: string[] }[] = [
  { key: 'jobFamily', label: 'Job family', values: ['Branch', 'Software engineering', 'Executive', 'Modern Workplace', 'HR', 'IT'] },
  { key: 'role', label: 'Role', values: ['Customer service colleague', 'Software engineer', 'Infrastructure engineer', 'Managing director', 'Executive assistant', 'Line manager'] },
  { key: 'grade', label: 'Grade', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'X'] },
  { key: 'platform', label: 'Platform', values: ['Retail', 'Technology', 'Group Functions'] },
  { key: 'location', label: 'Location', values: ['Cardiff', 'Leeds', 'London', 'Edinburgh'] },
];

export interface LibraryJourney { id: string; version: number; title: string; stage: StageId; tags: Tags }

// The Journey library the page loaded from the database. One canvas per page, so a module-level list is enough.
export const LIBRARY: LibraryJourney[] = [];
export const setLibrary = (list: LibraryJourney[]) => { LIBRARY.splice(0, LIBRARY.length, ...list); };
