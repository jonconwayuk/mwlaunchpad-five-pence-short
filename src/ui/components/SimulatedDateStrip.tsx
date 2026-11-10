'use client';
import { useLiveState } from '@/src/lib/useLiveState';

export function SimulatedDateStrip() {
  const { state } = useLiveState();
  return (
    <div className="bg-racing px-4 py-1 text-[13px] text-paper">
      Simulated date: {state?.simulatedDate ?? '...'}. Viewing as {state?.person.name ?? '...'}
    </div>
  );
}
