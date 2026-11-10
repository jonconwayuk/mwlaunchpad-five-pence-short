'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Tags } from '@/src/engine';
import { TAG_LISTS } from '@/src/ui/components/canvas/library';
import { STAGES, STAGE_LABEL } from '@/src/ui/components/starter/format';
import { FILTER_KEYS, FILTER_WORD, NO_FILTERS, filtersToLoosen, searchPathways, startingFilters, type FilterKey } from './pathwaySearch';
import { post } from './post';

interface Option { id: string; title: string; tags?: Tags; semver?: string }

const TAG_ORDER: (keyof Tags)[] = ['jobFamily', 'role', 'grade', 'platform', 'location'];
const field = 'mt-1 rounded-[4px] border border-hairline bg-paper px-2 py-2 text-[15px] text-ink';

// Counts Journeys per Stage from the Pathway as built, in plain words.
function summarise(lanes: string[]): string {
  if (lanes.length === 0) return 'No Journeys yet';
  const parts = STAGES.filter((s) => lanes.includes(s)).map((s) => `${lanes.filter((l) => l === s).length} in ${STAGE_LABEL[s]}`);
  return `${lanes.length} ${lanes.length === 1 ? 'Journey' : 'Journeys'}: ${parts.join(', ')}`;
}

export function ApplyPathway({ personId, firstName, suggestedId, pathways, personTags }: {
  personId: string; firstName: string; suggestedId?: string; pathways: Option[]; personTags?: Tags;
}) {
  const router = useRouter();
  const options = useMemo(() => pathways.map((p) => ({ ...p, tags: p.tags ?? {} })), [pathways]);
  const [query, setQuery] = useState('');
  // The person's own tags if the page sends them, otherwise the suggested Pathway's, which matches them.
  const [filters, setFilters] = useState(() =>
    startingFilters(personTags ?? options.find((p) => p.id === suggestedId)?.tags));
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let live = true;
    options.forEach(async (p) => {
      const r = await fetch(`/api/pathways/${p.id}`).catch(() => undefined);
      const j = r?.ok ? ((await r.json().catch(() => undefined)) as { data?: { items?: { lane: string }[] }; items?: { lane: string }[] } | undefined) : undefined;
      const items = j?.data?.items ?? j?.items;
      if (live && items) setSummaries((s) => ({ ...s, [p.id]: summarise(items.map((i) => i.lane)) }));
    });
    return () => { live = false; };
  }, [options]);

  const results = searchPathways(options, query, filters);
  const loosen = filtersToLoosen(options, query, filters);
  const anyFilter = FILTER_KEYS.some((k) => filters[k]);

  async function apply(p: Option) {
    const err = await post('/api/apply', { pathwayId: p.id, personId });
    setMsg(err || `${p.title} applied.`);
    if (!err) router.refresh();
  }
  const words = loosen.map((k) => FILTER_WORD[k]);
  const empty = loosen.length > 0
    ? `Nothing matches. Try clearing the ${words.join(' or ')} filter.`
    : query.trim() ? 'Nothing matches that name. Try fewer letters, or choose Clear filters.' : 'No Pathways to show. Choose Clear filters.';

  return (
    <div className="max-w-[760px]">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[220px] flex-1 flex-col text-[13px] text-muted">
          Search by Pathway name
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="For example, infra" className={`${field} w-full`} />
        </label>
        {FILTER_KEYS.map((k: FilterKey) => (
          <div key={k} className="flex items-end gap-1">
            <label className="flex flex-col text-[13px] text-muted">
              {TAG_LISTS.find((l) => l.key === k)?.label}
              <select value={filters[k]} onChange={(e) => setFilters({ ...filters, [k]: e.target.value })} className={field}>
                <option value="">Any</option>
                {TAG_LISTS.find((l) => l.key === k)?.values.map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            {filters[k] && <button type="button" aria-label={`Clear ${FILTER_WORD[k]} filter`} onClick={() => setFilters({ ...filters, [k]: '' })} className="px-2 py-2 text-[15px] text-muted hover:text-ink">×</button>}
          </div>
        ))}
        <button type="button" disabled={!anyFilter} onClick={() => setFilters(NO_FILTERS)} className="rounded-[4px] border border-hairline px-3 py-2 text-[14px] hover:bg-paper-2 disabled:opacity-50">Clear filters</button>
      </div>

      <p className="mt-3 text-[13px] text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? 'Pathway' : 'Pathways'} shown
      </p>
      {results.length === 0 ? <p role="status" className="mt-2 rounded-[4px] border border-hairline bg-paper-2 p-3 text-[15px]">{empty}</p> : (
        <ul className="mt-2 flex flex-col gap-2">
          {results.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 rounded-[4px] border border-hairline bg-paper p-3">
              <div>
                <p className="text-[16px] font-semibold">{p.title}{p.semver && <span className="ml-2 text-[13px] font-normal text-muted">version {p.semver}</span>}{p.id === suggestedId && <span className="ml-2 rounded-[4px] bg-calm px-2 py-[2px] text-[12px] font-normal text-racing">Suggested for {firstName}</span>}</p>
                <p className="mt-1 text-[13px] text-muted">{TAG_ORDER.map((k) => p.tags[k]).filter(Boolean).join(' · ') || 'No tags'}</p>
                <p className="text-[13px] text-muted">{summaries[p.id] ?? ' '}</p>
              </div>
              <button type="button" className="shrink-0 rounded-[4px] bg-heritage px-4 py-2 text-paper hover:bg-racing active:translate-y-[1px]" aria-label={`Apply ${p.title}`} onClick={() => apply(p)}>Apply pathway</button>
            </li>
          ))}
        </ul>
      )}
      {msg && <p role="status" className="mt-3 text-[14px]">{msg}</p>}
    </div>
  );
}
