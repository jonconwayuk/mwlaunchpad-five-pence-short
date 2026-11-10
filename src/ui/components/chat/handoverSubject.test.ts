import { describe, expect, it } from 'vitest';
import { handoverSubject, type Message } from './HelpChat';

describe('handoverSubject', () => {
  it('skips the request for a person, when the handover agent answered it', () => {
    const ms: Message[] = [
      { kind: 'you', text: 'When will my laptop arrive?' },
      { kind: 'agent', agentName: 'IT setup helper', text: 'Soon.' },
      { kind: 'you', text: 'Can I talk to a real person?' },
      { kind: 'agent', agentName: 'Handover agent', text: 'Passed on.', handover: true },
    ];
    expect(handoverSubject(ms)).toEqual({ question: 'When will my laptop arrive?', agentName: 'Handover agent' });
  });
  it('uses the unanswered question, when no agent knew', () => {
    expect(handoverSubject([{ kind: 'you', text: 'xyz' }, { kind: 'none' }])).toEqual({ question: 'xyz', agentName: undefined });
  });
});
