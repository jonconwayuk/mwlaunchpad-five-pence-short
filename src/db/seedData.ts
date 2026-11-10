// Synthetic data from SEED-DATA.md. Every name, place and date here is invented.
import { fileToJourney, loadJourneyFiles, TAG_LISTS } from './files';
import type { ContainerDef, DependencyRef, HardStopDef, JourneyDef, PathwayItem, PathwaySnapshot,
  StageId, Tags, TimerDef,
} from '../engine/types';

export const DEMO_T = '2026-11-10';

// Grades A to G, then X for the Executive (feedback items 6 and 20). Old names map: Colleague B (C for engineers), Manager D, Senior manager E, Executive G.
export { TAG_LISTS };

export interface SeedPerson {
  id: string; name: string; role: 'starter' | 'line-manager' | 'buddy' | 'delegate' | 'hr'; tags: Tags;
  offerDays?: number; startDays?: number; // relative to DEMO_T
  lineManagerId?: string; buddyId?: string; delegateId?: string;
}
const t = (jobFamily: string, role: string, grade: string, platform: string, location: string): Tags =>
  ({ jobFamily, role, grade, platform, location });
const staff = (id: string, name: string, role: SeedPerson['role'], tags: Tags): SeedPerson => ({ id, name, role, tags });

export const PERSONS: SeedPerson[] = [
  { id: 'person-a', name: 'Alex Morgan', role: 'starter', tags: t('Branch', 'Customer service colleague', 'B', 'Retail', 'Cardiff'),
    offerDays: -21, startDays: 56, lineManagerId: 'lm-priya', buddyId: 'buddy-tom' },
  { id: 'person-b', name: 'Sam Okafor', role: 'starter', tags: t('Software engineering', 'Software engineer', 'D', 'Technology', 'Leeds'),
    offerDays: -35, startDays: 5, lineManagerId: 'lm-chris', buddyId: 'buddy-jo' },
  { id: 'person-c', name: 'Dana Whitfield', role: 'starter', tags: t('Executive', 'Managing director', 'X', 'Group Functions', 'London'),
    offerDays: -14, startDays: 21, lineManagerId: 'lm-ruth', buddyId: 'buddy-mark', delegateId: 'delegate-lena' },
  staff('lm-priya', 'Priya Shah', 'line-manager', t('Branch', 'Line manager', 'D', 'Retail', 'Cardiff')),
  staff('buddy-tom', 'Tom Evans', 'buddy', t('Branch', 'Customer service colleague', 'B', 'Retail', 'Cardiff')),
  staff('lm-chris', 'Chris Lee', 'line-manager', t('Software engineering', 'Line manager', 'D', 'Technology', 'Leeds')),
  staff('buddy-jo', 'Jo Patel', 'buddy', t('Software engineering', 'Software engineer', 'C', 'Technology', 'Leeds')),
  staff('lm-ruth', 'Ruth King', 'line-manager', t('Executive', 'Managing director', 'G', 'Group Functions', 'London')),
  staff('buddy-mark', 'Mark Allen', 'buddy', t('Executive', 'Managing director', 'G', 'Group Functions', 'London')),
  staff('delegate-lena', 'Lena Brooks', 'delegate', t('Executive', 'Executive assistant', 'C', 'Group Functions', 'London')),
  { id: 'person-bob', name: 'Bob Warwick', role: 'starter', tags: t('Modern Workplace', 'Infrastructure engineer', 'E', 'Technology', 'Edinburgh'),
    offerDays: -7, startDays: 28, lineManagerId: 'lm-hannah', buddyId: 'buddy-leo' },
  staff('lm-hannah', 'Hannah Price', 'line-manager', t('Modern Workplace', 'Line manager', 'F', 'Technology', 'Edinburgh')),
  staff('buddy-leo', 'Leo Grant', 'buddy', t('Modern Workplace', 'Infrastructure engineer', 'D', 'Technology', 'Edinburgh')),
  staff('hr-partner', 'HR Partner', 'hr', { ...t('HR', '', 'D', 'Group Functions', 'Leeds'), role: undefined }),
];

// Every library Journey lives in its own file under journeys/ (config as code); all are version 1 at reset.
export const JOURNEYS: JourneyDef[] = loadJourneyFiles().map((f) => ({ ...fileToJourney(f, 1), semver: f.semver }));
const stageOf = (journeyId: string): StageId => {
  const j = JOURNEYS.find((x) => x.id === journeyId);
  if (!j) throw new Error(`Template uses ${journeyId} but journeys/${journeyId}.json is missing`);
  return j.stage;
};

// ---- Pathway templates -------------------------------------------------------------------
const LANES: StageId[] = ['pre-contract', 'pre-employment', 'onboarding', 'first-30-days'];
const dep = {
  item: (itemId: string): DependencyRef => ({ kind: 'item', itemId }),
  container: (containerId: string): DependencyRef => ({ kind: 'container', containerId }),
  timer: (timerId: string): DependencyRef => ({ kind: 'timer', timerId }),
};
type ItemSeed = [id: string, journeyId: string, mandatory: boolean, dependsOn: DependencyRef[], containerId?: string];
const startTimer = (id: string, label: string, offsetDays: number): TimerDef =>
  ({ id, label, anchor: { kind: 'start-date' }, offsetDays });

export const CONTAINER: ContainerDef = { id: 'c-cleared', label: 'Cleared to start', itemIds: ['i-payroll', 'i-checks', 'i-id'] };

export function buildItems(seeds: ItemSeed[]): PathwayItem[] {
  const rowsPerLane: Record<string, number> = {};
  return seeds.map(([id, journeyId, mandatory, dependsOn, containerId]) => {
    const lane = stageOf(journeyId);
    const row = (rowsPerLane[lane] = (rowsPerLane[lane] ?? -1) + 1);
    return { id, journeyId, journeyVersion: 1, mandatory, dependsOn, ...(containerId && { containerId }),
      lane, x: LANES.indexOf(lane) * 320, y: row * 120 };
  });
}

interface Template { id: string; title: string; tags: Tags; device: [string, string]; extraItems: ItemSeed[]; extraTimers: TimerDef[]; stops: string[] }
const TEMPLATES: Template[] = [
  { id: 'pw-branch', title: 'Branch colleague B', tags: { jobFamily: 'Branch', platform: 'Retail', grade: 'B' },
    device: ['i-device', 'j-device-branch'],
    extraItems: [
      ['i-uniform', 'j-uniform', false, [dep.item('i-contracting')]],
      ['i-induction', 'j-branch-induction', true, [dep.timer('t-day-1')]],
      ['i-cash', 'j-cash-handling', true, [dep.timer('t-day-8')]],
    ],
    extraTimers: [startTimer('t-day-1', 'Day 1', 0), startTimer('t-day-8', 'Day 8', 7)], stops: [] },
  { id: 'pw-engineer', title: 'Software engineer D', tags: { jobFamily: 'Software engineering', platform: 'Technology', grade: 'D' },
    device: ['i-device', 'j-device-dev'],
    extraItems: [['i-community', 'j-eng-community', false, [dep.timer('t-day-1')]]],
    extraTimers: [startTimer('t-day-1', 'Day 1', 0)], stops: [] },
  { id: 'pw-executive', title: 'Executive X', tags: { jobFamily: 'Executive', platform: 'Group Functions', grade: 'X' },
    device: ['i-device', 'j-device-exec'],
    extraItems: [['i-exec-welcome', 'j-exec-welcome', true, [dep.container('c-cleared')]]],
    extraTimers: [], stops: ['i-exec-welcome'] },
  // Bob's Pathway: the Privileged access request waits on ServiceNow from the day it is applied, and the Lab environment follows it.
  { id: 'pw-infra-e', title: 'Infrastructure engineer E',
    tags: { jobFamily: 'Modern Workplace', role: 'Infrastructure engineer', platform: 'Technology', grade: 'E' },
    device: ['i-device', 'j-device-dev'],
    extraItems: [
      ['i-priv-access', 'j-priv-access', true, []],
      ['i-lab', 'j-lab-env', true, [dep.item('i-priv-access'), dep.timer('t-day-1')]],
      ['i-equipment', 'j-equipment-request', true, []],
      // Onboarding Journeys wait on Day 1, first-month ones on Day 8 or Day 30: a Stage never holds work back (D8.4).
      ['i-day-one', 'j-day-one', true, [dep.timer('t-day-1')]],
      ['i-training', 'j-mandatory-training', true, [dep.timer('t-day-1')]],
      ['i-meet-team', 'j-meet-team', false, [dep.timer('t-day-1')]],
      ['i-community', 'j-eng-community', false, [dep.timer('t-day-1')]],
      ['i-oncall', 'j-change-oncall', false, [dep.timer('t-day-8')]],
      ['i-check-in-30', 'j-check-in-30', true, [dep.timer('t-pulse-30')]],
    ],
    extraTimers: [startTimer('t-day-1', 'Day 1', 0), startTimer('t-day-8', 'Day 8', 7)], stops: ['i-lab'] },
];

export function buildTemplate(tpl: Template): Omit<PathwaySnapshot, 'id' | 'version'> {
  const ci = dep.item('i-contracting');
  const items = buildItems([
    ['i-contracting', 'j-contracting', true, []],
    ['i-payroll', 'j-payroll', true, [ci], 'c-cleared'],
    ['i-checks', 'j-checks', true, [ci], 'c-cleared'],
    ['i-id', 'j-id', true, [dep.item('i-checks')], 'c-cleared'],
    [tpl.device[0], tpl.device[1], true, [ci]],
    ['i-manager-ready', 'j-manager-ready', true, [ci]],
    ['i-buddy', 'j-buddy', true, [dep.container('c-cleared')]],
    ['i-pulse-14', 'j-pulse', false, [dep.timer('t-pulse-14')]],
    ['i-pulse-30', 'j-pulse', false, [dep.timer('t-pulse-30')]],
    ...tpl.extraItems,
  ]);
  const timers: TimerDef[] = [
    { ...startTimer('t-payroll-reminder', '7 days before Start date', -7),
      reminder: { to: 'starter', aboutItemId: 'i-payroll', message: 'A quick reminder to add your bank details so we can set up your pay.' } },
    startTimer('t-deadline', '5 days before Start date', -5),
    startTimer('t-pulse-14', 'Day 14', 13), startTimer('t-pulse-30', 'Day 30', 29),
    ...tpl.extraTimers,
  ];
  const hardStops: HardStopDef[] = [
    { id: 'hs-failed', label: 'Pre-employment checks failed', trigger: { kind: 'on-failed', itemId: 'i-checks' },
      stops: { wholePathway: true, itemIds: [], containerIds: [] } },
    { id: 'hs-deadline', label: 'Pre-employment checks not done in time',
      trigger: { kind: 'on-deadline', timerId: 't-deadline', watchesItemId: 'i-checks' },
      stops: { wholePathway: false, itemIds: ['i-buddy', ...tpl.stops], containerIds: [] } },
  ];
  return { pathwayId: tpl.id, title: tpl.title, tags: tpl.tags, items, containers: [CONTAINER], timers, hardStops };
}
export { TEMPLATES };

export const HR_ADDER = { personId: 'hr-partner', name: 'HR Partner', addedOn: DEMO_T };
export const PERSON_A_ADDITIONS = {
  timers: [{ id: 't-delay', label: '30 days after Offer accepted', anchor: { kind: 'offer-accepted' }, offsetDays: 30 }] as TimerDef[],
  items: [
    { ...buildItems([['i-start-delay', 'j-start-delay', false, [dep.timer('t-delay')]]])[0]!, y: 840, addedBy: HR_ADDER },
    { ...buildItems([['i-events', 'j-events', false, [dep.timer('t-day-1')]]])[0]!, y: 840, addedBy: HR_ADDER },
  ],
};
