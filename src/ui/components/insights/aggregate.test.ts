import { describe, expect, it } from 'vitest';
import { describeFilters, filterPathways, loosenHint, type PathwayMeta } from './pathwayFilter';
import { insights, median, spread, withStarters, type InsightRow } from './aggregate';

const row = (o: Partial<InsightRow>): InsightRow => ({
  pathwayId: 'pw-a', pathwayTitle: 'A', journeyId: 'j1', journeyTitle: 'J1', stage: 'pre-employment',
  businessArea: 'Branch', role: 'Colleague', grade: 'C', days: 1, ...o,
});

// Two starters on pw-a (j1 pre-employment, j2 onboarding), one on pw-b.
const ROWS: InsightRow[] = [
  row({ days: 30 }), row({ journeyId: 'j2', journeyTitle: 'J2', stage: 'onboarding', days: 5 }),
  row({ days: 20, grade: 'D' }), row({ journeyId: 'j2', journeyTitle: 'J2', stage: 'onboarding', days: 9, grade: 'D' }),
  row({ pathwayId: 'pw-b', pathwayTitle: 'B', businessArea: 'Engineering', role: 'Engineer', days: 50 }),
];

describe('insights aggregates', () => {
  it('median, when the count is odd or even, returns the middle value', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 6])).toBe(3);
  });

  it('spread, when given days, uses the engine Usual Range for the middle half', () => {
    expect(spread([1, 2, 3, 4, 5])).toEqual({ median: 3, lo: 2, hi: 4, n: 5 });
    expect(spread([])).toBeUndefined();
  });

  it('withStarters, when a Journey repeats in a Pathway run, starts the next starter', () => {
    expect(withStarters(ROWS).map((r) => r.starter)).toEqual(['pw-a#0', 'pw-a#0', 'pw-a#1', 'pw-a#1', 'pw-b#0']);
  });

  it('pathway completion, with no Stage filter, is each starter\'s longest Journey per Stage, summed', () => {
    const r = insights(ROWS, { by: 'grade' });
    expect(r.starterCount).toBe(3);
    expect(r.pathways.map((p) => [p.id, p.median])).toEqual([['pw-b', 50], ['pw-a', 32]]);
    expect(r.slowest).toBe('Engineer starters in Engineering take longest: usually 50 to 50 days.');
  });

  it('All Stages total, for the same Pathway, exceeds the Pre-employment total because Stages run in turn', () => {
    const all = insights(ROWS, { by: 'grade' }).pathways.find((p) => p.id === 'pw-a')!;
    const pre = insights(ROWS, { stage: 'pre-employment', by: 'grade' }).pathways.find((p) => p.id === 'pw-a')!;
    expect(pre.median).toBe(25);
    expect(all.median).toBeGreaterThan(pre.median);
  });

  it('Stage filter, when set to onboarding, keeps only that Stage\'s Journeys', () => {
    const r = insights(ROWS, { stage: 'onboarding', by: 'grade' });
    expect(r.pathways.map((p) => [p.id, p.median])).toEqual([['pw-a', 7]]);
    expect(r.journeys.map((j) => j.id)).toEqual(['j2']);
  });

  it('journey groups, when grouped by grade, give each grade its median and name the longest', () => {
    const j1 = insights(ROWS, { by: 'grade', pathway: 'pw-a' }).journeys.find((j) => j.id === 'j1')!;
    expect(j1.groups).toEqual([{ label: 'C', median: 30, n: 1 }, { label: 'D', median: 20, n: 1 }]);
    expect(j1.longest.label).toBe('C');
  });

  it('drill-down, when a Journey is picked, covers its whole history with per-day counts', () => {
    const d = insights(ROWS, { by: 'role', journey: 'j1', stage: 'onboarding' }).drill!;
    expect(d).toMatchObject({ n: 3, min: 20, max: 50, median: 30, lo: 25, hi: 40 });
    expect(d.counts).toEqual([{ days: 20, count: 1 }, { days: 30, count: 1 }, { days: 50, count: 1 }]);
  });
});

const META: PathwayMeta[] = [
  { id: 'pw-a', title: 'Branch colleague', tags: { grade: 'C', jobFamily: 'Branch' }, semver: '1.0.0' },
  { id: 'pw-b', title: 'Infrastructure engineer E', tags: { grade: 'E', jobFamily: 'Modern Workplace' }, semver: '1.2.0' },
];

describe('insights search and filters', () => {
  it('grade filter, when set to E, narrows the matches and the figures to grade E Pathways', () => {
    const r = insights(ROWS, { by: 'grade', grade: 'E' }, META);
    expect(r.matches.map((m) => m.id)).toEqual(['pw-b']);
    expect(r.pathways.map((p) => p.id)).toEqual(['pw-b']);
    expect(r.starterCount).toBe(1);
  });

  it('search, when typing infra, finds the Pathway by name; with a filter that excludes it, finds nothing', () => {
    expect(filterPathways(META, 'infra', {}).map((m) => m.title)).toEqual(['Infrastructure engineer E']);
    expect(filterPathways(META, 'infra', { grade: 'C' })).toEqual([]);
    expect(loosenHint({ grade: 'C' })).toBe('Try loosening the grade filter.');
  });

  it('clearing filters, when none are set, restores every Pathway and all the figures', () => {
    const r = insights(ROWS, { by: 'grade' }, META);
    expect(r.matches).toHaveLength(2);
    expect(r.starterCount).toBe(3);
    expect(describeFilters({ jobFamily: 'Technology', grade: 'E' })).toBe('Technology, grade E, all locations');
  });
});
