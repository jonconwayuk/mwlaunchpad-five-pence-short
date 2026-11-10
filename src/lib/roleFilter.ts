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
      items: noFlags.map((i) => { const { outcome, ...rest } = i; void outcome; return rest; }),
      needsDecisions: [],
      tasks: state.tasks.filter((t) => t.owner === 'buddy'),
    };
  }
  const base = { ...state, items: noFlags, needsDecisions: [] };
  return as === 'delegate' ? { ...base, actingFor: opts.actingFor } : base;
}
