// src/engine/loops.ts
import type { PathwayItem } from './types';

/** Refuses a Dependency that would make a loop, naming the Journeys on it. */
export function wouldCreateLoop(
  items: PathwayItem[],
  fromItemId: string,
  toItemId: string,
  titleOf: (itemId: string) => string
): { loops: true; throughTitles: string[] } | { loops: false } {
  if (fromItemId === toItemId) return { loops: true, throughTitles: [titleOf(fromItemId)] };

  // Edges run dependency -> dependent. Adding `from` as a Dependency of `to`
  // loops when `from` is already reachable from `to`.
  const dependents = new Map<string, string[]>();
  for (const item of items) {
    for (const dep of item.dependsOn) {
      if (dep.kind !== 'item') continue;
      const list = dependents.get(dep.itemId) ?? [];
      list.push(item.id);
      dependents.set(dep.itemId, list);
    }
  }

  const path: string[] = [];
  const seen = new Set<string>();
  const walk = (at: string): boolean => {
    if (at === fromItemId) { path.push(at); return true; }
    if (seen.has(at)) return false;
    seen.add(at);
    path.push(at);
    for (const next of dependents.get(at) ?? []) if (walk(next)) return true;
    path.pop();
    return false;
  };

  return walk(toItemId)
    ? { loops: true, throughTitles: path.map(titleOf) }
    : { loops: false };
}
