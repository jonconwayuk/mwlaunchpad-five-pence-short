'use client';
import { useLiveState } from '@/src/lib/useLiveState';

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function SimulatedDateStrip() {
  const { state } = useLiveState();
  return (
    <div className="bg-ink px-4 py-1 text-[12px] text-paper">
      Simulated date {state ? fmt.format(Date.parse(state.simulatedDate)) : '...'}
    </div>
  );
}
