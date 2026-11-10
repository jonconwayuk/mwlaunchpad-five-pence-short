import type { StageId, Tags } from '@/src/engine/types';

export const STAGES: { id: StageId; label: string }[] = [
  { id: 'pre-contract', label: 'Pre-contract' },
  { id: 'pre-employment', label: 'Pre-employment' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'first-30-days', label: 'First 30 days' },
];

/** Fixed tag lists, SEED-DATA.md section 1. */
export const TAG_LISTS: { key: keyof Tags; label: string; values: string[] }[] = [
  { key: 'jobFamily', label: 'Job family', values: ['Branch', 'Software engineering', 'Executive', 'HR', 'IT'] },
  { key: 'role', label: 'Role', values: ['Customer service colleague', 'Software engineer', 'Managing director', 'Executive assistant', 'Line manager'] },
  { key: 'grade', label: 'Grade', values: ['Colleague', 'Manager', 'Senior manager', 'Executive'] },
  { key: 'platform', label: 'Platform', values: ['Retail', 'Technology', 'Group Functions'] },
  { key: 'location', label: 'Location', values: ['Cardiff', 'Leeds', 'London', 'Edinburgh'] },
];

export interface LibraryJourney { id: string; title: string; stage: StageId; tags: Tags }

// shortcut: static library, wave D2 loads it from the database
// Titles and Stages from SEED-DATA.md section 3; tags inferred from owner team (none listed there).
export const LIBRARY: LibraryJourney[] = [
  { id: 'j-contracting', title: 'Contracting', stage: 'pre-contract', tags: { jobFamily: 'HR' } },
  { id: 'j-payroll', title: 'Payroll', stage: 'pre-employment', tags: { jobFamily: 'HR' } },
  { id: 'j-checks', title: 'Pre-employment checks', stage: 'pre-employment', tags: { jobFamily: 'HR' } },
  { id: 'j-id', title: 'ID creation', stage: 'pre-employment', tags: { jobFamily: 'IT' } },
  { id: 'j-manager-ready', title: 'Manager ready', stage: 'pre-employment', tags: { jobFamily: 'HR' } },
  { id: 'j-buddy', title: 'Meet your buddy', stage: 'pre-employment', tags: { jobFamily: 'HR' } },
  { id: 'j-pulse', title: 'Pulse check', stage: 'first-30-days', tags: { jobFamily: 'HR' } },
  { id: 'j-branch-device', title: 'Branch device', stage: 'pre-employment', tags: { jobFamily: 'Branch', platform: 'Retail' } },
  { id: 'j-dev-device', title: 'Developer device', stage: 'pre-employment', tags: { jobFamily: 'Software engineering', platform: 'Technology' } },
  { id: 'j-exec-device', title: 'Executive device', stage: 'pre-employment', tags: { jobFamily: 'Executive', platform: 'Group Functions' } },
  { id: 'j-uniform', title: 'Uniform', stage: 'pre-employment', tags: { jobFamily: 'Branch', platform: 'Retail' } },
  { id: 'j-branch-induction', title: 'Branch induction', stage: 'onboarding', tags: { jobFamily: 'Branch', platform: 'Retail' } },
  { id: 'j-cash-handling', title: 'Cash-handling training', stage: 'first-30-days', tags: { jobFamily: 'Branch', platform: 'Retail' } },
  { id: 'j-eng-intro', title: 'Engineering community intro', stage: 'onboarding', tags: { jobFamily: 'Software engineering', platform: 'Technology' } },
  { id: 'j-payments-access', title: 'Payments squad access package', stage: 'pre-employment', tags: { jobFamily: 'Software engineering', platform: 'Technology' } },
  { id: 'j-exec-welcome', title: 'Welcome from sponsoring exec', stage: 'onboarding', tags: { jobFamily: 'Executive', platform: 'Group Functions' } },
  { id: 'j-start-delay', title: 'Start delay engagement', stage: 'pre-employment', tags: { jobFamily: 'HR' } },
  { id: 'j-events', title: 'In-person events calendar', stage: 'onboarding', tags: { jobFamily: 'HR' } },
];
