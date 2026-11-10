'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SECONDARY, post } from './post';

// Seeded quick choices for feedback item 14.
const QUICK = ['Have a look at the company car scheme', 'Have you received your merch?'];

export function ReminderPanel({ personId, sent }: { personId: string; sent: { id: number; message: string; at: string }[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');

  async function send() {
    const err = await post('/api/reminders', { personId, message });
    setMsg(err || 'Reminder sent. It shows on their phone within a few seconds.');
    if (!err) { setMessage(''); router.refresh(); }
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button key={q} aria-pressed={message === q} onClick={() => setMessage(q)}
            className={`rounded-full border px-3 py-1 text-[13px] ${message === q ? 'border-racing bg-calm' : 'border-hairline hover:border-heritage'}`}>{q}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-[13px] text-muted">
          Or write your own (up to 200 characters)
          <input value={message} maxLength={200} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-[420px] max-w-full rounded-[4px] border border-hairline px-2 py-1 text-[15px] text-ink" />
        </label>
        <button className={SECONDARY} onClick={send} disabled={!message.trim()}>Send a Reminder now</button>
      </div>
      {msg && <p role="status" className="mt-2 text-[13px]">{msg}</p>}
      {sent.length > 0 && (
        <ul className="mt-3 text-[13px] text-muted">{sent.map((r) => <li key={r.id}>Sent {r.at}: {r.message}</li>)}</ul>
      )}
    </div>
  );
}
