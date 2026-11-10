import { describe, expect, it } from 'vitest';
import { filtersToLoosen, NO_FILTERS, searchPathways, startingFilters } from './pathwaySearch';

const LIST = [
  { id: 'a', title: 'Infrastructure engineer E', tags: { jobFamily: 'Modern Workplace', grade: 'E' } },
  { id: 'b', title: 'Software engineer D', tags: { jobFamily: 'Software engineering', grade: 'D' } },
  { id: 'c', title: 'Welcome for everyone', tags: {} },
];

describe('searchPathways', () => {
  it('matches on name, ignoring case, when text is typed', () => {
    expect(searchPathways(LIST, ' INFRA', NO_FILTERS).map((p) => p.id)).toEqual(['a']);
  });
  it('keeps Pathways with no tag for a filter when that filter is set', () => {
    expect(searchPathways(LIST, '', { ...NO_FILTERS, grade: 'E' }).map((p) => p.id)).toEqual(['a', 'c']);
  });
  it('lists everything when nothing is typed and no filter is set', () => {
    expect(searchPathways(LIST, '', NO_FILTERS)).toHaveLength(3);
  });
  it('starts from the person own values', () => {
    expect(startingFilters({ grade: 'E', location: 'Leeds' })).toEqual({ jobFamily: '', grade: 'E', location: 'Leeds' });
  });
});

describe('filtersToLoosen', () => {
  it('names the filter whose removal brings results back', () => {
    expect(filtersToLoosen(LIST, 'infra', { ...NO_FILTERS, grade: 'D' })).toEqual(['grade']);
  });
  it('names only the filters that matter when two are set', () => {
    expect(filtersToLoosen(LIST, '', { jobFamily: 'Branch', grade: 'E', location: '' })).toEqual(['jobFamily', 'grade']);
  });
  it('names nothing when a filter is set but clearing it changes nothing', () => {
    expect(filtersToLoosen(LIST, 'zzz', { ...NO_FILTERS, grade: 'E' })).toEqual([]);
  });
  it('names nothing when the typed words match no Pathway at all', () => {
    expect(filtersToLoosen(LIST, 'zzz', { ...NO_FILTERS, grade: 'D' })).toEqual([]);
  });
});
