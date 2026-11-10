'use client';
import { useState } from 'react';
import { FOCUS } from '@/src/ui/components/starter/JourneyRow';
import { send } from './useTeam';

const QUICK = ['Have a look at the company car scheme', 'Have you received your merch?'];
const BTN = `min-h-[44px] rounded px-4 text-left ${FOCUS}`;

/** "Send a Reminder now" (feedback item 14): a quick choice or a short message of the Line Manager's own. */
export function SendReminder({ personId, name, viewerId }: { personId: string; name: string; viewerId: string }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendNow = async () => {
    setBusy(true);
    const err = await send('/api/reminders', { personId, message: message.trim(), byPersonId: viewerId });
    setBusy(false);
    setStatus(err ?? `Reminder sent to ${name}`);
    if (!err) setMessage('');
  };

  return (
    <fieldset className="mt-6 flex flex-col gap-2">
      <legend className="text-[15px] font-semibold text-racing">Send a Reminder now</legend>
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button key={q} type="button" aria-pressed={message === q} onClick={() => setMessage(q)}
            className={`${BTN} border text-[15px] ${message === q ? 'border-heritage bg-calm text-ink' : 'border-[var(--hairline)] text-heritage'}`}>
            {q}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-[15px]">Or write your own
        <input value={message} maxLength={200} onChange={(e) => setMessage(e.target.value)}
          className={`min-h-[44px] rounded border border-[var(--hairline)] px-3 text-[17px] ${FOCUS}`} />
      </label>
      <button type="button" disabled={!message.trim() || busy} onClick={() => void sendNow()}
        className={`${BTN} self-start border border-heritage font-semibold text-heritage disabled:opacity-50`}>
        Send a Reminder now
      </button>
      {status && <p role="status" className="text-[15px] text-[var(--muted)]">{status}</p>}
    </fieldset>
  );
}
