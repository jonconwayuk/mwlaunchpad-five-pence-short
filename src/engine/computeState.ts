import type { EngineInput, EngineState, ItemState, TaskRef } from './types';
import { createEvaluator } from './availability';
import { addDays, diffDays } from './dates';
import { dayNumberOf, personStatusOf, stageOf, usualRange } from './duration';
import { needsDecisions } from './hardStops';
import { ownerOf } from './status';

const TERMINAL = new Set(['done', 'skipped', 'cancelled']);

/** The single entry point: everything the faces show, derived from the input and the Demo clock. */
export function computeState(input: EngineInput): EngineState {
  const { today, person, pathway } = input;
  const ev = createEvaluator(input);
  const firstName = person.name.split(' ')[0];
  const tasks: TaskRef[] = [];
  const notifications: EngineState['notifications'] = [];
  const task = (t: Omit<TaskRef, 'personId' | 'starterName'>) =>
    tasks.push({ ...t, personId: person.id, starterName: person.name });

  const items: ItemState[] = pathway.items.map((item) => {
    const s = ev.item(item.id);
    const range = usualRange(input.history, item.journeyId, item.journeyVersion);
    const open = !TERMINAL.has(s.status) && s.available;
    // Rule 7: Journey Duration runs from availableSince to doneAt (or today while open).
    const waitingDays = s.availableSince && (s.status === 'done' || open)
      ? diffDays(s.availableSince, s.doneAt ?? today) : undefined;
    const overdue = open && range !== undefined && waitingDays !== undefined && waitingDays > range[1];
    const blockedFlag = open && s.currentAction?.type === 'automation';

    if (open && s.currentAction?.type === 'task') {
      task({ itemId: item.id, actionId: s.currentAction.id, label: s.currentAction.label,
        owner: ownerOf(s.currentAction) ?? 'starter', raisedOn: s.currentSince ?? s.availableSince ?? today });
    }
    if (overdue && range && s.availableSince) {
      task({ itemId: item.id, actionId: s.currentAction?.id ?? s.journey.actions[0]!.id, owner: 'line-manager',
        label: `Check in with ${firstName}: ${s.title} is taking longer than usual`,
        raisedOn: addDays(s.availableSince, range[1] + 1) });
    }
    for (const a of s.journey.actions) {
      if (a.type !== 'choose' || a.flagAtOrBelow === undefined) continue;
      const p = input.progress.find((x) => x.itemId === item.id && x.actionId === a.id && x.state === 'done');
      const score = Number(p?.value);
      if (p && !Number.isNaN(score) && score <= a.flagAtOrBelow) {
        task({ itemId: item.id, actionId: a.id, owner: 'line-manager',
          label: `${firstName} scored ${score} for "${a.label}". Have a chat.`, raisedOn: p.doneAt ?? today });
      }
    }
    for (const n of s.sent) {
      notifications.push({ to: n.action.owner ?? 'starter', message: n.action.label,
        sentOn: n.on ?? s.availableSince ?? today });
    }

    return {
      itemId: item.id, journeyId: item.journeyId, title: s.title, stage: s.journey.stage,
      status: s.status, mandatory: item.mandatory, available: s.available,
      availableSince: s.availableSince, doneAt: s.doneAt, outcome: s.outcome,
      currentAction: open ? s.currentAction : undefined,
      blockedFlag, waitingDays, usualRange: range, overdue,
      unmetDependencies: s.unmetDependencies,
      whileYouWait: blockedFlag ? s.journey.whileYouWait : undefined,
      addedBy: item.addedBy,
    };
  });

  const containers = pathway.containers.map((c) => {
    const mandatory = items.filter((i) => c.itemIds.includes(i.itemId) && i.mandatory);
    const remaining = mandatory.filter((i) => i.status !== 'done');
    return { containerId: c.id, label: c.label, complete: remaining.length === 0,
      doneCount: mandatory.length - remaining.length, mandatoryCount: mandatory.length,
      remainingItemIds: remaining.map((i) => i.itemId) };
  });

  const timers = pathway.timers.map((t) => {
    const firesOn = ev.timerFiresOn(t.id);
    const fired = firesOn !== undefined && firesOn <= today;
    // Rule 4: a Reminder is skipped when the item it is about was already done when the Timer fired.
    const about = t.reminder && items.find((i) => i.itemId === t.reminder?.aboutItemId);
    const alreadyDone = about && TERMINAL.has(about.status) && (!about.doneAt || about.doneAt <= (firesOn as string));
    if (fired && t.reminder && !alreadyDone) {
      notifications.push({ to: t.reminder.to, message: t.reminder.message, sentOn: firesOn });
    }
    return { timerId: t.id, firesOn, fired };
  });

  const dayNumber = dayNumberOf(today, person.startDate);
  // Rule 9: Contracting is the Journey in the Pre-contract Stage.
  const contractingDone = items.filter((i) => i.stage === 'pre-contract').every((i) => i.status === 'done');
  const actionable = items.find((i) => i.status === 'action-required');

  return {
    today, stage: stageOf(dayNumber, contractingDone), personStatus: personStatusOf(dayNumber), dayNumber,
    items, containers, timers,
    needsDecisions: needsDecisions(input, ev),
    tasks, notifications: notifications.sort((a, b) => a.sentOn.localeCompare(b.sentOn)),
    nextUp: actionable?.currentAction && { itemId: actionable.itemId, line: `Next: ${actionable.currentAction.label}` },
  };
}
