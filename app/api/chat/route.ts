import { z } from 'zod';
import { loadAgents, routeQuestion } from '@/src/agents';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { log } from '@/src/lib/log';

export const dynamic = 'force-dynamic';

const Body = z.object({
  personId: z.string().min(1).max(40),
  question: z.string().trim().min(1).max(300),
});

/** Scripted help chat (D11): route the question to one named Agent from agents/. No LLM. */
export const POST = apiHandler(async (req) => {
  const { question } = Body.parse(await req.json().catch(() => { throw new ApiError('Body must be valid JSON'); }));
  let match: ReturnType<typeof routeQuestion>;
  try {
    match = routeQuestion(question, loadAgents());
  } catch (e) {
    // A broken agent file must not break the joiner's page; it reads as "no agent knows".
    log.error('Agent library failed to load', { error: e instanceof Error ? e.message : 'unknown' });
    return { none: true };
  }
  if (!match?.agent) return { none: true };
  return {
    agentId: match.agent.id,
    agentName: match.agent.name,
    answer: match.intent.answer,
    ...(match.agent.handover && { handover: true }),
  };
});
