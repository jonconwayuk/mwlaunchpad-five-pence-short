'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Tags } from '@/src/engine/types';
import { SECONDARY } from './post';

type Item = { id: string; title: string; addedBy?: string };
type Lib = { id: string; title: string; tags: Tags };
const FIELD = 'rounded-[4px] border border-hairline px-2 py-2 text-[15px] text-ink';
const FILTERS = [['jobFamily', 'Job family'], ['grade', 'Grade'], ['location', 'Location']] as const;

async function call(method: 'POST' | 'DELETE', body: unknown): Promise<string> {
  const res = await fetch('/api/additions', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = (await res.json().catch(() => ({ ok: false, error: 'The server did not answer. Try again.' }))) as { ok: boolean; error?: string };
  return j.ok ? '' : (j.error ?? 'Something went wrong');
}

export function EditAppliedPathwayClient({ personId, hrId, items, library }: { personId: string; hrId: string; items: Item[]; library: Lib[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState('');
  const [f, setF] = useState<Record<string, string>>({});
  const [journeyId, setJourneyId] = useState('');
  const [after, setAfter] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [msg, setMsg] = useState('');

  const options = (k: (typeof FILTERS)[number][0]) => [...new Set(library.map((j) => j.tags[k]).filter((v): v is string => !!v))].sort();
  const choices = library.filter((j) => j.title.toLowerCase().includes(q.trim().toLowerCase()) && FILTERS.every(([k]) => !f[k] || j.tags[k] === f[k]));

  async function run(method: 'POST' | 'DELETE', body: unknown, ok: string) {
    const err = await call(method, body);
    setMsg(err || ok);
    if (!err) { setJourneyId(''); router.refresh(); }
  }
  const add = () => run('POST', {
    personId, journeyId, byPersonId: hrId, mandatory,
    unlock: after ? { kind: 'after', itemId: after } : { kind: 'now' },
  }, 'Journey added. It shows on the joiner view now.');

  return (
    <div className="mt-2">
      <button className={SECONDARY} onClick={() => setEditing(!editing)} aria-expanded={editing}>{editing ? 'Done editing' : 'Edit this pathway'}</button>
      {editing && (
        <div className="mt-3 flex flex-col gap-3 rounded-[4px] border border-hairline bg-paper-2 p-4">
          <ul className="text-[15px]">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-2">
                {i.addedBy ? <span aria-hidden className="w-4" /> : <svg role="img" aria-label="Part of the template, locked" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><title>Part of the template, locked</title><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>}
                <span>{i.title}</span>
                {i.addedBy === hrId && <button className={SECONDARY} onClick={() => run('DELETE', { personId, itemId: i.id, byPersonId: hrId }, 'Journey removed.')}>Remove</button>}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-[13px] text-muted">Search by name
              <input className={FIELD} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            {FILTERS.map(([k, label]) => (
              <label key={k} className="flex flex-col text-[13px] text-muted">{label}
                <select className={FIELD} value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
                  <option value="">Any</option>
                  {options(k).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-[13px] text-muted">Journey
              <select className={`${FIELD} min-w-[260px]`} value={journeyId} onChange={(e) => setJourneyId(e.target.value)}>
                <option value="">Choose a Journey ({choices.length})</option>
                {choices.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-[13px] text-muted">Unlock
              <select className={FIELD} value={after} onChange={(e) => setAfter(e.target.value)}>
                <option value="">Now</option>
                {items.map((i) => <option key={i.id} value={i.id}>After {i.title}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} /> Mandatory
            </label>
            <button className="rounded-[4px] bg-heritage px-4 py-2 text-paper hover:bg-racing active:translate-y-[1px] disabled:opacity-50" disabled={!journeyId} onClick={add}>Add Journey</button>
          </div>
          {msg && <p role="status" className="text-[13px]">{msg}</p>}
        </div>
      )}
    </div>
  );
}
