import { ApiError } from '@/src/lib/apiHandler';

/** Reads a JSON body, turning a malformed one into a plain-English 400. */
export const readJson = (req: Request): Promise<unknown> =>
  req.json().catch(() => { throw new ApiError('Body must be JSON'); });
