'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Tags } from '@/src/engine';

const KEYS: { key: keyof Tags; label: string }[] = [
  { key: 'jobFamily', label: 'Job family' }, { key: 'role', label: 'Role' }, { key: 'grade', label: 'Grade' },
  { key: 'platform', label: 'Platform' }, { key: 'location', label: 'Location' },
];

export function ApplyPathway({ personId, personTags, pathways }: {
  personId: string; personTags: Tags; pathways: { id: string; title: string; tags: Tags }[];
}) {
  const router = useRouter();
  const [on, setOn] = useState<Set<keyof Tags>>(new Set());
  const [msg, setMsg] = useState('');
  // Tags only filter the library; nothing matches automatically (ADR-0004). A Pathway with no value for a tag passes.
  const shown = pathways.filter((p) => [...on].every((k) => !p.tags[k] || p.tags[k] === personTags[k]));

  async function apply(pathwayId: string) {
    const res = await fetch('/api/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pathwayId, personId }) });
    const j = (await res.json().catch(() => ({ ok: false, error: 'The server did not answer. Try again.' }))) as { ok: boolean; error?: string };
    setMsg(j.ok ? 'Pathway applied.' : (j.error ?? 'Something went wrong'));
    if (j.ok) router.refresh();
  }
  return (
    <div>
      <fieldset className="mb-2 flex flex-wrap gap-4 text-[13px]">
        <legend className="mb-1 text-muted">Filter the Pathway library by this person</legend>
        {KEYS.filter((k) => personTags[k.key]).map((k) => (
          <label key={k.key} className="flex items-center gap-1">
            <input type="checkbox" checked={on.has(k.key)} onChange={() => setOn((s) => { const n = new Set(s); if (!n.delete(k.key)) n.add(k.key); return n; })} />
            {k.label}: {personTags[k.key]}
          </label>
        ))}
      </fieldset>
      <ul>
        {shown.map((p) => (
          <li key={p.id} className="flex items-center justify-between border-b border-hairline py-1">
            <span>{p.title} <span className="text-[13px] text-muted">{[...new Set(Object.values(p.tags))].join(', ')}</span></span>
            <button className="rounded-[4px] bg-racing px-3 py-1 text-[13px] text-paper" onClick={() => apply(p.id)}>Apply pathway</button>
          </li>
        ))}
        {shown.length === 0 && <li className="py-1 text-muted">No Pathway matches these filters.</li>}
      </ul>
      {msg && <p role="status" className="mt-2 text-[13px]">{msg}</p>}
    </div>
  );
}
