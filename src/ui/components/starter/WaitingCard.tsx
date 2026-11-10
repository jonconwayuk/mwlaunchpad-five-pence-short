import type { ItemState } from '@/src/engine/types';
import { bandScale } from './format';

const OVERDUE_LINE = 'This is taking longer than usual. Your manager knows and will be in touch.';

/** The one bold element on /me: honest progress while a Journey waits on someone else. */
export function WaitingCard({ item }: { item: ItemState }) {
  const days = item.waitingDays ?? 0;
  const range = item.usualRange;
  return (
    <section aria-labelledby={`wait-${item.itemId}`} className="rounded-[12px] bg-calm p-5 text-ink">
      <h2 id={`wait-${item.itemId}`} className="font-serif text-[21px] leading-snug">
        {item.title}
      </h2>
      <p className="mt-2">{item.whileYouWait ?? 'Nothing is needed from you right now.'}</p>
      {range && <Band days={days} range={range} overdue={item.overdue} />}
    </section>
  );
}

function Band({ days, range, overdue }: { days: number; range: [number, number]; overdue: boolean }) {
  const s = bandScale(days, range);
  const marker = overdue ? 'bg-charcoal' : 'bg-racing';
  return (
    <div className="mt-6">
      <div
        role="img"
        aria-label={`Day ${days} of your wait. Usually ${range[0]} to ${range[1]} days.`}
        className="relative h-14"
      >
        <span
          className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[15px] font-semibold"
          style={{ left: `${s.today}%` }}
        >
          Day {days}
        </span>
        <span
          className="absolute top-7 h-5 bg-everyday/30"
          style={{ left: `${s.lo}%`, width: `${s.hi - s.lo}%` }}
        />
        <span className="absolute inset-x-0 top-[37px] h-px bg-ink/40" />
        {s.ticks.map((t) => (
          <span key={t} className="absolute top-[33px] h-2 w-px bg-ink/40" style={{ left: `${t}%` }} />
        ))}
        <span className={`absolute top-6 h-7 w-[2px] -translate-x-1/2 ${marker}`} style={{ left: `${s.today}%` }} />
      </div>
      <div aria-hidden="true" className="relative h-5 text-[13px] text-charcoal">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${s.lo}%` }}>{range[0]}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${s.hi}%` }}>{range[1]}</span>
        <span className="absolute right-0">days</span>
      </div>
      <p className="mt-3 font-semibold">Usually {range[0]} to {range[1]} days</p>
      {overdue && <p className="mt-2">{OVERDUE_LINE}</p>}
    </div>
  );
}
