import Link from 'next/link';
import { agentCatalogue } from '@/src/agents/catalogue';

export const dynamic = 'force-dynamic';

const CONNECTOR = { workday: 'Workday', servicenow: 'ServiceNow', oracle: 'Oracle' } as const;

export default function Page() {
  const agents = agentCatalogue();
  return (
    <main className="max-w-[1100px] p-6">
      <h1 className="text-[26px] font-semibold text-racing">Agent library</h1>
      <p className="mt-1 max-w-[62ch] text-[var(--muted)]">
        Agents answer a new starter&apos;s questions at any time, alongside their Journeys. Each one knows one area and passes to a person when it cannot help.
      </p>
      <p className="mt-3 inline-block rounded-[4px] bg-[var(--paper-2)] px-2 py-1 text-[13px] text-[var(--muted)]">
        Simulated: scripted answers, no live AI
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-4">
        {agents.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 rounded-[4px] border border-[var(--hairline)] bg-paper p-5">
            <div>
              <h2 className="text-[18px] font-semibold text-racing">{a.name}</h2>
              <p className="text-[13px] text-[var(--muted)]">Owned by {a.ownerTeam}</p>
            </div>
            <p>{a.description}</p>

            <div>
              <h3 className="text-[13px] text-[var(--muted)]">Used in</h3>
              {a.journeys.length ? (
                <p>
                  {a.journeys.map((j, i) => (
                    <span key={j.id}>
                      {i > 0 && ', '}
                      <Link href={`/portal/journeys/${j.id}`} className="text-heritage underline underline-offset-2 hover:text-racing">{j.title}</Link>
                    </span>
                  ))}
                </p>
              ) : (
                <p className="text-[var(--muted)]">Any Journey, when the starter asks for a person</p>
              )}
            </div>

            {(a.connectors?.length || a.handover) && (
              <div>
                <h3 className="text-[13px] text-[var(--muted)]">Talks to</h3>
                <p>{[...(a.connectors ?? []).map((c) => CONNECTOR[c]), ...(a.handover ? ['Teams (simulated)'] : [])].join(', ')}</p>
              </div>
            )}

            <div className="mt-auto border-t border-[var(--hairline)] pt-3">
              <h3 className="text-[13px] text-[var(--muted)]">Starters ask</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {[...new Set([...a.intents.map((i) => i.examples[0]), ...a.intents.flatMap((i) => i.examples)])].slice(0, 2).map((q) => (
                  <li key={q} className="italic">&ldquo;{q}&rdquo;</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[13px] text-[var(--muted)]">To add an agent, add a file to the agents folder. It appears here on the next visit.</p>
    </main>
  );
}
