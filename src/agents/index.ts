import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// The Agent library: scripted agents, one JSON file each in agents/. No LLM; answers are pre-written.
const Intent = z.strictObject({
  id: z.string().min(1),
  examples: z.array(z.string().trim().min(1)).min(1),
  answer: z.string().trim().min(1),
});
export const AgentSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a lowercase slug'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver, e.g. 1.0.0'),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  ownerTeam: z.string().trim().min(1),
  journeyIds: z.array(z.string().min(1)),
  connectors: z.array(z.enum(['workday', 'servicenow', 'oracle'])).optional(),
  intents: z.array(Intent).min(1),
  handover: z.boolean().optional(),
});
export type AgentDef = z.infer<typeof AgentSchema>;
export type AgentIntent = AgentDef['intents'][number];

export function loadAgents(dir = path.join(process.cwd(), 'agents')): AgentDef[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const agents = files.map((f) => {
    let raw: unknown;
    try { raw = JSON.parse(readFileSync(path.join(dir, f), 'utf8')); } catch { throw new Error(`${dir}/${f}: not valid JSON`); }
    const parsed = AgentSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`${dir}/${f}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    }
    return parsed.data;
  });
  const ids = new Set<string>();
  for (const a of agents) {
    if (ids.has(a.id)) throw new Error(`agents: duplicate agent id ${a.id}`);
    ids.add(a.id);
  }
  return agents.sort((a, b) => a.name.localeCompare(b.name));
}

const STOP = new Set(('a an the i me my we you your is are am do does did can could will would should what when where '
  + 'who why how which to of in on for at it be has have been this that there and or with any get '
  + 'need help want work i\'d please us our so if').split(' '));
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));

// shortcut: share-of-words matching against the examples; swap for a real intent model if one is ever allowed.
// Score = share of an example's meaningful words found in the question; 0.5 or below means "no agent knows".
export function routeQuestion(question: string, agents: AgentDef[]): { agent: AgentDef; intent: AgentIntent } | undefined {
  const asked = new Set(words(question));
  let best: { agent: AgentDef; intent: AgentIntent } | undefined;
  let bestScore = 0;
  let bestLen = 0;
  for (const agent of agents) {
    for (const intent of agent.intents) {
      for (const example of intent.examples) {
        const ew = new Set(words(example));
        if (!ew.size) continue;
        const score = [...ew].filter((w) => asked.has(w)).length / ew.size;
        if (score <= 0.5) continue;
        if (score > bestScore || (score === bestScore && ew.size > bestLen)) { best = { agent, intent }; bestScore = score; bestLen = ew.size; }
      }
    }
  }
  return best;
}
