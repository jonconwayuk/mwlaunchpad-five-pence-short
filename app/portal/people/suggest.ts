import type { Tags } from '@/src/engine';

const KEYS = ['jobFamily', 'role', 'grade'] as const;

/**
 * Picks the Pathway to preselect for a person: the one matching most of job family, role and grade, with no
 * tag that contradicts the person's. HR still chooses and applies it; nothing is applied automatically (ADR-0004).
 */
export function suggestPathway<P extends { id: string; tags: Tags }>(personTags: Tags, pathways: P[]): P | undefined {
  let best: P | undefined;
  let bestScore = 0;
  for (const p of pathways) {
    if (KEYS.some((k) => p.tags[k] && p.tags[k] !== personTags[k])) continue;
    const score = KEYS.filter((k) => p.tags[k] && p.tags[k] === personTags[k]).length;
    if (score > bestScore) { best = p; bestScore = score; }
  }
  return best;
}
