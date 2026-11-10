'use client';
import { useLiveState } from '@/src/lib/useLiveState';

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function SimulatedDateStrip({ initial }: { initial: string }) {
  const { state } = useLiveState();
  return (
    <div className="bg-ink px-4 py-1 text-[12px] text-paper">
      Simulated date {fmt.format(Date.parse(state?.simulatedDate ?? initial))}
    </div>
  );
}
