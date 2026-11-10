'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ActionDef, ActionType, JourneyDef, Tags } from '@/src/engine/types';
import { ACTION_TYPES, STAGES, TAG_KEYS, TAG_LABELS, TAG_LISTS } from './constants';

type Draft = Omit<JourneyDef, 'version'>;
const blank: Draft = {
  id: '', title: '', description: '', ownerTeam: '', stage: 'onboarding', tags: {}, actions: [], declaresOutcome: false,
};
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const field = 'h-8 rounded-sm border border-hairline bg-paper px-2 text-[13px]';
const label = 'flex flex-col gap-1 text-[13px]';
type Bump = 'patch' | 'minor' | 'major';
interface Connector { id: string; name: string; operations: { name: string; description: string }[] }
const BUMPS = [['patch', 'Fix', 'Corrects something small'], ['minor', 'New content', 'Adds or changes Actions'], ['major', 'Breaking change', 'Changes what the Journey does']] as const;
const panel = 'rounded-sm border border-[var(--hairline)] bg-paper p-3 text-[13px]';
const btn = 'rounded-sm border border-hairline bg-paper px-2 py-1 text-[13px] disabled:text-muted';

/** Admin only: engineers edit the Journey here, and Publish writes journeys/<id>.json in this repository. */
export function JourneyBuilder({ initial, code: onDisk, branch }: { initial?: JourneyDef; code?: { file: string; text: string }; branch: string }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(initial ?? blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [addType, setAddType] = useState<ActionType>('task');
  const [asking, setAsking] = useState(false);
  const [notice, setNotice] = useState('');
  const [sync, setSync] = useState<{ summary: string; syncedOn: string } | null>(null);
  const [code, setCode] = useState(onDisk);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  useEffect(() => {
    void fetch('/api/connectors').then((r) => r.json() as Promise<{ ok: boolean; data?: Connector[] }>)
      .then((j) => setConnectors(j.data ?? []), () => setError('Could not load the connectors'));
  }, []);
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
  const syncNow = async () => {
    setBusy(true); setError('');
    const json = (await (await fetch('/api/journeys/sync', { method: 'POST' })).json()) as { ok: boolean; error?: string; data?: { summary: string; syncedOn: string } };
    setBusy(false);
    if (!json.ok || !json.data) return setError(json.error ?? 'Could not sync');
    setSync(json.data);
    router.refresh();
  };
  const publish = async (bump: Bump) => {
    setBusy(true); setError(''); setAsking(false);
    const body = { ...d, id: isNew ? `j-${slug(d.title)}` : d.id, isNew, bump };
    const res = await fetch('/api/journeys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = (await res.json()) as { ok: boolean; error?: string; data?: { id: string; semver?: string; file: string } };
    setBusy(false);
    if (!json.ok || !json.data) return setError(json.error ?? 'Could not publish');
    setNotice(`Published version ${json.data.semver ?? ''} and wrote ${json.data.file}`);
    if (isNew) return router.push(`/portal/journeys/${json.data.id}`);
    const file = (await (await fetch(`/api/journeys/${json.data.id}/file`)).json()) as { data?: { file: string; text: string } };
    setCode(file.data);
  };

  return (
    <main className="grid max-w-6xl gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
     <div>
      <Link href="/portal/journeys" className="text-[13px] text-heritage underline">Back to the Journey library</Link>
      <div className="mb-4 mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[26px]">{isNew ? 'New journey' : d.title}</h1>
        <span className="rounded-sm border border-[var(--hairline)] px-2 py-0.5 text-[13px] text-muted">Admin only — for engineers</span>
      </div>
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
              <>
                <label className="text-[13px]">Connector{' '}
                  <select className={field} value={a.connector ?? ''}
                    onChange={(e) => setAction(i, { connector: e.target.value || undefined, operation: e.target.value ? connectors.find((c) => c.id === e.target.value)?.operations[0]?.name : undefined })}>
                    <option value="">None (mocked)</option>{connectors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                {a.connector && (
                  <label className="text-[13px]">Operation{' '}
                    <select className={field} value={a.operation ?? ''} onChange={(e) => setAction(i, { operation: e.target.value })}>
                      {connectors.find((c) => c.id === a.connector)?.operations.map((o) => <option key={o.name} value={o.name} title={o.description}>{o.name}</option>)}</select></label>
                )}
                <label className="text-[13px]"><input type="checkbox" checked={!!a.setsOutcome} onChange={(e) => setAction(i, { setsOutcome: e.target.checked })} /> Sets the Outcome</label>
              </>
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
      {notice && <p role="status" className="mt-4 text-[13px] font-medium text-heritage">{notice}</p>}
      <div className="relative mt-6 inline-block">
        <button className="rounded-sm bg-racing px-4 py-2 text-[13px] text-paper disabled:opacity-60" disabled={busy} aria-expanded={asking}
          onClick={() => (isNew ? void publish('minor') : setAsking(!asking))}>Publish</button>
        {asking && (
          <div role="dialog" aria-label="What kind of change is this?" className="absolute bottom-full left-0 z-20 mb-1 grid w-[260px] gap-1 rounded-sm border border-[var(--hairline)] bg-paper p-3">
            <p className="mb-1 text-[15px] font-medium">What kind of change is this?</p>
            {BUMPS.map(([bump, text, hint]) => (
              <button key={bump} type="button" onClick={() => void publish(bump)} className="rounded-sm border border-hairline px-2 py-1.5 text-left hover:border-heritage">
                <span className="block text-[15px]">{text}</span><span className="block text-[13px] text-muted">{hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
     </div>

      <aside className="flex flex-col gap-4">
        <section className={panel} aria-labelledby="repo-h">
          <h2 id="repo-h" className="mb-2 text-[15px] font-medium">Connected repository</h2>
          <p className="mb-2 text-muted">Points at the journeys/ folder in this repository.</p>
          <dl className="grid grid-cols-[6rem_1fr] gap-y-1">
            <dt className="text-muted">Repository</dt><dd>This repository</dd>
            <dt className="text-muted">Branch</dt><dd>{branch}</dd>
            <dt className="text-muted">Folder</dt><dd>journeys/</dd>
            <dt className="text-muted">Last sync</dt><dd>{sync ? `${sync.syncedOn} (Simulated date): ${sync.summary}` : 'At the last Reset demo'}</dd>
          </dl>
          <button className={`${btn} mt-3`} disabled={busy} onClick={() => void syncNow()}>Sync from repository</button>
        </section>
        <details className={panel} open={!!code}>
          <summary className="cursor-pointer text-[15px] font-medium">View as code</summary>
          {code ? (
            <>
              <p className="my-2 text-muted">{code.file}, exactly as it is on disk</p>
              <pre className="max-h-[32rem] overflow-auto bg-[var(--paper-2)] p-2 font-mono text-[12px] leading-snug">{code.text}</pre>
            </>
          ) : <p className="mt-2 text-muted">Publish this Journey to write its file.</p>}
        </details>
      </aside>
    </main>
  );
}
