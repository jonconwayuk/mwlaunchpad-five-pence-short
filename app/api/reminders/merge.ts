import type { EngineState } from '@/src/engine';

/** Adds the manual Reminders ("Send a Reminder now") to the starter's notifications, before the viewer filter runs. */
export function withManualReminders(state: EngineState, reminders: { message: string; at: string }[]): EngineState {
  if (reminders.length === 0) return state;
  // Manual first, then a stable sort by date: on a tie the engine Notification comes last, so the banner shows it.
  const manual = reminders.map((r) => ({ to: 'starter' as const, message: r.message, sentOn: r.at }));
  return { ...state, notifications: [...manual, ...state.notifications].sort((a, b) => a.sentOn.localeCompare(b.sentOn)) };
}
