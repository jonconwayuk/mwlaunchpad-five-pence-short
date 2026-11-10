import { z } from 'zod';
import { getJourney, getJourneySemver, listConnectors, listJourneys, publishJourney, writeJourneyFile } from '@/src/db/queries';
import { JourneyFileSchema } from '@/src/db/files';
import { TAG_LISTS } from '@/src/ui/components/journey-builder/constants';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const role = z.enum(['starter', 'line-manager', 'buddy', 'hr']);
const tag = (k: keyof typeof TAG_LISTS) => z.enum(TAG_LISTS[k] as [string, ...string[]]).optional();
// Every Action may name an owner (decision 22): seeded Journeys set one on read, choose, provide and automation too.
const owner = role.optional();
const base = { id: z.string().min(1).max(60), label: z.string().trim().min(1).max(200) };
const Action = z.discriminatedUnion('type', [
  z.strictObject({ ...base, type: z.literal('read'), owner }),
  z.strictObject({ ...base, type: z.enum(['notification', 'task']), owner }),
  z.strictObject({
    ...base, type: z.literal('choose'), options: z.array(z.string().trim().min(1).max(200)).min(2),
    flagAtOrBelow: z.number().int().min(1).max(5).optional(), owner, starterOnly: z.boolean().optional(),
  }),
  z.strictObject({ ...base, type: z.literal('provide'), owner, starterOnly: z.boolean().optional() }),
  z.strictObject({
    ...base, type: z.literal('automation'), owner, setsOutcome: z.boolean().optional(),
    connector: z.string().min(1).optional(), operation: z.string().min(1).optional(),
  }),
]);
const Draft = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a lowercase slug').max(100),
  isNew: z.boolean().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000),
  ownerTeam: z.string().trim().min(1).max(200),
  stage: z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']),
  tags: z.strictObject({
    jobFamily: tag('jobFamily'), role: tag('role'), grade: tag('grade'), platform: tag('platform'), location: tag('location'),
  }),
  actions: z.array(Action).min(1)
    .refine((a) => new Set(a.map((x) => x.id)).size === a.length, 'Action ids must be unique'),
  whileYouWait: z.string().max(2000).optional(),
  declaresOutcome: z.boolean(),
  // Fix, New content or Breaking change; older callers send none and get New content.
  bump: z.enum(['patch', 'minor', 'major']).default('minor'),
});

export const GET = apiHandler(() => listJourneys());

export const POST = apiHandler(async (req: Request) => {
  const body: unknown = await req.json().catch(() => { throw new ApiError('Body must be JSON', 400); });
  const parsed = Draft.safeParse(body);
  if (!parsed.success) throw new ApiError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
  const { isNew, bump, ...def } = parsed.data;
  if (isNew && getJourney(def.id)) throw new ApiError('A journey with that title already exists', 409);
  const ops = new Set(listConnectors().flatMap((c) => c.operations.map((o) => `${c.id}/${o.name}`)));
  const bad = def.actions.find((a) => 'connector' in a && (a.connector || a.operation) && !ops.has(`${a.connector}/${a.operation}`));
  if (bad) throw new ApiError(`Choose a connector and an operation for "${bad.label}", or neither`, 400);
  // Check the file would be valid before the db gets a new version, so the two never drift.
  const file = JourneyFileSchema.safeParse({ ...def, semver: '1.0.0' });
  if (!file.success) throw new ApiError(file.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
  const published = publishJourney(def);
  const written = writeJourneyFile(published, bump);
  return { ...published, semver: getJourneySemver(def.id), file: `journeys/${written}` };
});
