// Branch colleague Pathway, modelled on SEED-DATA.md section 4. Synthetic data only.
import type {
  ActionDef, ActionProgress, EngineInput, JourneyDef, PathwayItem, StageId, TimerDef,
} from '../types';

export const T = '2026-11-10';
export const OFFER = '2026-10-20'; // T - 21
export const START = '2027-01-05'; // T + 56, Day 1

const journey = (id: string, title: string, stage: StageId, actions: ActionDef[], extra: Partial<JourneyDef> = {}): JourneyDef =>
  ({ id, version: 1, title, description: title, ownerTeam: 'HR', stage, tags: {}, actions, declaresOutcome: false, ...extra });

const list: JourneyDef[] = [
  journey('j-contracting', 'Contracting', 'pre-contract', [
    { id: 'a-offer', type: 'read', label: 'Read your offer' },
    { id: 'a-sign', type: 'provide', label: 'Sign your contract' },
  ]),
  journey('j-payroll', 'Payroll', 'pre-employment', [
    { id: 'a-bank', type: 'provide', label: 'Provide your bank details', starterOnly: true },
  ]),
  journey('j-checks', 'Pre-employment checks', 'pre-employment', [
    { id: 'a-rtw', type: 'provide', label: 'Provide right to work and proof of address', starterOnly: true },
    { id: 'a-vetting', type: 'automation', label: 'Vetting check', setsOutcome: true },
  ], { declaresOutcome: true, whileYouWait: 'Your checks are with our vetting partner.' }),
  journey('j-id', 'ID creation', 'pre-employment', [
    { id: 'a-photo', type: 'provide', label: 'Provide a photo' },
    { id: 'a-badge', type: 'automation', label: 'Badge request' },
  ]),
  journey('j-device', 'Branch device', 'pre-employment', [
    { id: 'a-device', type: 'choose', label: 'Choose your device', options: ['Tablet', 'Laptop'] },
    { id: 'a-order', type: 'automation', label: 'Order device' },
  ]),
  journey('j-manager', 'Manager ready', 'pre-employment', [
    { id: 'a-goals', type: 'task', label: 'Set 3-month goals', owner: 'line-manager' },
    { id: 'a-pack', type: 'automation', label: 'Send welcome pack' },
    { id: 'a-pack-note', type: 'notification', label: 'Your welcome pack is on its way', owner: 'starter' },
  ]),
  journey('j-buddy', 'Meet your buddy', 'pre-employment', [
    { id: 'a-buddy-note', type: 'notification', label: 'You are buddying a new starter', owner: 'buddy' },
    { id: 'a-hello', type: 'task', label: 'Send a hello note', owner: 'buddy' },
  ]),
  journey('j-pulse', 'Pulse check', 'first-30-days', [
    { id: 'a-pulse-read', type: 'read', label: 'Two quick questions' },
    { id: 'a-connection', type: 'choose', label: 'How connected do you feel to your team?',
      options: ['1', '2', '3', '4', '5'], flagAtOrBelow: 2, starterOnly: true },
    { id: 'a-confidence', type: 'choose', label: 'How confident do you feel in your role?',
      options: ['1', '2', '3', '4', '5'], flagAtOrBelow: 2, starterOnly: true },
  ]),
  journey('j-uniform', 'Uniform', 'pre-employment', [
    { id: 'a-size', type: 'choose', label: 'Choose your size', options: ['S', 'M', 'L'] },
    { id: 'a-uniform-order', type: 'automation', label: 'Order uniform' },
  ]),
  journey('j-induction', 'Branch induction', 'onboarding', [
    { id: 'a-induction-read', type: 'read', label: 'Your first week' },
    { id: 'a-shadow', type: 'task', label: 'Shadow a shift' },
  ]),
  journey('j-cash', 'Cash-handling training', 'first-30-days', [
    { id: 'a-cash-read', type: 'read', label: 'About cash handling' },
    { id: 'a-elearning', type: 'task', label: 'Complete the e-learning' },
  ]),
];

const item = (id: string, journeyId: string, dependsOn: PathwayItem['dependsOn'] = [], extra: Partial<PathwayItem> = {}): PathwayItem =>
  ({ id, journeyId, journeyVersion: 1, mandatory: true, dependsOn, lane: 'pre-employment', x: 0, y: 0, ...extra });
const afterContracting = [{ kind: 'item', itemId: 'i-contracting' }] as const;

const startTimer = (id: string, offsetDays: number, extra: Partial<TimerDef> = {}): TimerDef =>
  ({ id, label: id, anchor: { kind: 'start-date' }, offsetDays, ...extra });

export function branchInput(patch: Partial<EngineInput> = {}): EngineInput {
  return {
    today: T,
    person: { id: 'p-alex', name: 'Alex Morgan', tags: {}, offerAcceptedDate: OFFER, startDate: START },
    pathway: {
      id: 'ps-branch-1', pathwayId: 'pw-branch', version: 1, title: 'Branch colleague', tags: {},
      items: [
        item('i-contracting', 'j-contracting', [], { lane: 'pre-contract' }),
        item('i-payroll', 'j-payroll', [...afterContracting], { containerId: 'c-cleared' }),
        item('i-checks', 'j-checks', [...afterContracting], { containerId: 'c-cleared' }),
        item('i-id', 'j-id', [{ kind: 'item', itemId: 'i-checks' }], { containerId: 'c-cleared' }),
        item('i-device', 'j-device', [...afterContracting]),
        item('i-manager', 'j-manager', [...afterContracting]),
        item('i-buddy', 'j-buddy', [{ kind: 'container', containerId: 'c-cleared' }]),
        item('i-pulse-14', 'j-pulse', [{ kind: 'timer', timerId: 't-day14' }], { mandatory: false, lane: 'first-30-days' }),
        item('i-pulse-30', 'j-pulse', [{ kind: 'timer', timerId: 't-day30' }], { mandatory: false, lane: 'first-30-days' }),
        item('i-uniform', 'j-uniform', [...afterContracting], { mandatory: false }),
        item('i-induction', 'j-induction', [{ kind: 'timer', timerId: 't-day1' }], { lane: 'onboarding' }),
        item('i-cash', 'j-cash', [{ kind: 'timer', timerId: 't-day8' }], { lane: 'first-30-days' }),
      ],
      containers: [{ id: 'c-cleared', label: 'Cleared to start', itemIds: ['i-payroll', 'i-checks', 'i-id'] }],
      timers: [
        startTimer('t-payroll-reminder', -7, { reminder: { to: 'starter', aboutItemId: 'i-payroll', message: 'Add your bank details' } }),
        startTimer('t-checks-deadline', -5, { label: '5 days before Start date' }),
        startTimer('t-day1', 0), startTimer('t-day8', 7), startTimer('t-day14', 13), startTimer('t-day30', 29),
      ],
      hardStops: [
        { id: 'hs-checks-failed', label: 'Pre-employment checks failed', trigger: { kind: 'on-failed', itemId: 'i-checks' },
          stops: { wholePathway: true, itemIds: [], containerIds: [] } },
        { id: 'hs-checks-deadline', label: 'Checks not back in time',
          trigger: { kind: 'on-deadline', timerId: 't-checks-deadline', watchesItemId: 'i-checks' },
          stops: { wholePathway: false, itemIds: ['i-buddy'], containerIds: [] } },
      ],
    },
    journeys: Object.fromEntries(list.map((j) => [`${j.id}@${j.version}`, j])),
    progress: [], overrides: [], hardStopDecisions: [], history: [],
    ...patch,
  };
}

export const done = (itemId: string, actionId: string, doneAt: string, extra: Partial<ActionProgress> = {}): ActionProgress =>
  ({ itemId, actionId, state: 'done', doneAt, ...extra });

/** Contracting done on 2026-10-22. */
export const contracted: ActionProgress[] = [
  done('i-contracting', 'a-offer', '2026-10-21'),
  done('i-contracting', 'a-sign', '2026-10-22'),
];

/** Everything in "Cleared to start" done by 2026-11-05. */
export const cleared: ActionProgress[] = [
  ...contracted,
  done('i-payroll', 'a-bank', '2026-10-23'),
  done('i-checks', 'a-rtw', '2026-10-23'),
  done('i-checks', 'a-vetting', '2026-11-01', { automationResult: 'passed' }),
  done('i-id', 'a-photo', '2026-11-02'),
  done('i-id', 'a-badge', '2026-11-05'),
];

export const checksFailed: ActionProgress[] = [
  ...contracted,
  done('i-checks', 'a-rtw', '2026-10-23'),
  done('i-checks', 'a-vetting', '2026-11-03', { automationResult: 'failed' }),
];
