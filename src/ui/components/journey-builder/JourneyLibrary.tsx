'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Tags } from '@/src/engine/types';
import { TAG_KEYS, TAG_LABELS, TAG_LISTS } from './constants';

export interface LibraryRow {
  id: string; title: string; href: string; tags: Tags; cells: string[];
}

const field = 'h-8 rounded-sm border border-hairline bg-paper px-2 text-[13px]';

/** Plain filtered table shared by the Journey and Pathway libraries. */
export function Library({ rows, columns, searchable }: { rows: LibraryRow[]; columns: string[]; searchable: boolean }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<Partial<Record<keyof Tags, string>>>({});
  const shown = rows.filter((r) =>
    r.title.toLowerCase().includes(q.toLowerCase()) && TAG_KEYS.every((k) => !tag[k] || r.tags[k] === tag[k]));
  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {searchable && (
          <label className="flex flex-col gap-1 text-[13px]">Search
            <input className={field} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title" />
          </label>
        )}
        {TAG_KEYS.map((k) => (
          <label key={k} className="flex flex-col gap-1 text-[13px]">{TAG_LABELS[k]}
            <select className={field} value={tag[k] ?? ''} onChange={(e) => setTag({ ...tag, [k]: e.target.value || undefined })}>
              <option value="">All</option>
              {TAG_LISTS[k].map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        ))}
      </div>
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-hairline text-muted">
            {['Title', ...columns, 'Tags'].map((c) => <th key={c} className="py-2 pr-4 font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id} className="border-b border-hairline">
              <td className="py-2 pr-4"><Link className="text-heritage underline" href={r.href}>{r.title}</Link></td>
              {r.cells.map((c, i) => <td key={i} className="py-2 pr-4">{c}</td>)}
              <td className="py-2 pr-4 text-muted">{TAG_KEYS.map((k) => r.tags[k]).filter(Boolean).join(', ') || '—'}</td>
            </tr>
          ))}
          {shown.length === 0 && <tr><td className="py-4 text-muted" colSpan={columns.length + 2}>Nothing matches these filters.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
