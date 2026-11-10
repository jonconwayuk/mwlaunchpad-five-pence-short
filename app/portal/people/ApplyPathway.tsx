'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { post } from './post';

export function ApplyPathway({ personId, firstName, suggestedId, pathways }: {
  personId: string; firstName: string; suggestedId?: string; pathways: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [pathwayId, setPathwayId] = useState(suggestedId ?? pathways[0]?.id ?? '');
  const [msg, setMsg] = useState('');

  async function apply() {
    const err = await post('/api/apply', { pathwayId, personId });
    setMsg(err || `${pathways.find((p) => p.id === pathwayId)?.title ?? 'Pathway'} applied.`);
    if (!err) router.refresh();
  }
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col text-[13px] text-muted">
        Pathway
        <select value={pathwayId} onChange={(e) => setPathwayId(e.target.value)} className="mt-1 min-w-[280px] rounded-[4px] border border-hairline px-2 py-2 text-[15px] text-ink">
          {pathways.map((p) => <option key={p.id} value={p.id}>{p.title}{p.id === suggestedId ? ' (suggested)' : ''}</option>)}
        </select>
      </label>
      <button className="rounded-[4px] bg-heritage px-4 py-2 text-paper hover:bg-racing active:translate-y-[1px]" onClick={apply} disabled={!pathwayId}>Apply pathway</button>
      {suggestedId === pathwayId && <p className="w-full text-[13px] text-muted">Suggested because it matches {firstName}&apos;s job family, role and grade.</p>}
      {msg && <p role="status" className="w-full text-[13px]">{msg}</p>}
    </div>
  );
}
