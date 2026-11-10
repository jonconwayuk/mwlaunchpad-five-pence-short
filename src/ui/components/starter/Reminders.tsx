import type { EngineState } from '@/src/engine/types';
import { shortDate } from './format';

/** Quiet list of starter-addressed Reminders, newest first (manual "Send a Reminder now" ones included by /api/state). */
export function Reminders({ notifications }: { notifications: EngineState['notifications'] }) {
  if (notifications.length === 0) return null;
  return (
    <section aria-labelledby="reminders" className="text-[15px]">
      <h2 id="reminders" className="font-serif text-[21px] text-racing">Reminders</h2>
      <ul className="mt-2 divide-y divide-[var(--hairline)]">
        {[...notifications].reverse().map((n, i) => (
          <li key={i} className="py-2">
            <p>{n.message}</p>
            <p className="text-[13px] text-[var(--muted)]">{shortDate(n.sentOn)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The newest Notification as a banner at the very top of the joiner's screen. */
export function LatestNotification({ notifications }: { notifications: EngineState['notifications'] }) {
  const n = notifications[notifications.length - 1];
  if (!n) return null;
  return (
    <div role="status" aria-live="polite" data-testid="latest-notification" className="mb-6 rounded-[12px] border border-heritage bg-calm px-5 py-4">
      <p className="text-[13px] font-medium text-racing">New for you, {shortDate(n.sentOn)}</p>
      <p className="mt-1 text-[19px] font-medium text-racing">{n.message}</p>
    </div>
  );
}
