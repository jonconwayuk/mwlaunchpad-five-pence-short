import { getPathwayDraft, publishPathway } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!getPathwayDraft(id)) throw new ApiError('That Pathway was not found.', 404);
  return { version: publishPathway(id) };
});
