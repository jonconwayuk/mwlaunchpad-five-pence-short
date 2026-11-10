import type { EngineState } from '@/src/engine/types';

export type Viewer = 'starter' | 'delegate' | 'line-manager' | 'buddy' | 'hr';

// Section 4.3. Filtering happens on the server, never in a component.
// Engine state carries no Choose values today; if one is added, strip it for buddy here.
export function filterForViewer(
  state: EngineState,
  as: Viewer,
  opts: { actingFor?: string } = {},
): EngineState & { actingFor?: string } {
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
  const base = { ...state, items: noFlags, needsDecisions: [], notifications: state.notifications.filter((n) => n.to === 'starter') };
  return as === 'delegate' ? { ...base, actingFor: opts.actingFor } : base;
}
