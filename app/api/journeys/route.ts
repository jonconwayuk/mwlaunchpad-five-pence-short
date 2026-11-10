import { z } from 'zod';
import { listJourneys, publishJourney } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

const role = z.enum(['starter', 'line-manager', 'buddy', 'hr']);
const tag = z.string().min(1).optional();
const Action = z.object({
  id: z.string().min(1),
  type: z.enum(['read', 'notification', 'task', 'automation', 'choose', 'provide']),
  label: z.string().trim().min(1),
  owner: role.optional(),
  starterOnly: z.boolean().optional(),
  options: z.array(z.string().trim().min(1)).min(2).optional(),
  flagAtOrBelow: z.number().int().optional(),
  setsOutcome: z.boolean().optional(),
});
const Draft = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be a lowercase slug'),
  title: z.string().trim().min(1),
  description: z.string(),
  ownerTeam: z.string().trim().min(1),
  stage: z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']),
  tags: z.object({ jobFamily: tag, role: tag, grade: tag, platform: tag, location: tag }),
  actions: z.array(Action).min(1),
  whileYouWait: z.string().optional(),
  declaresOutcome: z.boolean(),
});

export const GET = apiHandler(() => listJourneys());

export const POST = apiHandler(async (req: Request) => {
  const body: unknown = await req.json().catch(() => { throw new ApiError('Body must be JSON', 400); });
  const parsed = Draft.safeParse(body);
  if (!parsed.success) throw new ApiError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
  return publishJourney(parsed.data);
});
