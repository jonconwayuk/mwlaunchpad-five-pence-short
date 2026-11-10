import type { EngineState } from '@/src/engine';

/** Adds the manual Reminders ("Send a Reminder now") to the starter's notifications, before the viewer filter runs. */
export function withManualReminders(state: EngineState, reminders: { message: string; at: string }[]): EngineState {
  if (reminders.length === 0) return state;
  return { ...state, notifications: [...state.notifications, ...reminders.map((r) => ({ to: 'starter' as const, message: r.message, sentOn: r.at }))] };
}
