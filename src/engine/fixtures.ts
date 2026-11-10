import type { EngineState, ItemState } from './types';

const base = { mandatory: true, available: false, blockedFlag: false, overdue: false, unmetDependencies: [] };

const items: ItemState[] = [
  { ...base, itemId: 'i-contracting', journeyId: 'j-contracting', title: 'Contracting', stage: 'pre-employment',
    status: 'done', available: true, availableSince: '2026-10-20', doneAt: '2026-10-24', outcome: 'done' },
  { ...base, itemId: 'i-payroll', journeyId: 'j-payroll', title: 'Payroll', stage: 'pre-employment',
    status: 'action-required', available: true, availableSince: '2026-10-24',
    currentAction: { id: 'a-bank', type: 'provide', label: 'Provide your bank details', owner: 'starter', starterOnly: true } },
  { ...base, itemId: 'i-checks', journeyId: 'j-checks', title: 'Pre-employment checks', stage: 'pre-employment',
    status: 'in-progress', available: true, availableSince: '2026-10-23', blockedFlag: true, waitingDays: 18,
    usualRange: [21, 35],
    currentAction: { id: 'a-vetting', type: 'automation', label: 'Vetting check', setsOutcome: true },
    whileYouWait: 'Your checks are with our vetting partner. Most take three to five weeks, so there is nothing you need to do right now.' },
  { ...base, itemId: 'i-id', journeyId: 'j-id', title: 'ID creation', stage: 'pre-employment',
    status: 'not-started', unmetDependencies: [{ kind: 'item', itemId: 'i-checks' }] },
  { ...base, itemId: 'i-uniform', journeyId: 'j-uniform', title: 'Uniform', stage: 'pre-employment',
    mandatory: false, status: 'skipped', available: true, availableSince: '2026-10-24' },
  { ...base, itemId: 'i-buddy', journeyId: 'j-buddy', title: 'Meet your buddy', stage: 'pre-employment',
    status: 'cancelled', unmetDependencies: [{ kind: 'container', containerId: 'c-cleared' }] },
  { ...base, itemId: 'i-pulse', journeyId: 'j-pulse', title: 'Pulse check', stage: 'first-30-days',
    mandatory: false, status: 'not-started', unmetDependencies: [{ kind: 'timer', timerId: 't-pulse-14' }] },
];

/** Persona A (Alex Morgan) mid-story. Synthetic data only. */
export const demoState: EngineState = {
  today: '2026-11-10',
  stage: 'pre-employment',
  personStatus: 'joiner',
  dayNumber: -55,
  items,
  containers: [{
    containerId: 'c-cleared', label: 'Cleared to start', complete: false,
    doneCount: 0, mandatoryCount: 3, remainingItemIds: ['i-payroll', 'i-checks', 'i-id'],
  }],
  timers: [{ timerId: 't-pulse-14', firesOn: '2027-01-18', fired: false }],
  needsDecisions: [],
  tasks: [{
    itemId: 'i-checks', actionId: 'a-vetting', label: 'Chase the vetting check',
    owner: 'hr', personId: 'p-alex', starterName: 'Alex Morgan', raisedOn: '2026-11-10',
  }],
  notifications: [],
  nextUp: { itemId: 'i-payroll', line: 'Next: add your bank details so we can set up your pay.' },
};
