import type { ActionDef, ActorRole, EngineInput, ISODate, JourneyDef, OutcomeValue } from './types';

/** Who must act on an Action. A Hidden automation has no human owner. */
export function ownerOf(action: ActionDef): ActorRole | undefined {
  if (action.type === 'automation') return undefined;
  return action.owner ?? 'starter';
}

export interface ActionWalk {
  done: boolean;
  doneAt?: ISODate;
  outcome?: OutcomeValue;
  currentAction?: ActionDef;
  /** When the current Action became current; undefined means when the item became available. */
  currentSince?: ISODate;
  /** Notification Actions reached, with the date reached (undefined means when available). */
  sent: { action: ActionDef; on?: ISODate }[];
}

/** Walks a Journey's Actions in order for one Pathway Item. Notifications are delivered, not waited on.
 * Design D3: a Returned automation is finished with no pass/fail, so it counts as done like any other. */
export function walkActions(itemId: string, journey: JourneyDef, input: EngineInput): ActionWalk {
  const sent: ActionWalk['sent'] = [];
  let lastDone: ISODate | undefined;
  let passed = false;
  for (const action of journey.actions) {
    const p = input.progress.find((x) => x.itemId === itemId && x.actionId === action.id);
    if (action.type === 'automation' && p?.automationResult === 'failed' && action.setsOutcome) {
      // Rule 1: a Failed Outcome ends the Journey and counts as done.
      return { done: true, doneAt: p.doneAt ?? lastDone, outcome: 'failed', sent };
    }
    if (p?.state === 'done') {
      lastDone = p.doneAt ?? lastDone;
      if (action.setsOutcome && p.automationResult === 'passed') passed = true;
      continue;
    }
    if (action.type === 'notification') {
      sent.push({ action, on: lastDone });
      continue;
    }
    return { done: false, currentAction: action, currentSince: lastDone, sent };
  }
  const outcome: OutcomeValue = journey.declaresOutcome && passed ? 'passed' : 'done';
  return { done: true, doneAt: lastDone, outcome, sent };
}
