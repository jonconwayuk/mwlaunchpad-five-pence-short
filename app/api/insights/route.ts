import { z } from 'zod';
import { db } from '@/src/db/client';
import * as s from '@/src/db/schema';
import { insightsData } from '@/src/db/queries';
import { apiHandler } from '@/src/lib/apiHandler';
import { insights } from '@/src/ui/components/insights/aggregate';

export const dynamic = 'force-dynamic';

const id = z.string().min(1).max(100).optional();
const Query = z.object({
  stage: z.enum(['pre-contract', 'pre-employment', 'onboarding', 'first-30-days']).optional(),
  pathway: id, journey: id, jobFamily: id, grade: id, location: id,
  by: z.enum(['businessArea', 'role', 'grade']).default('businessArea'),
});

// Empty params mean "All", so drop them before validating.
export const GET = apiHandler(async (req: Request) => {
  const params = Object.fromEntries([...new URL(req.url).searchParams].filter(([, v]) => v !== ''));
  const semvers = new Map(db.select().from(s.pathwayVersions).all().map((v) => [`${v.pathwayId}@${v.version}`, v.semver]));
  const metas = db.select().from(s.pathways).all().map((p) => ({
    id: p.id, title: p.title, tags: p.tags, semver: (p.liveVersion && semvers.get(`${p.id}@${p.liveVersion}`)) || null,
  }));
  return insights(insightsData(), Query.parse(params), metas);
});
