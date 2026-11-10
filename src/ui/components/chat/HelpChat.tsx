'use client';
import { useState } from 'react';
import { FOCUS } from '@/src/ui/components/starter/JourneyRow';

const SUGGESTED = ['When do I get paid?', 'When will my laptop arrive?', 'What should I wear?'];
const NOT_SURE = "I'm not sure. Would you like to talk to a person?";
const BUTTON = `min-h-11 rounded-[4px] px-4 font-medium ${FOCUS}`;

export type Message =
  | { kind: 'you'; text: string }
  | { kind: 'agent'; agentName: string; text: string; handover?: boolean }
  | { kind: 'none'; agentName?: string }
  | { kind: 'handover'; lineManagerName: string; question: string; agentName?: string; summary?: string };

/** What to hand over: the last question that was not itself a request for a person, and the agent that offered the handover. */
export function handoverSubject(messages: Message[]): { question?: string; agentName?: string } {
  let question: string | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const next = messages[i + 1];
    if (m.kind === 'you' && !(next?.kind === 'agent' && next.handover)) { question = m.text; break; }
  }
  const offered = [...messages].reverse().find((m) => m.kind === 'agent' && m.handover);
  return { question, agentName: offered?.kind === 'agent' ? offered.agentName : undefined };
}

async function post<T>(url: string, body: object): Promise<T | undefined> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = (await res.json()) as { ok: boolean; data?: T };
    return json.ok ? json.data : undefined;
  } catch {
    return undefined;
  }
}

/** "Need help?": scripted answers from the Agent library, and a simulated Teams handover to the Line Manager. */
export function HelpChat({ personId, initial = [] }: { personId: string; initial?: Message[] }) {
  const [open, setOpen] = useState(initial.length > 0);
  const [messages, setMessages] = useState<Message[]>(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const add = (m: Message) => setMessages((ms) => [...ms, m]);

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setText('');
    add({ kind: 'you', text: question });
    const r = await post<{ agentName?: string; answer?: string; handover?: boolean; none?: boolean }>('/api/chat', { personId, question });
    add(r?.agentName && r.answer ? { kind: 'agent', agentName: r.agentName, text: r.answer, handover: r.handover } : { kind: 'none', agentName: r?.agentName });
    setBusy(false);
  };

  const talk = async () => {
    const { question: asked, agentName } = handoverSubject(messages);
    const question = asked ?? 'I would like to talk to someone.';
    setBusy(true);
    const r = await post<{ lineManagerName: string; agentName: string; summary: string }>('/api/handover', { personId, question, agentName });
    add(r?.lineManagerName
      ? { kind: 'handover', lineManagerName: r.lineManagerName, question, agentName: r.agentName, summary: r.summary }
      : { kind: 'agent', agentName: 'Help', text: "Couldn't reach your Line Manager just now. Please try again." });
    setBusy(false);
  };

  if (!open) {
    return (
      <button type="button" className={`${BUTTON} w-full border border-[var(--hairline)] bg-paper text-heritage`} onClick={() => setOpen(true)}>
        Need help?
      </button>
    );
  }

  return (
    <section aria-labelledby="help-title" className="rounded-[12px] border border-[var(--hairline)] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="help-title" className="font-serif text-[21px] text-racing">Need help?</h2>
        <span className="text-[13px] text-[var(--muted)]">Simulated: scripted answers</span>
      </div>

      <ul aria-live="polite" className="mt-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <li key={i}>
            <Bubble m={m} />
          </li>
        ))}
      </ul>

      {messages.some((m) => m.kind === 'none' || (m.kind === 'agent' && m.handover)) && !messages.some((m) => m.kind === 'handover') && (
        <button type="button" disabled={busy} className={`${BUTTON} mt-3 bg-heritage text-paper disabled:opacity-60`} onClick={() => void talk()}>
          Talk to a person
        </button>
      )}

      {messages.length === 0 && (
        <div role="group" aria-label="Suggested questions" className="flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button key={q} type="button" disabled={busy} className={`${BUTTON} border border-[var(--hairline)] bg-paper text-[15px] text-heritage`} onClick={() => void ask(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void ask(text); }}>
        <label htmlFor="help-question" className="sr-only">Your question</label>
        <input
          id="help-question"
          value={text}
          maxLength={300}
          autoComplete="off"
          placeholder="Ask a question"
          onChange={(e) => setText(e.target.value)}
          className={`min-h-11 min-w-0 flex-1 rounded-[4px] border border-[var(--hairline)] px-3 ${FOCUS}`}
        />
        <button type="submit" disabled={busy || !text.trim()} className={`${BUTTON} border border-[var(--hairline)] bg-paper text-heritage disabled:opacity-60`}>
          Ask
        </button>
      </form>
    </section>
  );
}

function Bubble({ m }: { m: Message }) {
  switch (m.kind) {
    case 'you':
      return <p className="ml-auto w-fit max-w-[85%] rounded-[12px] px-4 py-2" style={{ background: 'var(--paper-2)' }}>{m.text}</p>;
    case 'agent':
      return (
        <div className="max-w-[92%]">
          <p className="rounded-[12px] bg-calm/50 px-4 py-2">{m.text}</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Answered by {m.agentName}</p>
        </div>
      );
    case 'none':
      return (
        <div className="max-w-[92%]">
          <p className="rounded-[12px] bg-calm/50 px-4 py-2">{NOT_SURE}</p>
          {m.agentName && <p className="mt-1 text-[13px] text-[var(--muted)]">Answered by {m.agentName}</p>}
        </div>
      );
    case 'handover':
      return (
        <div className="rounded-[12px] border border-[var(--hairline)] bg-paper p-4">
          <p className="font-semibold">Handing this to {m.lineManagerName} in Microsoft Teams</p>
          <p className="mt-1 text-[15px]">{m.agentName ? `Handed over by ${m.agentName}. ` : ''}Asked: &ldquo;{m.summary ?? m.question}&rdquo;</p>
          <p className="mt-1 text-[15px]">Sent to {m.lineManagerName} in Microsoft Teams.</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Simulated: no message is sent to Microsoft Teams</p>
          <div className="mt-3 flex items-start gap-3">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-heritage text-[13px] font-semibold text-paper">
              {m.lineManagerName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
            <div className="min-w-0 rounded-[4px] border-l-[3px] border-l-heritage px-3 py-2" style={{ background: 'var(--paper-2)' }}>
              <p className="text-[13px] text-[var(--muted)]">{m.lineManagerName}</p>
              <p>Thanks, I have your question: &ldquo;{m.question}&rdquo;. I&rsquo;ll reply in Microsoft Teams.</p>
            </div>
          </div>
        </div>
      );
  }
}
