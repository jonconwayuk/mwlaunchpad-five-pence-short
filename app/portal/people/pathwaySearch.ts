import type { Tags } from '@/src/engine';

export const FILTER_KEYS = ['jobFamily', 'grade', 'location'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Record<FilterKey, string>;
export const NO_FILTERS: Filters = { jobFamily: '', grade: '', location: '' };
export const FILTER_WORD: Record<FilterKey, string> = { jobFamily: 'job family', grade: 'grade', location: 'location' };

export interface SearchablePathway { id: string; title: string; tags: Tags }

/** The filters a person starts with: their own job family, grade and location. */
export const startingFilters = (tags: Tags = {}): Filters => ({
  jobFamily: tags.jobFamily ?? '', grade: tags.grade ?? '', location: tags.location ?? '',
});

/** A Pathway with no tag for a filter suits everyone on it, so it stays in the results. */
export function searchPathways<P extends SearchablePathway>(list: P[], query: string, filters: Filters): P[] {
  const q = query.trim().toLowerCase();
  return list.filter((p) => p.title.toLowerCase().includes(q)
    && FILTER_KEYS.every((k) => !filters[k] || !p.tags[k] || p.tags[k] === filters[k]));
}

/** Which filters, if cleared one at a time, would bring something back. Empty when the words alone match nothing. */
export function filtersToLoosen<P extends SearchablePathway>(list: P[], query: string, filters: Filters): FilterKey[] {
  return FILTER_KEYS.filter((k) => filters[k] && searchPathways(list, query, { ...filters, [k]: '' }).length > 0);
}
