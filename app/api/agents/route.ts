import { agentCatalogue } from './catalogue';
import { apiHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(() => agentCatalogue());
