import { usualRange } from '@/src/engine/duration';
import type { StageId } from '@/src/engine/types';
import { STAGES } from '@/src/ui/components/journey-builder/constants';

/** One history sample, as `insightsData()` returns it. businessArea is the past starter's job family. */
export interface InsightRow {
  pathwayId: string; pathwayTitle: string; journeyId: string; journeyTitle: string; stage: StageId;
  businessArea: string | null; role: string | null; grade: string | null; days: number;
}
export type Dimension = 'businessArea' | 'role' | 'grade';
export interface Query { stage?: StageId; pathway?: string; journey?: string; by: Dimension }
export interface Spread { median: number; lo: number; hi: number; n: number }
export interface RangeLine extends Spread { id: string; label: string; note?: string }

export const DIMENSIONS: { id: Dimension; label: string }[] = [
  { id: 'businessArea', label: 'Business area' }, { id: 'role', label: 'Role' }, { id: 'grade', label: 'Grade' },
];

export function median(days: number[]): number {
  const s = [...days].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
}

/** Median plus the middle half, taken with the engine's Usual Range rule so the two never disagree. */
export function spread(days: number[]): Spread | undefined {
  const r = usualRange(days.map((d) => ({ journeyId: 'g', journeyVersion: 0, days: d })), 'g', 0);
  return r && { median: median(days), lo: r[0], hi: r[1], n: days.length };
}

/**
 * Gives each row the past starter it belongs to. The seed writes one block of rows per starter per Pathway,
 * in id order, so a Journey seen twice in a Pathway's run means the next starter has begun.
 * shortcut: inferred from row order because history has no starter id; read a starter key once insightsData carries one.
 */
export function withStarters(rows: InsightRow[]): (InsightRow & { starter: string })[] {
  const seen = new Map<string, { n: number; journeys: Set<string> }>();
  return rows.map((r) => {
    const cur = seen.get(r.pathwayId) ?? { n: 0, journeys: new Set<string>() };
    if (cur.journeys.has(r.journeyId)) { cur.n += 1; cur.journeys = new Set(); }
    cur.journeys.add(r.journeyId);
    seen.set(r.pathwayId, cur);
    return { ...r, starter: `${r.pathwayId}#${cur.n}` };
  });
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const t of items) m.set(key(t), [...(m.get(key(t)) ?? []), t]);
  return m;
}

const label = (v: string | null) => v ?? 'Not recorded';

/** Everything the Insights page shows, for one Stage, Pathway, Journey and dimension. */
export function insights(all: InsightRow[], q: Query) {
  const rows = withStarters(all).filter((r) => !q.stage || r.stage === q.stage);
  // A starter's Journeys run side by side, so their Pathway (or Stage) took as long as their longest Journey.
  const starters = [...groupBy(rows, (r) => r.starter).values()].map((rs) => ({ ...rs[0]!, days: Math.max(...rs.map((r) => r.days)) }));

  const pathways: RangeLine[] = [...groupBy(starters, (s) => s.pathwayId).values()]
    .map((ss) => ({ id: ss[0]!.pathwayId, label: ss[0]!.pathwayTitle, note: label(ss[0]!.businessArea), ...spread(ss.map((s) => s.days))! }))
    .sort((a, b) => b.median - a.median);

  const scoped = q.pathway ? starters.filter((s) => s.pathwayId === q.pathway) : starters;
  const areas: RangeLine[] = [...groupBy(scoped, (s) => `${label(s.businessArea)}|${label(s.role)}`).entries()]
    .map(([id, ss]) => ({ id, label: label(ss[0]!.role), note: label(ss[0]!.businessArea), ...spread(ss.map((s) => s.days))! }))
    .sort((a, b) => a.note.localeCompare(b.note) || b.median - a.median);
  const top = [...areas].sort((a, b) => b.median - a.median)[0];
  const slowest = top && `${top.label} starters in ${top.note} take longest: usually ${top.lo} to ${top.hi} days.`;

  const inScope = q.pathway ? rows.filter((r) => r.pathwayId === q.pathway) : rows;
  const journeys = [...groupBy(inScope, (r) => r.journeyId).values()].map((rs) => {
    const groups = [...groupBy(rs, (r) => label(r[q.by])).entries()]
      .map(([g, gs]) => ({ label: g, median: median(gs.map((x) => x.days)), n: gs.length }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const longest = [...groups].sort((a, b) => b.median - a.median)[0]!;
    return { id: rs[0]!.journeyId, label: rs[0]!.journeyTitle, stage: rs[0]!.stage, ...spread(rs.map((r) => r.days))!, groups, longest };
  }).sort((a, b) => b.median - a.median);

  // The drill-down is the Journey's whole history, so its band is exactly the Usual Range the starter sees.
  const jr = q.journey ? all.filter((r) => r.journeyId === q.journey) : [];
  const js = spread(jr.map((r) => r.days));
  const drill = js && {
    id: q.journey!, label: jr[0]!.journeyTitle, stage: jr[0]!.stage, ...js,
    min: Math.min(...jr.map((r) => r.days)), max: Math.max(...jr.map((r) => r.days)),
    counts: [...groupBy(jr, (r) => String(r.days)).entries()].map(([d, rs]) => ({ days: Number(d), count: rs.length })).sort((a, b) => a.days - b.days),
  };

  return {
    stages: STAGES, dimensions: DIMENSIONS, starterCount: starters.length,
    pathwayOptions: [...groupBy(all, (r) => r.pathwayId).values()].map((rs) => ({ id: rs[0]!.pathwayId, title: rs[0]!.pathwayTitle })),
    pathways, areas, slowest, journeys, drill: drill ?? null,
  };
}
export type Insights = ReturnType<typeof insights>;
