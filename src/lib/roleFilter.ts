import { failedReason } from '@/src/engine/hardStops';
import type { EngineState, ItemState } from '@/src/engine/types';

export type Viewer = 'starter' | 'delegate' | 'line-manager' | 'buddy' | 'hr';

// Section 4.3. Filtering happens on the server, never in a component.
// Engine state carries no Choose values today; if one is added, strip it for buddy here.
export function filterForViewer(
  state: EngineState,
  as: Viewer,
  opts: { actingFor?: string } = {},
): EngineState & { actingFor?: string; stopped?: boolean } {
  if (as === 'line-manager' || as === 'hr') return state;
  const noFlags = state.items.map((i) => ({ ...i, blockedFlag: false }));
  if (as === 'buddy') {
    return {
      ...state,
      // A Buddy never sees check details: Outcomes, waiting times, or an automation as the current Action.
      items: noFlags.map((i) => {
        const { outcome, waitingDays, usualRange, ...rest } = i;
        void outcome; void waitingDays; void usualRange;
        return { ...rest, overdue: false, ...(i.currentAction?.type === 'automation' && { currentAction: undefined }) };
      }),
      needsDecisions: [],
      notifications: state.notifications.filter((n) => n.to === 'buddy'),
      tasks: state.tasks.filter((t) => t.owner === 'buddy'),
    };
  }
  const base = { ...state, ...starterView(state, noFlags), needsDecisions: [], notifications: state.notifications.filter((n) => n.to === 'starter'), tasks: state.tasks.filter((t) => t.owner === 'starter') };
  return as === 'delegate' ? { ...base, actingFor: opts.actingFor } : base;
}

/**
 * D2f.4: the starter never hears of a failure from the app first. While its Hard Stop is pending, a Failed
 * item shows exactly as it did before the failure; once Confirm has Cancelled items, the Pathway is stopped;
 * after Dismiss it shows normally. Hidden automations are never shown to the starter (GLOSSARY).
 */
function starterView(state: EngineState, items: ItemState[]): { stopped: boolean; items: ItemState[] } {
  const pending = (i: ItemState) => i.outcome === 'failed'
    && state.needsDecisions.some((n) => !n.extendAllowed && n.reason === failedReason(i.title));
  const decidedFailure = items.some((i) => i.outcome === 'failed' && !pending(i));
  return {
    stopped: decidedFailure && items.some((i) => i.status === 'cancelled'),
    items: items.map((i) => {
      const shown = i.currentAction?.type === 'automation' ? { ...i, currentAction: undefined } : i;
      return pending(i) ? { ...shown, status: 'in-progress', outcome: undefined, doneAt: undefined } : shown;
    }),
  };
}
