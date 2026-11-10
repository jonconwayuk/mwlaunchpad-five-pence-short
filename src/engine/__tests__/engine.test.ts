import { describe, expect, it } from 'vitest';
import { computeState, resolveTimerDate } from '..';
import type { EngineInput, TimerDef } from '../types';
import { START, T, branchInput, checksFailed, cleared, contracted, done } from './fixtures';

const itemOf = (input: EngineInput, id: string) => {
  const found = computeState(input).items.find((i) => i.itemId === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};
const timer = (input: EngineInput, id: string): TimerDef => {
  const found = input.pathway.timers.find((t) => t.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

describe('availability and Journey Status (rules 1 and 2)', () => {
  it('Pathway Item, when a Dependency is unmet, is not-started', () => {
    const payroll = itemOf(branchInput(), 'i-payroll');
    expect(payroll.status).toBe('not-started');
    expect(payroll.available).toBe(false);
    expect(payroll.unmetDependencies).toEqual([{ kind: 'item', itemId: 'i-contracting' }]);
  });

  it("Pathway Item, when its current Action is the starter's, is action-required", () => {
    const payroll = itemOf(branchInput({ progress: contracted }), 'i-payroll');
    expect(payroll.status).toBe('action-required');
    expect(payroll.currentAction?.id).toBe('a-bank');
    expect(payroll.availableSince).toBe('2026-10-22');
  });

  it('an item with no Dependencies, when applied after Offer accepted, is available from the apply date', () => {
    const contracting = itemOf(branchInput({ appliedOn: '2026-11-05' }), 'i-contracting');
    expect(contracting.availableSince).toBe('2026-11-05');
    expect(contracting.waitingDays).toBe(5);
  });

  it('Pathway Item, when on a Hidden automation, is in-progress with the Blocked Flag raised', () => {
    const progress = [...contracted, done('i-checks', 'a-rtw', '2026-10-23')];
    const checks = itemOf(branchInput({ progress }), 'i-checks');
    expect(checks.status).toBe('in-progress');
    expect(checks.blockedFlag).toBe(true);
    expect(checks.whileYouWait).toBe('Your checks are with our vetting partner.');
  });

  it('Pathway Item, when every Action is done, is done on the last Action date', () => {
    const contracting = itemOf(branchInput({ progress: contracted }), 'i-contracting');
    expect(contracting).toMatchObject({ status: 'done', doneAt: '2026-10-22', outcome: 'done' });
  });

  it('Hidden automation without an Outcome, when Returned, is finished and the Journey moves on (D3)', () => {
    const progress = [...contracted, done('i-checks', 'a-rtw', '2026-10-23'),
      done('i-checks', 'a-vetting', '2026-11-01', { automationResult: 'passed' }),
      done('i-id', 'a-photo', '2026-11-02'), done('i-id', 'a-badge', '2026-11-04', { automationResult: 'returned' })];
    expect(itemOf(branchInput({ progress }), 'i-id')).toMatchObject({ status: 'done', doneAt: '2026-11-04', outcome: 'done' });
  });

  it('Pathway Item, when its Dependency ended with a Failed Outcome, stays not-started (Hard Stop pending)', () => {
    const progress = [...contracted, done('i-checks', 'a-rtw', '2026-10-23'),
      done('i-checks', 'a-vetting', '2026-11-03', { automationResult: 'failed' })];
    const state = computeState(branchInput({ progress }));
    expect(state.items.find((i) => i.itemId === 'i-id')?.status).toBe('not-started');
    expect(state.containers[0]?.complete).toBe(false);
    expect(state.items.find((i) => i.itemId === 'i-checks')?.whileYouWait).toBeDefined();
  });

  it('Pathway Item, when overridden as skipped, is skipped and holds nothing up', () => {
    const input = branchInput({ progress: contracted, overrides: [{ itemId: 'i-uniform', status: 'skipped', at: T }] });
    expect(itemOf(input, 'i-uniform')).toMatchObject({ status: 'skipped', outcome: 'skipped' });
  });

  it('Pathway Item, when its Journey is missing, throws an Error', () => {
    const input = branchInput();
    input.pathway.items[0] = { ...input.pathway.items[0], journeyId: 'j-missing' };
    expect(() => computeState(input)).toThrow(Error);
  });
});

describe('Containers (rule 3)', () => {
  const withOptionalInside = (progress = cleared) => {
    const input = branchInput({ progress });
    input.pathway.containers[0].itemIds.push('i-uniform');
    return input;
  };

  it('Container, when only an optional item is pending, is complete and unlocks its dependents', () => {
    const state = computeState(withOptionalInside());
    expect(state.containers[0]).toMatchObject({ complete: true, doneCount: 3, mandatoryCount: 3, remainingItemIds: [] });
    expect(state.items.find((i) => i.itemId === 'i-buddy')?.available).toBe(true);
  });

  it('Container, when a mandatory item is pending, is not complete', () => {
    const state = computeState(withOptionalInside(cleared.filter((p) => p.itemId !== 'i-id')));
    expect(state.containers[0]).toMatchObject({ complete: false, doneCount: 2, remainingItemIds: ['i-id'] });
    expect(state.items.find((i) => i.itemId === 'i-buddy')?.status).toBe('not-started');
  });
});

describe('Timers and Reminders (rule 4)', () => {
  it('Timer, at minus 7 days against the Start date, fires on 2026-12-29', () => {
    const input = branchInput();
    expect(resolveTimerDate(timer(input, 't-payroll-reminder'), input)).toBe('2026-12-29');
    const firedOn = (today: string) =>
      computeState({ ...input, today }).timers.find((t) => t.timerId === 't-payroll-reminder')?.fired;
    expect(firedOn('2026-12-28')).toBe(false);
    expect(firedOn('2026-12-29')).toBe(true);
  });

  it('Timer, when anchored to an item that moves, moves with it', () => {
    const anchored: TimerDef = { id: 't-x', label: 'x', anchor: { kind: 'item-done', itemId: 'i-contracting' }, offsetDays: 3 };
    expect(resolveTimerDate(anchored, branchInput({ progress: contracted }))).toBe('2026-10-25');
    const later = [done('i-contracting', 'a-offer', '2026-10-21'), done('i-contracting', 'a-sign', '2026-10-30')];
    expect(resolveTimerDate(anchored, branchInput({ progress: later }))).toBe('2026-11-02');
    expect(resolveTimerDate(anchored, branchInput())).toBeUndefined();
  });

  it('Reminder, when its item is already done, is not raised', () => {
    const state = computeState(branchInput({ today: '2026-12-30', progress: cleared }));
    expect(state.notifications.filter((n) => n.message === 'Add your bank details')).toEqual([]);
  });

  it('Reminder, when its item is still pending, is raised on the Timer date', () => {
    const state = computeState(branchInput({ today: '2026-12-30', progress: contracted }));
    expect(state.notifications).toContainEqual({ to: 'starter', message: 'Add your bank details', sentOn: '2026-12-29' });
  });

  it('Pathway Item, when its Timer has fired, becomes available on the Timer date', () => {
    const induction = itemOf(branchInput({ today: START, progress: cleared }), 'i-induction');
    expect(induction).toMatchObject({ available: true, availableSince: START, status: 'action-required' });
  });
});

describe('Hard Stops (rule 5)', () => {
  it('Failed Outcome, for Journey Duration, counts as done', () => {
    const state = computeState(branchInput({ progress: checksFailed }));
    const checks = state.items.find((i) => i.itemId === 'i-checks');
    expect(checks).toMatchObject({ status: 'done', outcome: 'failed', doneAt: '2026-11-03', waitingDays: 12, overdue: false });
  });

  it('Hard Stop, when unconfirmed, raises a Needs decision and changes nothing', () => {
    const state = computeState(branchInput({ progress: checksFailed }));
    expect(state.needsDecisions).toEqual([expect.objectContaining({
      hardStopId: 'hs-checks-failed', wholePathway: true, raisedOn: '2026-11-03', extendAllowed: false,
    })]);
    expect(state.items.find((i) => i.itemId === 'i-payroll')?.status).toBe('action-required');
    expect(state.items.some((i) => i.status === 'cancelled')).toBe(false);
  });

  it('Hard Stop, when confirmed, cancels its targets and unlocks nothing downstream', () => {
    const state = computeState(branchInput({ progress: checksFailed,
      hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision: 'confirm', reason: 'Vetting failed', at: T }] }));
    const byId = Object.fromEntries(state.items.map((i) => [i.itemId, i.status]));
    expect(byId['i-contracting']).toBe('done');
    expect(byId['i-checks']).toBe('done');
    expect(byId['i-payroll']).toBe('cancelled');
    expect(byId['i-buddy']).toBe('cancelled');
    expect(state.items.filter((i) => i.status === 'action-required' || i.status === 'in-progress')).toEqual([]);
    expect(state.containers[0].complete).toBe(false);
    expect(state.needsDecisions).toEqual([]);
    expect(state.nextUp).toBeUndefined();
  });

  it('Hard Stop, when dismissed, raises nothing and the Pathway proceeds', () => {
    const state = computeState(branchInput({ progress: checksFailed,
      hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision: 'dismiss', reason: 'Retest booked', at: T }] }));
    expect(state.needsDecisions).toEqual([]);
    expect(state.items.find((i) => i.itemId === 'i-payroll')?.status).toBe('action-required');
  });

  it('Pathway Item, when its failed Dependency\'s Hard Stop is Dismissed, becomes available', () => {
    const input = branchInput({ progress: checksFailed,
      hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision: 'dismiss', reason: 'Retest booked', at: T }] });
    expect(itemOf(input, 'i-id')).toMatchObject({ available: true, status: 'action-required' });
  });

  it('Container, when every other mandatory item is done and one is Failed with its Hard Stop pending, is not complete', () => {
    const input = branchInput({ progress: [...checksFailed, done('i-payroll', 'a-bank', '2026-10-23')] });
    input.pathway.containers[0].itemIds = ['i-payroll', 'i-checks'];
    const state = computeState(input);
    expect(state.containers[0]).toMatchObject({ complete: false, doneCount: 1, remainingItemIds: ['i-checks'] });
    expect(state.items.find((i) => i.itemId === 'i-buddy')?.status).toBe('not-started');
  });

  it('Container, when its Failed item\'s Hard Stop is Dismissed, completes and unlocks its dependents', () => {
    const input = branchInput({ progress: [...checksFailed, done('i-payroll', 'a-bank', '2026-10-23')],
      hardStopDecisions: [{ hardStopId: 'hs-checks-failed', decision: 'dismiss', reason: 'Retest booked', at: T }] });
    input.pathway.containers[0].itemIds = ['i-payroll', 'i-checks'];
    const state = computeState(input);
    expect(state.containers[0]).toMatchObject({ complete: true, doneCount: 2, remainingItemIds: [] });
    expect(state.items.find((i) => i.itemId === 'i-buddy')?.available).toBe(true);
  });

  it('Hard Stop on deadline, when the watched item is not done, raises a Needs decision with Extend allowed', () => {
    const state = computeState(branchInput({ today: '2026-12-31', progress: contracted }));
    expect(state.needsDecisions).toEqual([expect.objectContaining({
      hardStopId: 'hs-checks-deadline', stopsItemIds: ['i-buddy'], raisedOn: '2026-12-31', extendAllowed: true,
    })]);
  });

  it('Extend, on a deadline Hard Stop, moves the deadline Timer by 7 days', () => {
    const input = branchInput({ today: '2026-12-31', progress: contracted,
      hardStopDecisions: [{ hardStopId: 'hs-checks-deadline', decision: 'extend', at: '2026-12-31' }] });
    expect(resolveTimerDate(timer(input, 't-checks-deadline'), input)).toBe('2027-01-07');
    expect(computeState(input).needsDecisions).toEqual([]);
  });
});

describe('Stages (rules 6 and 9)', () => {
  it('Stage, for an item with no unmet Dependencies, does not hold it back', () => {
    const input = branchInput({ progress: contracted });
    const cash = input.pathway.items.findIndex((i) => i.id === 'i-cash');
    input.pathway.items[cash] = { ...input.pathway.items[cash], dependsOn: [] };
    const state = computeState(input);
    expect(state.stage).toBe('pre-employment');
    expect(state.items[cash]).toMatchObject({ stage: 'first-30-days', available: true, status: 'action-required' });
  });

  it('current Stage, before and after Contracting and across Day 1 and Day 8, follows the D8 table', () => {
    const stageAt = (today: string, progress = cleared) => computeState(branchInput({ today, progress })).stage;
    expect(stageAt(T, [])).toBe('pre-contract');
    expect(stageAt(T)).toBe('pre-employment');
    expect(stageAt('2027-01-05')).toBe('onboarding');
    expect(stageAt('2027-01-11')).toBe('onboarding');
    expect(stageAt('2027-01-12')).toBe('first-30-days');
  });
});

describe('Journey Duration and Usual Range (rule 7)', () => {
  const history = [10, 20, 30, 40, 50].map((days) => ({ journeyId: 'j-checks', journeyVersion: 1, days }));
  const waiting = [...contracted, done('i-checks', 'a-rtw', '2026-10-23')];

  it('Usual Range, from history, is the interquartile range', () => {
    expect(itemOf(branchInput({ progress: waiting, history }), 'i-checks').usualRange).toEqual([20, 40]);
  });

  it('wait, within the Usual Range, is not overdue and raises no Task', () => {
    const state = computeState(branchInput({ today: '2026-11-30', progress: waiting, history }));
    expect(state.items.find((i) => i.itemId === 'i-checks')).toMatchObject({ waitingDays: 39, overdue: false });
    expect(state.tasks.filter((t) => t.itemId === 'i-checks')).toEqual([]);
  });

  it('wait, past the top of the Usual Range, is overdue and raises a Line Manager Task', () => {
    const state = computeState(branchInput({ today: '2026-12-02', progress: waiting, history }));
    expect(state.items.find((i) => i.itemId === 'i-checks')).toMatchObject({ waitingDays: 41, overdue: true });
    expect(state.tasks).toContainEqual(expect.objectContaining({
      itemId: 'i-checks', owner: 'line-manager', personId: 'p-alex', starterName: 'Alex Morgan', raisedOn: '2026-12-02',
    }));
  });
});

describe('Tasks, notifications and nextUp', () => {
  const pulseDay14 = '2027-01-18';
  const answered = (score: number) => [...cleared,
    done('i-pulse-14', 'a-pulse-read', pulseDay14),
    done('i-pulse-14', 'a-connection', pulseDay14, { value: score })];

  it('Choose answer, at or below flagAtOrBelow, raises a Line Manager Task', () => {
    const state = computeState(branchInput({ today: pulseDay14, progress: answered(2) }));
    expect(state.tasks).toContainEqual(expect.objectContaining({
      itemId: 'i-pulse-14', actionId: 'a-connection', owner: 'line-manager', raisedOn: pulseDay14,
    }));
  });

  it('Choose answer, above flagAtOrBelow, raises no Task', () => {
    const state = computeState(branchInput({ today: pulseDay14, progress: answered(3) }));
    expect(state.tasks.filter((t) => t.actionId === 'a-connection')).toEqual([]);
  });

  it('Task Action, when current, is an open Task for its owner', () => {
    const state = computeState(branchInput({ progress: contracted }));
    expect(state.tasks).toContainEqual(expect.objectContaining({
      itemId: 'i-manager', actionId: 'a-goals', owner: 'line-manager', raisedOn: '2026-10-22',
    }));
  });

  it('Notification Action, when reached, is sent and does not hold the Journey', () => {
    const progress = [...contracted, done('i-manager', 'a-goals', '2026-10-25'), done('i-manager', 'a-pack', '2026-10-26')];
    const state = computeState(branchInput({ progress }));
    expect(state.notifications).toContainEqual({ to: 'starter', message: 'Your welcome pack is on its way', sentOn: '2026-10-26' });
    expect(state.items.find((i) => i.itemId === 'i-manager')?.status).toBe('done');
  });

  it("nextUp, when the starter has an Action, names the first one", () => {
    expect(computeState(branchInput()).nextUp).toEqual({ itemId: 'i-contracting', line: 'Next: Read your offer' });
  });
});

describe('dayNumber and personStatus (rule 8)', () => {
  it.each([
    ['2027-01-04', 0, 'joiner'],
    ['2027-01-05', 1, 'starter'],
    ['2027-01-18', 14, 'starter'],
    ['2027-02-02', 29, 'starter'],
    ['2027-02-03', 30, 'onboarded'],
  ])('on %s, dayNumber is %i and personStatus is %s', (today, dayNumber, personStatus) => {
    expect(computeState(branchInput({ today, progress: cleared }))).toMatchObject({ dayNumber, personStatus });
  });

  it('dayNumber, at the demo start 56 days before the Start date, is -55', () => {
    expect(computeState(branchInput()).dayNumber).toBe(-55);
  });
});
