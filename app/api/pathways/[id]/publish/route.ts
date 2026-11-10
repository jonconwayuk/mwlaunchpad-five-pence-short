import { z } from 'zod';
import { getPathwayDraft, publishPathwaySemver } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

// Fix, New content or Breaking change; an empty body (older callers) counts as New content.
const body = z.strictObject({ bump: z.enum(['patch', 'minor', 'major']).default('minor') });

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!getPathwayDraft(id)) throw new ApiError('That Pathway was not found.', 404);
  const parsed = body.safeParse(await req.json().catch(() => ({}))); // no body: New content
  if (!parsed.success) throw new ApiError('Choose Fix, New content or Breaking change.', 400);
  return publishPathwaySemver(id, parsed.data.bump);
});
