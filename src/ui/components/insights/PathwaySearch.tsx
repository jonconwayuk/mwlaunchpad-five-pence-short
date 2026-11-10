'use client';
import type { PathwayMeta } from './pathwayFilter';

// NEEDS: unify with app/portal/people/ApplyPathway.tsx once that search is committed; both should render this and call filterPathways from pathwayFilter.ts.
/** Search box plus the list of matching Pathways. Presentational: the page owns the text and the picked Pathway. */
export function PathwaySearch({ search, onSearch, results, pickedId, onPick, emptyText }: {
  search: string; onSearch: (v: string) => void; results: PathwayMeta[]; pickedId: string; onPick: (id: string) => void; emptyText: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-[14px] text-charcoal">Find a Pathway
        <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Type a name, for example infra"
          className="min-h-[44px] w-[280px] rounded-[6px] border border-[var(--hairline)] bg-paper px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant" />
      </label>
      {results.length === 0 ? <p role="status" className="text-charcoal">{emptyText}</p> : (
        <ul aria-label="Matching Pathways" className="flex flex-wrap gap-2">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" aria-pressed={pickedId === p.id} onClick={() => onPick(pickedId === p.id ? '' : p.id)}
                className={`min-h-[44px] rounded-[8px] border border-[var(--hairline)] px-3 text-left text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant ${pickedId === p.id ? 'bg-racing text-paper' : 'bg-paper text-ink hover:bg-[var(--paper-2)]'}`}>
                <span className="block font-medium">{p.title}</span>
                <span className="block text-[12px] opacity-80">Grade {p.tags.grade ?? 'any'}, {p.semver ? `live version ${p.semver}` : 'not published yet'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
