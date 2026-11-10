import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ItemState } from '@/src/engine/types';
import { HelpChat } from '@/src/ui/components/chat/HelpChat';
import { JourneyRow } from './JourneyRow';
import { Reminders } from './Reminders';
import { ActingFor, NoPlan } from './StarterPreview';

describe('Joiner view', () => {
  it('no Applied Pathway, when rendered, welcomes the joiner by name and offers help', () => {
    const html = renderToStaticMarkup(<NoPlan firstName="Bob" personId="person-bob" />);
    expect(html).toContain('Welcome, Bob.');
    expect(html).toContain('HR is getting your plan ready');
    expect(html).toContain('Need help?');
    expect(html).not.toMatch(/loading|error/i);
  });

  it('a Delegate, when viewing, sees the Acting for banner', () => {
    expect(renderToStaticMarkup(<ActingFor name="Dana Whitfield" />)).toContain('Acting for Dana Whitfield');
  });

  it('a Starter only Action, when a Delegate views it, shows Waiting for the starter and no control', () => {
    const item: ItemState = {
      itemId: 'i', journeyId: 'j', title: 'Bank details', stage: 'pre-employment', status: 'action-required',
      mandatory: true, available: true, blockedFlag: false, overdue: false, unmetDependencies: [],
      currentAction: { id: 'a', type: 'provide', label: 'Your bank details', starterOnly: true },
    };
    const html = renderToStaticMarkup(<JourneyRow item={item} act={async () => true} onReceipt={() => undefined} actingFor="Dana Whitfield" />);
    expect(html).toContain('Waiting for Dana Whitfield');
    expect(html).not.toContain('Submit');
  });

  it('Reminders, when present, list each message with its date', () => {
    const html = renderToStaticMarkup(<Reminders notifications={[{ to: 'starter', message: 'Have you received your merch?', sentOn: '2026-11-12' }]} />);
    expect(html).toContain('Reminders');
    expect(html).toContain('Have you received your merch?');
    expect(html).toMatch(/12 Nov/);
  });

  it('Reminders, when there are none, render nothing', () => {
    expect(renderToStaticMarkup(<Reminders notifications={[]} />)).toBe('');
  });

  it('an agent answer, when shown, names the agent and says it is simulated', () => {
    const html = renderToStaticMarkup(<HelpChat personId="p" initial={[{ kind: 'you', text: 'When do I get paid?' }, { kind: 'agent', agentName: 'Payroll helper', text: 'Last working day.' }]} />);
    expect(html).toContain('Answered by Payroll helper');
    expect(html).toContain('Simulated: scripted answers');
  });

  it('no agent match, when shown, offers Talk to a person; a handover shows the simulated Teams card', () => {
    const none = renderToStaticMarkup(<HelpChat personId="p" initial={[{ kind: 'you', text: 'xyz' }, { kind: 'none' }]} />);
    expect(none).toContain('not sure. Would you like to talk to a person?');
    expect(none).toContain('Talk to a person');
    const card = renderToStaticMarkup(<HelpChat personId="p" initial={[{ kind: 'handover', lineManagerName: 'Hannah Price', question: 'xyz' }]} />);
    expect(card).toContain('Handing this to Hannah Price in Microsoft Teams');
    expect(card).toContain('Simulated: no message is sent to Microsoft Teams');
  });
});
