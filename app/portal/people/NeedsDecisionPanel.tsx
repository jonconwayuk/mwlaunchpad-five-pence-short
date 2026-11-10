'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { NeedsDecision } from '@/src/engine';

export function NeedsDecisionPanel({ personId, decisions }: { personId: string; decisions: NeedsDecision[] }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  async function decide(hardStopId: string, decision: 'confirm' | 'extend' | 'dismiss') {
    if (!reason.trim()) return setMsg('Give a reason before you decide.');
    const res = await fetch(`/api/hard-stops/${hardStopId}/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ personId, decision, reason, ...(decision === 'extend' && { extendDays: 7 }) }),
    });
    const j = (await res.json().catch(() => ({ ok: false, error: 'The server did not answer. Try again.' }))) as { ok: boolean; error?: string };
    setMsg(j.ok ? '' : (j.error ?? 'Something went wrong'));
    if (j.ok) { setReason(''); router.refresh(); }
  }
  const b = 'rounded-[4px] border border-paper px-2 py-1 text-[13px] text-paper hover:bg-charcoal';
  return (
    <section className="rounded-[6px] bg-ink p-4 text-paper">
      <h2 className="text-[18px] font-semibold">Needs decision</h2>
      <input aria-label="Reason" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} className="my-2 w-full rounded-[4px] px-2 py-1 text-ink" />
      <ul>
        {decisions.map((d) => (
          <li key={d.hardStopId} className="flex items-center justify-between gap-4 border-t border-charcoal py-2">
            <span><span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-vibrant" />{d.label}{d.reason !== d.label && `: ${d.reason}`}</span>
            <span className="flex shrink-0 gap-1">
              <button className={b} onClick={() => decide(d.hardStopId, 'confirm')}>Confirm</button>
              {d.extendAllowed && <button className={b} onClick={() => decide(d.hardStopId, 'extend')}>Extend by 7 days</button>}
              <button className={b} onClick={() => decide(d.hardStopId, 'dismiss')}>Dismiss</button>
            </span>
          </li>
        ))}
      </ul>
      {msg && <p role="alert" className="text-[13px]">{msg}</p>}
    </section>
  );
}
