import { wouldCreateLoop, type PathwayItem } from '@/src/engine';

/** Throws a plain-English message when an Addition's Dependencies would loop back to itself. */
export function assertNoLoop(existing: PathwayItem[], item: PathwayItem, titleOf: (id: string) => string): void {
  const items = [...existing, item];
  for (const d of item.dependsOn) {
    if (d.kind !== 'item') continue;
    const r = wouldCreateLoop(items, d.itemId, item.id, titleOf);
    if (r.loops) throw new Error(`That would make a loop: ${r.throughTitles.join(' then ')}`);
  }
}
