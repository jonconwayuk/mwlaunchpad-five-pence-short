import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AddJourney } from './AddJourney';
import type { TeamStarter } from './useTeam';

// Only the fields AddJourney reads.
const starter = { person: { id: 'person-bob', name: 'Bob Warwick' }, engineState: { items: [], containers: [] } } as unknown as TeamStarter;

describe('AddJourney', () => {
  it('names its button "Add journey", when a Needs decision Confirm is on the same screen, so a presenter cannot press the wrong one', () => {
    const html = renderToStaticMarkup(<AddJourney starter={starter} viewerId="lm-hannah" library={[]} onDone={() => undefined} />);
    expect(html).toMatch(/<button[^>]*>\s*Add journey\s*<\/button>/);
    expect(html).not.toMatch(/>\s*Confirm\s*</);
  });
});
