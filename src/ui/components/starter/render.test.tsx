import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ActionDef, ItemState } from '@/src/engine/types';
import { JourneyRow } from './JourneyRow';
import { WaitingCard } from './WaitingCard';

const item = (over: Partial<ItemState>): ItemState => ({
  itemId: 'i-x', journeyId: 'j-x', title: 'Welcome pack', stage: 'pre-employment', status: 'action-required',
  mandatory: true, available: true, blockedFlag: false, overdue: false, unmetDependencies: [], ...over,
});
const row = (currentAction: ActionDef, over: Partial<ItemState> = {}) =>
  renderToStaticMarkup(<JourneyRow item={item({ currentAction, ...over })} act={async () => true} onReceipt={() => undefined} />);

describe('Starter Preview rows', () => {
  it('Read, when it is the current Action, offers Got it', () => {
    expect(row({ id: 'a', type: 'read', label: 'Read the welcome note' })).toContain('Got it');
  });

  it('Task, when owned by the starter, offers a tick box', () => {
    expect(row({ id: 'a', type: 'task', label: 'Bring your ID', owner: 'starter' })).toContain('type="checkbox"');
    expect(row({ id: 'a', type: 'task', label: 'Order a laptop', owner: 'line-manager' })).not.toContain('checkbox');
  });

  it('Choose, when current, shows every option', () => {
    const html = row({ id: 'a', type: 'choose', label: 'Pick a size', options: ['Small', 'Large'] });
    expect(html).toContain('Small');
    expect(html).toContain('Large');
  });

  it('a mandatory Journey, when rendered, never says required', () => {
    expect(row({ id: 'a', type: 'read', label: 'Read' }, { status: 'in-progress' })).not.toMatch(/required|mandatory/i);
  });

  it('an optional open Journey, when rendered, offers Not for me', () => {
    expect(row({ id: 'a', type: 'read', label: 'Read' }, { mandatory: false })).toContain('Not for me');
  });

  it('a locked optional Journey, when rendered, has no Not for me button', () => {
    const html = renderToStaticMarkup(<JourneyRow item={item({ status: 'not-started', mandatory: false })} act={async () => true} onReceipt={() => undefined} />);
    expect(html).not.toContain('Not for me');
    expect(html).toContain('Not started');
  });

  it('an in-progress Journey without a Usual Range, when rendered, shows the heritage bar and In progress', () => {
    const html = renderToStaticMarkup(<JourneyRow item={item({ status: 'in-progress' })} act={async () => true} onReceipt={() => undefined} />);
    expect(html).toContain('border-l-[3px] border-l-heritage');
    expect(html).toContain('In progress');
  });
});

describe('WaitingCard', () => {
  const waiting = item({ status: 'in-progress', blockedFlag: true, waitingDays: 18, usualRange: [21, 35], whileYouWait: 'Nothing needed from you.' });

  it('when waiting, shows Day 18 and the Usual Range but never the Blocked Flag', () => {
    const html = renderToStaticMarkup(<WaitingCard item={waiting} />);
    expect(html).toContain('Day 18');
    expect(html).toContain('Usually 21 to 35 days');
    expect(html).not.toMatch(/blocked/i);
  });

  it('when overdue, gives the honest line', () => {
    const html = renderToStaticMarkup(<WaitingCard item={{ ...waiting, waitingDays: 40, overdue: true }} />);
    expect(html).toContain('This is taking longer than usual. Your manager knows and will be in touch.');
    expect(html).toContain('bg-charcoal');
  });
});
