import { syncJourneysFromFiles } from '@/src/db/queries';
import { ApiError, apiHandler } from '@/src/lib/apiHandler';
import { getToday } from '@/src/lib/clock';
import { syncSummary } from '../files';

export const dynamic = 'force-dynamic';

// Re-reads journeys/ in this repository; a bad file throws and nothing is changed (one transaction in the loader).
export const POST = apiHandler(() => {
  let result: { added: string[]; updated: string[]; skipped?: string[] };
  try {
    result = syncJourneysFromFiles();
  } catch (e) {
    // A bad file is the author's to fix: say which, without the server's folder path.
    throw new ApiError(e instanceof Error ? e.message.replaceAll(`${process.cwd()}/`, '') : 'A Journey file could not be read.', 422);
  }
  return { ...result, summary: syncSummary(result), syncedOn: getToday() };
});
