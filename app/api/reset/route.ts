import { apiHandler } from '@/src/lib/apiHandler';
import { seed } from '@/src/db/seed';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async () => {
  seed();
  return { reset: true };
});
