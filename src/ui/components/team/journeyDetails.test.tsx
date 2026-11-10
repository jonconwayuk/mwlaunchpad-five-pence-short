import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ItemState } from '@/src/engine/types';
import { JourneyDetails } from './JourneyDetails';
import { TeamView } from './TeamView';
import type { TeamData, TeamRole } from './useTeam';

const item: ItemState = {
  itemId: 'i1', journeyId: 'j1', title: 'IT setup', stage: 'onboarding', status: 'in-progress', mandatory: true,
  available: true, blockedFlag: false, overdue: false, unmetDependencies: [],
  actions: [
    { id: 'a1', type: 'task', label: 'Collect laptop', owner: 'line-manager', state: 'done' },
    { id: 'a2', type: 'automation', label: 'Create account', state: 'current' },
    { id: 'a3', type: 'read', label: 'Read the guide', state: 'upcoming' },
  ],
};

const data = (role: TeamRole): TeamData => ({
  viewer: { id: 'v', name: 'V', role }, viewers: [], simulatedDate: '2026-12-01', noPlan: [], handovers: [], tasks: [],
  starters: [{
    person: { id: 'p', name: 'Bob Warwick', startDate: null },
    engineState: { today: '2026-12-01', stage: 'onboarding', personStatus: 'joiner', dayNumber: 1, items: [item], containers: [], timers: [], needsDecisions: [], tasks: [], notifications: [] },
  }],
});

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => undefined }) }));
vi.mock('./useTeam', async (orig) => ({
  ...(await orig<typeof import('./useTeam')>()),
  useTeam: (_viewerId: string, as: TeamRole) => ({ data: data(as), error: null, refresh: async () => undefined }),
}));

describe('JourneyDetails', () => {
  it('lists each Journey collapsed with its status word and its steps in order, when the Line Manager views it', () => {
    const html = renderToStaticMarkup(<JourneyDetails items={[item]} />);
    expect(html).toContain('<details');
    expect(html).not.toContain('<details open');
    expect(html).toContain('IT setup');
    expect(html).toContain('In progress');
    expect(html.indexOf('Collect laptop')).toBeLessThan(html.indexOf('Create account'));
    expect(html.indexOf('Create account')).toBeLessThan(html.indexOf('Read the guide'));
    expect(html).toContain('Done, Line Manager');
    expect(html).toContain('Current, Hidden automation');
    expect(html).toContain('Upcoming, Starter');
  });
  it('says there are no steps, when the server sent none', () => {
    expect(renderToStaticMarkup(<JourneyDetails items={[{ ...item, actions: undefined }]} />)).toContain('No steps to show.');
  });
});

describe('TeamView drill-down', () => {
  it('shows the Journeys expansion, when the viewer is a Line Manager', () => {
    expect(renderToStaticMarkup(<TeamView viewerId="v" as="line-manager" />)).toContain('Collect laptop');
  });
  it('shows no Journey details, when the viewer is a Buddy', () => {
    const html = renderToStaticMarkup(<TeamView viewerId="v" as="buddy" />);
    expect(html).not.toContain('<details');
    expect(html).not.toContain('Collect laptop');
  });
});
