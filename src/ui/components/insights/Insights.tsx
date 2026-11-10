'use client';
import { useEffect, useRef, useState } from 'react';
import type { StageId } from '@/src/engine/types';
import { stageLabel } from '@/src/ui/components/journey-builder/constants';
import type { Dimension, Insights as Data, RangeLine } from './aggregate';

const pct = (d: number, max: number) => `${(d / max) * 100}%`;
const niceMax = (n: number) => Math.max(10, Math.ceil(n / 10) * 10);
const usually = (lo: number, hi: number) => (lo === hi ? `usually ${lo} days` : `usually ${lo} to ${hi} days`);
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant';

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[8px] border border-[var(--hairline)] bg-[var(--paper-2)] p-1">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={`min-h-[40px] rounded-[6px] px-3 text-[14px] ${focus} ${value === o.id ? 'bg-racing text-paper' : 'text-charcoal hover:bg-paper'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Axis({ max }: { max: number }) {
  return (
    <div aria-hidden="true" className="relative ml-[240px] mr-[170px] h-5 text-[12px] text-[var(--muted)]">
      {[0, max / 2, max].map((t) => (
        <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t, max) }}>{t}</span>
      ))}
    </div>
  );
}

/** One line of a range chart: the middle half as the Usual Range band, the median as a Racing Green dot. */
function RangeRow({ line, max, strong }: { line: RangeLine; max: number; strong?: boolean }) {
  const text = `${line.label}${line.note ? `, ${line.note}` : ''}: half finish within ${line.median} days, ${usually(line.lo, line.hi)}, from ${line.n} starters`;
  return (
    <li className="flex items-center gap-0 py-1.5" title={text}>
      <span className="w-[240px] shrink-0 pr-4">
        <span className={`block truncate ${strong ? 'font-semibold' : ''}`}>{line.label}</span>
        {line.note && <span className="block truncate text-[13px] text-[var(--muted)]">{line.note}</span>}
      </span>
      <span role="img" aria-label={text} className="relative h-7 flex-1">
        <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--hairline)]" />
        <span className="absolute top-1 h-5 rounded-[4px] bg-everyday/30" style={{ left: pct(line.lo, max), width: `max(4px, ${pct(line.hi - line.lo, max)})` }} />
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-racing ring-2 ring-paper" style={{ left: pct(line.median, max) }} />
      </span>
      <span className="w-[170px] shrink-0 pl-4 text-[14px] text-charcoal">{usually(line.lo, line.hi)}</span>
    </li>
  );
}

function RangeChart({ lines, highlight }: { lines: RangeLine[]; highlight?: string }) {
  const max = niceMax(Math.max(...lines.map((l) => l.hi), 0));
  return (
    <>
      <ul>{lines.map((l) => <RangeRow key={l.id} line={l} max={max} strong={l.id === highlight} />)}</ul>
      <Axis max={max} />
    </>
  );
}

function Card({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[12px] border border-[var(--hairline)] bg-paper p-6">
      <h2 className="text-[19px] font-semibold text-racing">{title}</h2>
      {lead && <p className="mt-1 max-w-[70ch] text-[var(--muted)]">{lead}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Drill({ d }: { d: NonNullable<Data['drill']> }) {
  const max = niceMax(d.max);
  const top = Math.max(...d.counts.map((c) => c.count));
  return (
    <>
      <div role="img" aria-label={`${d.label}: ${usually(d.lo, d.hi)}, half finish within ${d.median} days`} className="relative h-40">
        <span className="absolute inset-y-0 bg-everyday/30" style={{ left: pct(d.lo, max), width: pct(d.hi - d.lo, max) }} />
        {d.counts.map((c) => (
          <span key={c.days} title={`${c.count} starter${c.count === 1 ? '' : 's'} took ${c.days} days`}
            className="absolute bottom-0 w-[12px] -translate-x-1/2 rounded-t-[4px] bg-heritage"
            style={{ left: pct(c.days, max), height: `${(c.count / top) * 85}%` }} />
        ))}
        <span className="absolute inset-y-0 w-[2px] -translate-x-1/2 bg-racing" style={{ left: pct(d.median, max) }} />
        <span className="absolute inset-x-0 bottom-0 h-px bg-ink/40" />
      </div>
      <div aria-hidden="true" className="relative mt-1 h-5 text-[13px] text-charcoal">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: pct(d.lo, max) }}>{d.lo}</span>
        <span className="absolute -translate-x-1/2" style={{ left: pct(d.hi, max) }}>{d.hi}</span>
        <span className="absolute right-0">{max} days</span>
      </div>
      <p className="mt-4 font-semibold">{d.label} {usually(d.lo, d.hi)}</p>
      <p className="mt-1 max-w-[70ch] text-charcoal">
        That is the Usual Range, the middle half of {d.n} past starters. Half finished within {d.median} days. The quickest took {d.min} days and the longest {d.max}.
        Each bar is how many starters took that many days; the shaded band is the Usual Range and the dark line is the middle.
      </p>
    </>
  );
}

export function Insights() {
  const [stage, setStage] = useState<StageId | ''>('');
  const [pathway, setPathway] = useState('');
  const [by, setBy] = useState<Dimension>('businessArea');
  const [journey, setJourney] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const drillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qs = new URLSearchParams({ stage, pathway, journey, by });
    fetch(`/api/insights?${qs}`).then((r) => r.json())
      .then((b: { ok: boolean; data?: Data; error?: string }) => (b.ok && b.data ? (setData(b.data), setError('')) : setError(b.error ?? 'Could not load insights')))
      .catch(() => setError('Could not load insights'));
  }, [stage, pathway, journey, by]);

  if (!data) return <p className="p-6 text-[var(--muted)]">{error || 'Loading insights…'}</p>;
  const dimLabel = data.dimensions.find((d) => d.id === by)!.label.toLowerCase();
  const stageText = stage ? `the ${stageLabel(stage)} Stage` : 'all four Stages';
  const pick = (id: string) => { setJourney(id); requestAnimationFrame(() => drillRef.current?.scrollIntoView({ block: 'start' })); };
  const dashMax = niceMax(Math.max(...data.journeys.flatMap((j) => j.groups.map((g) => g.median)), 0));

  return (
    <main className="mx-auto flex max-w-[1060px] flex-col gap-6 p-6">
      <header>
        <h1 className="text-[26px] font-semibold text-racing">Insights</h1>
        <p className="mt-1 text-[var(--muted)]">How long onboarding usually takes, across {data.starterCount} past starters in {stageText}.</p>
      </header>

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-[var(--hairline)] bg-paper py-3">
        <Segmented label="Stage" value={stage} onChange={setStage}
          options={[{ id: '' as const, label: 'All Stages' }, ...data.stages]} />
        <label className="flex items-center gap-2 text-[14px] text-charcoal">Pathway
          <select value={pathway} onChange={(e) => setPathway(e.target.value)} className={`min-h-[44px] rounded-[6px] border border-[var(--hairline)] bg-paper px-2 text-ink ${focus}`}>
            <option value="">All Pathways</option>
            {data.pathwayOptions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="text-charcoal">{error}</p>}
      </div>

      <Card title="How long each Pathway takes"
        lead={`From a starter's first Journey to their last in ${stageText}. The dot is the middle starter; the shaded band is the usual range, the middle half of starters.`}>
        {data.pathways.length ? <RangeChart lines={data.pathways} highlight={pathway} /> : <p className="text-[var(--muted)]">No Journeys in this Stage yet.</p>}
      </Card>

      <Card title="Which Pathways take longer, and where"
        lead="Each business area by role. Business area is based on the starter's job family.">
        {data.slowest && <p className="mb-4 text-[17px] font-semibold text-ink">{data.slowest}</p>}
        {data.areas.length ? <RangeChart lines={data.areas} /> : <p className="text-[var(--muted)]">No starters match.</p>}
      </Card>

      <Card title="Journeys by business area, role and grade"
        lead={`Each dot is one ${dimLabel}: the middle Journey Duration for that group. Choose a Journey to see its full spread.`}>
        <Segmented label="Group by" value={by} onChange={setBy} options={data.dimensions} />
        <ul className="mt-4 divide-y divide-[var(--hairline)]">
          {data.journeys.map((j) => (
            <li key={j.id}>
              <button type="button" onClick={() => pick(j.id)} aria-pressed={journey === j.id}
                className={`flex w-full items-center rounded-[6px] py-2.5 text-left hover:bg-[var(--paper-2)] ${focus} ${journey === j.id ? 'bg-[var(--paper-2)]' : ''}`}>
                <span className="w-[240px] shrink-0 px-2">
                  <span className="block truncate font-medium text-heritage">{j.label}</span>
                  <span className="block text-[13px] text-[var(--muted)]">{stageLabel(j.stage)}</span>
                </span>
                <span role="img" aria-label={j.groups.map((g) => `${g.label} ${g.median} days`).join(', ')} className="relative h-6 flex-1">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--hairline)]" />
                  {j.groups.map((g) => (
                    <span key={g.label} title={`${g.label}: middle ${g.median} days, from ${g.n} starters`}
                      className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper ${g.label === j.longest.label ? 'bg-racing' : 'bg-everyday'}`}
                      style={{ left: pct(g.median, dashMax) }} />
                  ))}
                </span>
                <span className="w-[170px] shrink-0 pl-4 text-[13px] text-charcoal">
                  Longest: {by === 'grade' ? 'grade ' : ''}{j.longest.label}, {j.longest.median} days
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Axis max={dashMax} />
      </Card>

      <div ref={drillRef} className="scroll-mt-20">
        <Card title={data.drill ? `${data.drill.label}: Journey Duration` : 'One Journey up close'}
          lead={data.drill ? `${stageLabel(data.drill.stage)} Stage, every past starter on every Pathway.` : undefined}>
          {data.drill ? <Drill d={data.drill} /> : <p className="text-[var(--muted)]">Choose a Journey above to see how long it usually takes.</p>}
        </Card>
      </div>

      <p className="text-[13px] text-[var(--muted)]">Built from synthetic history: made-up past starters, not real people.</p>
    </main>
  );
}
