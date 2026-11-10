import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { readJourneyFile } from '../../files';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const file = readJourneyFile((await params).id);
  if (!file) throw new ApiError('This Journey has no file in journeys/ yet.', 404);
  return file;
});
