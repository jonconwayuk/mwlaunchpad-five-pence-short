import { z } from 'zod';
import { insightsData } from '@/src/db/queries';
import { apiHandler } from '@/src/lib/apiHandler';
import { insights } from '@/src/ui/components/insights/aggregate';

export const dynamic = 'force-dynamic';

const id = z.string().min(1).max(100).optional();
const Query = z.object({
  stage: z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']).optional(),
  pathway: id, journey: id,
  by: z.enum(['businessArea', 'role', 'grade']).default('businessArea'),
});

// Empty params mean "All", so drop them before validating.
export const GET = apiHandler(async (req: Request) => {
  const params = Object.fromEntries([...new URL(req.url).searchParams].filter(([, v]) => v !== ''));
  return insights(insightsData(), Query.parse(params));
});
