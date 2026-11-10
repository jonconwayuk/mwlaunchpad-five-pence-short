import type { ActionType, StageId, Tags } from '@/src/engine/types';

export const STAGES: { id: StageId; label: string }[] = [
  { id: 'pre-contract', label: 'Pre-contract' },
  { id: 'pre-employment', label: 'Pre-employment' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'first-30-days', label: 'First 30 days' },
];
export const stageLabel = (id: StageId) => STAGES.find((s) => s.id === id)?.label ?? id;

// SEED-DATA.md section 1 (same lists as src/db/files.ts, which validates the Journey files)
export const TAG_LISTS: Record<keyof Tags, string[]> = {
  jobFamily: ['Branch', 'Software engineering', 'Executive', 'Modern Workplace', 'HR', 'IT'],
  role: ['Customer service colleague', 'Software engineer', 'Infrastructure engineer', 'Managing director', 'Executive assistant', 'Line manager'],
  grade: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  platform: ['Retail', 'Technology', 'Group Functions'],
  location: ['Cardiff', 'Leeds', 'London', 'Edinburgh'],
};
export const TAG_LABELS: Record<keyof Tags, string> = {
  jobFamily: 'Job family', role: 'Role', grade: 'Grade', platform: 'Platform', location: 'Location',
};
export const TAG_KEYS = Object.keys(TAG_LISTS) as (keyof Tags)[];

export const ACTION_TYPES: { id: ActionType; label: string }[] = [
  { id: 'read', label: 'Read' },
  { id: 'notification', label: 'Notification' },
  { id: 'task', label: 'Task' },
  { id: 'automation', label: 'Hidden automation' },
  { id: 'choose', label: 'Choose' },
  { id: 'provide', label: 'Provide' },
];
