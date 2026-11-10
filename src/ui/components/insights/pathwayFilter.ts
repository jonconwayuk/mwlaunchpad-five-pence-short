import type { Tags } from '@/src/engine/types';

/** A Pathway as the search shows it: name, tags and the live semantic version (null until published). */
export interface PathwayMeta { id: string; title: string; tags: Tags; semver: string | null }
export type FilterKey = 'jobFamily' | 'grade' | 'location';
export type Filters = Partial<Record<FilterKey, string>>;
export const FILTER_KEYS: FilterKey[] = ['jobFamily', 'grade', 'location'];

/** Pure and UI-free so the Apply a Pathway search can share it. Search matches the name as you type; filters match tags exactly. */
export function filterPathways(list: PathwayMeta[], search: string, filters: Filters): PathwayMeta[] {
  const q = search.trim().toLowerCase();
  return list.filter((p) =>
    p.title.toLowerCase().includes(q) && FILTER_KEYS.every((k) => !filters[k] || p.tags[k] === filters[k]));
}

/** Plain words for what is applied, for example "Technology, grade E, all locations". */
export function describeFilters(f: Filters): string {
  return [f.jobFamily ?? 'all job families', f.grade ? `grade ${f.grade}` : 'all grades', f.location ?? 'all locations'].join(', ');
}

/** Which filter to loosen when nothing matches: the ones that are set, in plain words. */
export function loosenHint(f: Filters): string {
  const set = [f.jobFamily && 'job family', f.grade && 'grade', f.location && 'location'].filter(Boolean);
  return set.length ? `Try loosening the ${set.join(' or ')} filter.` : '';
}
