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
