import { listConnectors } from '@/src/db/queries';
import { apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(() => listConnectors());
