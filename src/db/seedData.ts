// Synthetic data from SEED-DATA.md. Every name, place and date here is invented.
import type {
  ActionDef, ActorRole, ContainerDef, DependencyRef, HardStopDef, JourneyDef, PathwayItem, PathwaySnapshot,
  StageId, Tags, TimerDef,
} from '../engine/types';

export const DEMO_T = '2026-11-10';

export const TAG_LISTS = {
  jobFamily: ['Branch', 'Software engineering', 'Executive', 'HR', 'IT'],
  role: ['Customer service colleague', 'Software engineer', 'Managing director', 'Executive assistant', 'Line manager'],
  grade: ['Colleague', 'Manager', 'Senior manager', 'Executive'],
  platform: ['Retail', 'Technology', 'Group Functions'],
  location: ['Cardiff', 'Leeds', 'London', 'Edinburgh'],
};

export interface SeedPerson {
  id: string; name: string; role: 'starter' | 'line-manager' | 'buddy' | 'delegate' | 'hr'; tags: Tags;
  offerDays?: number; startDays?: number; // relative to DEMO_T
  lineManagerId?: string; buddyId?: string; delegateId?: string;
}
const t = (jobFamily: string, role: string, grade: string, platform: string, location: string): Tags =>
  ({ jobFamily, role, grade, platform, location });
const staff = (id: string, name: string, role: SeedPerson['role'], tags: Tags): SeedPerson => ({ id, name, role, tags });

export const PERSONS: SeedPerson[] = [
  { id: 'person-a', name: 'Alex Morgan', role: 'starter', tags: t('Branch', 'Customer service colleague', 'Colleague', 'Retail', 'Cardiff'),
    offerDays: -21, startDays: 56, lineManagerId: 'lm-priya', buddyId: 'buddy-tom' },
  { id: 'person-b', name: 'Sam Okafor', role: 'starter', tags: t('Software engineering', 'Software engineer', 'Colleague', 'Technology', 'Leeds'),
    offerDays: -35, startDays: 5, lineManagerId: 'lm-chris', buddyId: 'buddy-jo' },
  { id: 'person-c', name: 'Dana Whitfield', role: 'starter', tags: t('Executive', 'Managing director', 'Executive', 'Group Functions', 'London'),
    offerDays: -14, startDays: 21, lineManagerId: 'lm-ruth', buddyId: 'buddy-mark', delegateId: 'delegate-lena' },
  staff('lm-priya', 'Priya Shah', 'line-manager', t('Branch', 'Line manager', 'Manager', 'Retail', 'Cardiff')),
  staff('buddy-tom', 'Tom Evans', 'buddy', t('Branch', 'Customer service colleague', 'Colleague', 'Retail', 'Cardiff')),
  staff('lm-chris', 'Chris Lee', 'line-manager', t('Software engineering', 'Line manager', 'Manager', 'Technology', 'Leeds')),
  staff('buddy-jo', 'Jo Patel', 'buddy', t('Software engineering', 'Software engineer', 'Colleague', 'Technology', 'Leeds')),
  staff('lm-ruth', 'Ruth King', 'line-manager', t('Executive', 'Managing director', 'Executive', 'Group Functions', 'London')),
  staff('buddy-mark', 'Mark Allen', 'buddy', t('Executive', 'Managing director', 'Executive', 'Group Functions', 'London')),
  staff('delegate-lena', 'Lena Brooks', 'delegate', t('Executive', 'Executive assistant', 'Colleague', 'Group Functions', 'London')),
  staff('hr-partner', 'HR Partner', 'hr', { ...t('HR', '', 'Manager', 'Group Functions', 'Leeds'), role: undefined }),
];

type A = Omit<ActionDef, 'id'>;
const read = (label: string): A => ({ type: 'read', label });
const provide = (label: string, starterOnly = false): A => ({ type: 'provide', label, owner: 'starter', ...(starterOnly && { starterOnly }) });
const auto = (label: string, setsOutcome = false): A => ({ type: 'automation', label, ...(setsOutcome && { setsOutcome }) });
const notify = (label: string, owner: ActorRole): A => ({ type: 'notification', label, owner });
const task = (label: string, owner: ActorRole): A => ({ type: 'task', label, owner });
const choose = (label: string, options: string[], flagAtOrBelow?: number, starterOnly = false): A =>
  ({ type: 'choose', label, owner: 'starter', options, ...(flagAtOrBelow !== undefined && { flagAtOrBelow }), ...(starterOnly && { starterOnly }) });
const scale = ['1', '2', '3', '4', '5'];

const WAIT = 'Your checks are with our vetting partner. Most take three to five weeks, so there is nothing you need to do right now.';

type JourneySeed = [id: string, title: string, ownerTeam: string, stage: StageId, tags: Tags, description: string, actions: A[], extra?: Partial<JourneyDef>];
const JOURNEY_SEEDS: JourneySeed[] = [
  ['j-contracting', 'Contracting', 'HR', 'pre-contract', {}, 'Read and sign your contract.', [read('Read your offer'), provide('Sign your contract')]],
  ['j-payroll', 'Payroll', 'HR', 'pre-employment', {}, 'Give us the details we need to pay you.', [provide('Provide your bank details', true)]],
  ['j-checks', 'Pre-employment checks', 'HR', 'pre-employment', {}, 'Right to work, proof of address and vetting.',
    [provide('Provide your right to work and proof of address', true), auto('Vetting check', true)], { whileYouWait: WAIT, declaresOutcome: true }],
  ['j-id', 'ID creation (photo)', 'Security', 'pre-employment', {}, 'Your photo for your building pass.', [provide('Provide your photo'), auto('Badge request')]],
  ['j-manager-ready', 'Manager ready', 'HR', 'pre-employment', {}, 'Your Line Manager gets ready for you.',
    [task('Set three-month goals', 'line-manager'), auto('Send welcome pack'), notify('Your Line Manager is ready for you', 'starter')]],
  ['j-buddy', 'Meet your buddy', 'HR', 'pre-employment', {}, 'Say hello to your buddy.',
    [notify('You have a new starter to welcome', 'buddy'), task('Send a hello note', 'buddy')]],
  ['j-pulse', 'Pulse check', 'HR', 'first-30-days', {}, 'A quick check on how it is going.',
    [read('A quick check-in'), choose('How connected do you feel? (1 to 5)', scale, 2, true), choose('How confident do you feel? (1 to 5)', scale, 2, true)]],
  ['j-device-branch', 'Branch device', 'IT', 'pre-employment', { jobFamily: 'Branch' }, 'Choose and receive your device.',
    [choose('Choose your device', ['Branch tablet', 'Branch laptop']), auto('Order to your address from the system of record')]],
  ['j-device-dev', 'Developer device', 'IT', 'pre-employment', { jobFamily: 'Software engineering' }, 'Choose and receive your high-spec device.',
    [choose('Choose your high-spec device', ['Laptop 16 inch', 'Laptop 14 inch']), auto('Order your device')]],
  ['j-device-exec', 'Executive device', 'IT', 'pre-employment', { jobFamily: 'Executive' }, 'Choose and receive your device.',
    [choose('Choose your device', ['Ultralight laptop', 'Tablet and keyboard']), auto('Order your device')]],
  ['j-uniform', 'Uniform (Merch distribution)', 'Retail', 'pre-employment', { platform: 'Retail' }, 'Choose your uniform size.',
    [choose('Choose your size', ['S', 'M', 'L', 'XL']), auto('Order to your address from the system of record')]],
  ['j-branch-induction', 'Branch induction', 'Retail', 'onboarding', { platform: 'Retail' }, 'Your first week in the branch.',
    [read('Your first week'), task('Shadow shift', 'starter'), task('Week-one 1:1', 'line-manager')]],
  ['j-cash-handling', 'Cash-handling training', 'Retail', 'first-30-days', { platform: 'Retail' }, 'Learn to handle cash safely.',
    [read('Cash-handling guide'), task('Complete the e-learning', 'starter')]],
  ['j-eng-community', 'Engineering community intro', 'Technology', 'onboarding', { platform: 'Technology' }, 'Meet the engineering community.',
    [read('About the guilds'), task('Join the guild channel', 'starter')]],
  ['j-payments-access', 'Payments squad access package', 'Technology', 'pre-employment', { platform: 'Technology' }, 'Access to the Payments squad systems.',
    [auto('Network account'), auto('Access package')]],
  ['j-exec-welcome', 'Welcome from sponsoring exec', 'Executive office', 'onboarding', { jobFamily: 'Executive' }, 'A welcome from your sponsoring executive.',
    [notify('A welcome from your sponsoring executive', 'starter'), task('Book the sponsor meeting', 'hr')]],
  ['j-start-delay', 'Start delay engagement', 'HR', 'pre-employment', {}, 'Staying in touch while you wait.',
    [read('What is happening while you wait'), notify('Say hello to your new starter', 'line-manager')]],
  ['j-events', 'In-person events calendar', 'HR', 'onboarding', {}, 'Events near you.',
    [read('Events near you'), choose('Choose an event to attend', ['Welcome coffee morning', 'Team lunch', 'Open evening'])]],
];

export const JOURNEYS: JourneyDef[] = JOURNEY_SEEDS.map(([id, title, ownerTeam, stage, tags, description, acts, extra]) => ({
  id, version: 1, title, description, ownerTeam, stage, tags, declaresOutcome: false, ...extra,
  actions: acts.map((a, i) => ({ id: `${id}-a${i + 1}`, ...a })),
}));
const stageOf = (journeyId: string): StageId => JOURNEYS.find((j) => j.id === journeyId)!.stage;

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
  { id: 'pw-branch', title: 'Branch colleague', tags: { jobFamily: 'Branch', platform: 'Retail', grade: 'Colleague' },
    device: ['i-device', 'j-device-branch'],
    extraItems: [
      ['i-uniform', 'j-uniform', false, [dep.item('i-contracting')]],
      ['i-induction', 'j-branch-induction', true, [dep.timer('t-day-1')]],
      ['i-cash', 'j-cash-handling', true, [dep.timer('t-day-8')]],
    ],
    extraTimers: [startTimer('t-day-1', 'Day 1', 0), startTimer('t-day-8', 'Day 8', 7)], stops: [] },
  { id: 'pw-engineer', title: 'Software engineer', tags: { jobFamily: 'Software engineering', platform: 'Technology', grade: 'Colleague' },
    device: ['i-device', 'j-device-dev'],
    extraItems: [['i-community', 'j-eng-community', false, [dep.timer('t-day-1')]]],
    extraTimers: [startTimer('t-day-1', 'Day 1', 0)], stops: [] },
  { id: 'pw-executive', title: 'Executive', tags: { jobFamily: 'Executive', platform: 'Group Functions', grade: 'Executive' },
    device: ['i-device', 'j-device-exec'],
    extraItems: [['i-exec-welcome', 'j-exec-welcome', true, [dep.container('c-cleared')]]],
    extraTimers: [], stops: ['i-exec-welcome'] },
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

export const HR_ADDER = { personId: 'hr-partner', name: 'HR Partner' };
export const PERSON_A_ADDITIONS = {
  timers: [{ id: 't-delay', label: '30 days after Offer accepted', anchor: { kind: 'offer-accepted' }, offsetDays: 30 }] as TimerDef[],
  items: [
    { ...buildItems([['i-start-delay', 'j-start-delay', false, [dep.timer('t-delay')]]])[0]!, y: 840, addedBy: HR_ADDER },
    { ...buildItems([['i-events', 'j-events', false, [dep.timer('t-day-1')]]])[0]!, y: 840, addedBy: HR_ADDER },
  ],
};
