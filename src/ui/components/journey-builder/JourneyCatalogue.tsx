'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { StageId, Tags } from '@/src/engine/types';
import { STAGES, TAG_KEYS, TAG_LABELS, TAG_LISTS, stageLabel } from './constants';

export interface CatalogueCard {
  id: string; title: string; description: string; ownerTeam: string; stage: StageId; semver: string; tags: Tags;
}

const field = 'h-8 rounded-sm border border-hairline bg-paper px-2 text-[13px]';

/** The Journey library as a catalogue: what each Journey is, what it does and who owns it. */
export function JourneyCatalogue({ cards }: { cards: CatalogueCard[] }) {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [tag, setTag] = useState<Partial<Record<keyof Tags, string>>>({});
  const words = q.toLowerCase();
  const shown = cards.filter((c) =>
    `${c.title} ${c.description} ${c.ownerTeam}`.toLowerCase().includes(words)
    && (!stage || c.stage === stage) && TAG_KEYS.every((k) => !tag[k] || c.tags[k] === tag[k]));
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[13px]">Search
          <input className={`${field} w-64`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, what it does or owner" />
        </label>
        <label className="flex flex-col gap-1 text-[13px]">Stage
          <select className={field} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All</option>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        {TAG_KEYS.map((k) => (
          <label key={k} className="flex flex-col gap-1 text-[13px]">{TAG_LABELS[k]}
            <select className={field} value={tag[k] ?? ''} onChange={(e) => setTag({ ...tag, [k]: e.target.value || undefined })}>
              <option value="">All</option>{TAG_LISTS[k].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        ))}
      </div>
      <p className="mb-3 text-[13px] text-muted">{shown.length} of {cards.length} Journeys</p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <li key={c.id}>
            <Link href={`/portal/journeys/${c.id}`}
              className="flex h-full flex-col gap-2 rounded-sm border border-[var(--hairline)] bg-paper p-4 transition-colors hover:border-heritage focus-visible:outline-2 focus-visible:outline-heritage">
              <span className="flex items-start justify-between gap-3">
                <span className="text-[17px] font-medium text-ink">{c.title}</span>
                <span className="shrink-0 text-[13px] text-muted">v{c.semver}</span>
              </span>
              <span className="text-[14px] text-charcoal">{c.description}</span>
              <span className="mt-auto pt-2 text-[13px] text-muted">Owned by {c.ownerTeam}. {stageLabel(c.stage)}.</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="py-4 text-[13px] text-muted">Nothing matches these filters.</p>}
    </>
  );
}
