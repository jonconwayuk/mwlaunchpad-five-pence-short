'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { ActionDef, ActionType, JourneyDef, Tags } from '@/src/engine/types';
import { ACTION_TYPES, STAGES, TAG_KEYS, TAG_LABELS, TAG_LISTS } from './constants';

type Draft = Omit<JourneyDef, 'version'>;
const blank: Draft = {
  id: '', title: '', description: '', ownerTeam: '', stage: 'onboarding', tags: {}, actions: [], declaresOutcome: false,
};
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const field = 'h-8 rounded-sm border border-hairline bg-paper px-2 text-[13px]';
const label = 'flex flex-col gap-1 text-[13px]';
const btn = 'rounded-sm border border-hairline bg-paper px-2 py-1 text-[13px] disabled:text-muted';

export function JourneyBuilder({ initial }: { initial?: JourneyDef }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(initial ?? blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addType, setAddType] = useState<ActionType>('task');
  const dragFrom = useRef<number | null>(null);
  const isNew = !initial;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setAction = (i: number, patch: Partial<ActionDef>) =>
    set('actions', d.actions.map((a, n) => (n === i ? { ...a, ...patch } : a)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= d.actions.length) return;
    const next = [...d.actions];
    next.splice(to, 0, ...next.splice(from, 1));
    set('actions', next);
  };
  const add = () => {
    const n = d.actions.reduce((m, a) => Math.max(m, Number(a.id.replace(/\D/g, '')) || 0), 0) + 1;
    const extra: Partial<ActionDef> = addType === 'choose' ? { options: ['Yes', 'No'] } : {};
    set('actions', [...d.actions, { id: `a${n}`, type: addType, label: '', ...extra }]);
  };
  const publish = async () => {
    setBusy(true); setError('');
    const body = { ...d, id: isNew ? slug(d.title) : d.id, isNew };
    const res = await fetch('/api/journeys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = (await res.json()) as { ok: boolean; error?: string };
    setBusy(false);
    if (!json.ok) return setError(json.error ?? 'Could not publish');
    router.push('/portal/journeys');
    router.refresh();
  };

  return (
    <main className="max-w-3xl p-6">
      <h1 className="mb-4 text-[26px]">{isNew ? 'New journey' : d.title}</h1>
      <div className="grid grid-cols-2 gap-3">
        <label className={`${label} col-span-2`}>Title
          <input className={field} value={d.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label className={`${label} col-span-2`}>Description
          <textarea className="rounded-sm border border-hairline p-2 text-[13px]" rows={2} value={d.description} onChange={(e) => set('description', e.target.value)} /></label>
        <label className={label}>Owner team
          <input className={field} value={d.ownerTeam} onChange={(e) => set('ownerTeam', e.target.value)} /></label>
        <label className={label}>Stage
          <select className={field} value={d.stage} onChange={(e) => set('stage', e.target.value as Draft['stage'])}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        {TAG_KEYS.map((k) => (
          <label key={k} className={label}>{TAG_LABELS[k]}
            <select className={field} value={d.tags[k] ?? ''}
              onChange={(e) => { const t: Tags = { ...d.tags, [k]: e.target.value || undefined }; set('tags', t); }}>
              <option value="">None</option>{TAG_LISTS[k].map((v) => <option key={v}>{v}</option>)}</select></label>
        ))}
        <label className={`${label} col-span-2`}>While you wait message
          <input className={field} value={d.whileYouWait ?? ''} onChange={(e) => set('whileYouWait', e.target.value || undefined)} /></label>
        <label className="col-span-2 flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={d.declaresOutcome} onChange={(e) => set('declaresOutcome', e.target.checked)} />
          This Journey declares an Outcome</label>
      </div>

      <h2 className="mb-2 mt-6 text-[18px]">Actions</h2>
      <ol className="border-t border-hairline">
        {d.actions.map((a, i) => (
          <li key={a.id} draggable onDragStart={() => { dragFrom.current = i; }} onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragFrom.current !== null) move(dragFrom.current, i); dragFrom.current = null; }}
            className="flex flex-wrap items-center gap-2 border-b border-hairline bg-paper py-2">
            <span aria-hidden className="cursor-grab px-1 text-muted">::</span>
            <span className="w-28 text-[13px] text-muted">{i + 1}. {ACTION_TYPES.find((t) => t.id === a.type)?.label}</span>
            <input aria-label="Action label" className={`${field} min-w-48 flex-1`} placeholder="What the Action says" value={a.label} onChange={(e) => setAction(i, { label: e.target.value })} />
            {(a.type === 'task' || a.type === 'notification') && (
              <label className="text-[13px]">Owner{' '}
                <select className={field} value={a.owner ?? 'starter'} onChange={(e) => setAction(i, { owner: e.target.value as ActionDef['owner'] })}>
                  <option value="starter">Starter</option><option value="line-manager">Line Manager</option>
                  <option value="buddy">Buddy</option><option value="hr">HR</option></select></label>
            )}
            {a.type === 'choose' && (
              <>
                <input aria-label="Options, comma separated" className={field} value={(a.options ?? []).join(', ')}
                  onChange={(e) => setAction(i, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })} />
                <label className="text-[13px]">Flag answers at or below{' '}
                  <input type="number" className={`${field} w-16`} value={a.flagAtOrBelow ?? ''}
                    onChange={(e) => setAction(i, { flagAtOrBelow: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>
              </>
            )}
            {(a.type === 'provide' || a.type === 'choose') && (
              <label className="text-[13px]"><input type="checkbox" checked={!!a.starterOnly} onChange={(e) => setAction(i, { starterOnly: e.target.checked })} /> Starter only</label>
            )}
            {a.type === 'automation' && (
              <label className="text-[13px]"><input type="checkbox" checked={!!a.setsOutcome} onChange={(e) => setAction(i, { setsOutcome: e.target.checked })} /> Sets the Outcome</label>
            )}
            <button className={btn} disabled={i === 0} onClick={() => move(i, i - 1)}>Move up</button>
            <button className={btn} disabled={i === d.actions.length - 1} onClick={() => move(i, i + 1)}>Move down</button>
            <button className={btn} onClick={() => set('actions', d.actions.filter((_, n) => n !== i))}>Remove</button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-2">
        <select aria-label="Action type" className={field} value={addType} onChange={(e) => setAddType(e.target.value as ActionType)}>
          {ACTION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <button className={btn} onClick={add}>Add an action</button>
      </div>

      {error && <p role="alert" className="mt-4 text-[13px] font-medium text-charcoal">{error}</p>}
      <button className="mt-6 rounded-sm bg-racing px-4 py-2 text-[13px] text-paper disabled:opacity-60" disabled={busy} onClick={publish}>Publish</button>
    </main>
  );
}
