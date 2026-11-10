import type { EngineState, ItemState } from '@/src/engine/types';
import { stageLabel } from '@/src/ui/components/journey-builder/constants';

const first = (name: string) => name.split(' ')[0];
// Lower-case a title mid-sentence, but leave acronyms such as "IT setup" alone.
const midSentence = (t: string) => (t[1] && t[1] === t[1].toUpperCase() ? t : t.charAt(0).toLowerCase() + t.slice(1));
const counted = (i: ItemState) => i.status !== 'skipped' && i.status !== 'cancelled';

/**
 * The plain-words progress line, e.g. "Bob is in Pre-employment. 3 of 5 things done. Waiting on
 * privileged access, usually 19 to 28 days." A Buddy gets the Stage only (section 4.3).
 */
export function progressSummary(name: string, es: EngineState, full: boolean): { line: string; next?: string } {
  const stage = `${first(name)} is in ${stageLabel(es.stage)}.`;
  if (!full) return { line: stage };
  const items = es.items.filter(counted);
  const done = items.filter((i) => i.status === 'done').length;
  const wait = items.find((i) => i.blockedFlag);
  const waitLine = wait
    ? ` Waiting on ${midSentence(wait.title)}${wait.usualRange ? `, usually ${wait.usualRange[0]} to ${wait.usualRange[1]} days` : ''}.`
    : '';
  const next = items.find((i) => i.available && !i.blockedFlag && i.status !== 'done');
  return {
    line: `${stage} ${done} of ${items.length} ${items.length === 1 ? 'thing' : 'things'} done.${waitLine}`,
    ...(next && { next: next.title }),
  };
}
