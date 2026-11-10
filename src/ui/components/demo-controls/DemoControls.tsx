'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ControlsData } from './data';

const btn = 'rounded-[4px] border border-hairline bg-paper px-2 py-1 text-[13px] text-ink hover:bg-calm disabled:text-muted disabled:hover:bg-paper';

export function DemoControls({ data, today }: { data: ControlsData; today: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [personId, setPersonId] = useState(data.starters[0]?.id ?? '');
  const [date, setDate] = useState(today);
  const [wIdx, setWIdx] = useState(0);
  const starter = data.starters.find((s) => s.id === personId);
  const w = data.waiting[wIdx] ?? data.waiting[0];

  async function post(url: string, body?: unknown) {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
    const j = (await res.json()) as { ok: boolean; error?: string };
    setMsg(j.ok ? '' : (j.error ?? 'Something went wrong'));
    if (j.ok) router.refresh();
  }
  const setDate_ = (d: string) => post('/api/clock', { set: d });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline bg-paper-2 px-4 py-2 text-[13px]">
      <span className="font-semibold text-ink">Demo controls</span>
      <span className="flex items-center gap-1">
        <button className={btn} onClick={() => post('/api/clock', { advanceDays: 1 })}>Plus 1 day</button>
        <button className={btn} onClick={() => post('/api/clock', { advanceDays: 7 })}>Plus 1 week</button>
        <input type="date" aria-label="Simulated date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-[4px] border border-hairline px-1 py-0.5" />
        <button className={btn} onClick={() => setDate_(date)}>Set date</button>
      </span>
      {starter && (
        <span className="flex items-center gap-1">
          <select aria-label="Person" value={personId} onChange={(e) => setPersonId(e.target.value)} className="rounded-[4px] border border-hairline px-1 py-1">
            {data.starters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {starter.jumps.map((j) => (
            <button key={j.label} className={btn} disabled={j.date < today} title={j.date < today ? 'The Demo clock only moves forward.' : j.date} onClick={() => setDate_(j.date)}>{j.label}</button>
          ))}
        </span>
      )}
      <span className="flex items-center gap-1">
        {w ? (
          <>
            <select aria-label="Waiting automation" value={wIdx} onChange={(e) => setWIdx(Number(e.target.value))} className="max-w-[220px] rounded-[4px] border border-hairline px-1 py-1">
              {data.waiting.map((x, i) => <option key={x.personId + x.itemId} value={i}>{x.personName}: {x.title}</option>)}
            </select>
            {w.setsOutcome && <button className={btn} onClick={() => post('/api/simulate', { ...w, result: 'passed' })}>Simulate passed</button>}
            {w.setsOutcome && <button className={btn} onClick={() => post('/api/simulate', { ...w, result: 'failed' })}>Simulate failed</button>}
            <button className={btn} onClick={() => post('/api/simulate', { ...w, result: 'returned' })}>Simulate returned</button>
          </>
        ) : <span className="text-muted">No Hidden automation is waiting.</span>}
      </span>
      <button className={`${btn} ml-auto font-semibold`} onClick={() => post('/api/reset')}>Reset demo</button>
      {msg && <p role="alert" className="basis-full font-semibold text-ink">{msg}</p>}
    </div>
  );
}
