// Journeys and connectors as config as code: one JSON file each under journeys/ and connectors/, validated on load.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { JourneyDef } from '../engine/types';

export const TAG_LISTS = {
  jobFamily: ['Branch', 'Software engineering', 'Executive', 'Modern Workplace', 'HR', 'IT'],
  role: ['Customer service colleague', 'Software engineer', 'Infrastructure engineer', 'Managing director', 'Executive assistant', 'Line manager'],
  grade: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  platform: ['Retail', 'Technology', 'Group Functions'],
  location: ['Cardiff', 'Leeds', 'London', 'Edinburgh'],
};

// Read at call time so tests can point at a copy of the folder.
const journeysDir = () => process.env.JOURNEYS_DIR ?? join(process.cwd(), 'journeys');
const connectorsDir = () => process.env.CONNECTORS_DIR ?? join(process.cwd(), 'connectors');
const jsonFiles = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

const Operation = z.object({ name: z.string().min(1), description: z.string().min(1), inputs: z.array(z.string()), outputs: z.array(z.string()) });
export const ConnectorSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), description: z.string().min(1),
  adapter: z.string().min(1), operations: z.array(Operation).min(1),
});
export type Connector = z.infer<typeof ConnectorSchema>;

export function listConnectors(): Connector[] {
  return jsonFiles(connectorsDir()).map((f) => parseFile(ConnectorSchema, join(connectorsDir(), f), f.replace(/\.json$/, '')));
}

const tag = (k: keyof typeof TAG_LISTS) => z.enum(TAG_LISTS[k] as [string, ...string[]]).optional();
const ActionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['read', 'notification', 'task', 'automation', 'choose', 'provide']),
  label: z.string().min(1),
  owner: z.enum(['starter', 'line-manager', 'buddy', 'hr']).optional(),
  starterOnly: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  flagAtOrBelow: z.number().int().optional(),
  setsOutcome: z.boolean().optional(),
  // NEEDS: optional connector/operation on ActionDef in src/engine/types.ts (kept as extra JSON on the Action; the engine ignores them)
  connector: z.string().optional(),
  operation: z.string().optional(),
}).refine((a) => (a.connector === undefined) === (a.operation === undefined), 'connector and operation go together')
  .refine((a) => a.connector === undefined || a.type === 'automation', 'only a Hidden automation can use a connector');

export const JourneyFileSchema = z.object({
  id: z.string().regex(/^j-[a-z0-9-]+$/),
  semver: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  ownerTeam: z.string().min(1),
  stage: z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']),
  tags: z.object({ jobFamily: tag('jobFamily'), role: tag('role'), grade: tag('grade'), platform: tag('platform'), location: tag('location') }),
  whileYouWait: z.string().optional(),
  declaresOutcome: z.boolean(),
  actions: z.array(ActionSchema).min(1),
});
export type JourneyFile = z.infer<typeof JourneyFileSchema>;

function parseFile<T extends z.ZodType<{ id: string }>>(schema: T, path: string, expectedId: string): z.infer<T> {
  const r = schema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
  if (!r.success) throw new Error(`${path} is not valid: ${z.prettifyError(r.error)}`);
  if (r.data.id !== expectedId) throw new Error(`${path}: id ${r.data.id} must match the file name`);
  return r.data;
}

/** Every Journey file, sorted by file name so seeding is deterministic. Throws on the first bad file. */
export function loadJourneyFiles(): JourneyFile[] {
  const ops = new Set(listConnectors().flatMap((c) => c.operations.map((o) => `${c.id}/${o.name}`)));
  return jsonFiles(journeysDir()).map((f) => {
    const j = parseFile(JourneyFileSchema, join(journeysDir(), f), f.replace(/\.json$/, ''));
    const bad = j.actions.find((a) => a.connector && !ops.has(`${a.connector}/${a.operation}`));
    if (bad) throw new Error(`${f}: Action ${bad.id} uses unknown connector operation ${bad.connector}/${bad.operation}`);
    return j;
  });
}

export function fileToJourney(f: JourneyFile, version: number): JourneyDef {
  const j: JourneyDef & { semver?: string } = { ...f, version };
  delete j.semver;
  return j;
}

/** Writes a Journey back as journeys/<id>.json (validated first). Returns the file name. */
export function writeJourneyFileRaw(def: Omit<JourneyDef, 'version'> & { semver: string }): string {
  const { id, semver, title, description, ownerTeam, stage, tags, whileYouWait, declaresOutcome, actions } = def;
  const file = JourneyFileSchema.parse({ id, semver, title, description, ownerTeam, stage, tags, whileYouWait, declaresOutcome, actions });
  writeFileSync(join(journeysDir(), `${id}.json`), `${JSON.stringify(file, null, 2)}\n`);
  return `${id}.json`;
}
