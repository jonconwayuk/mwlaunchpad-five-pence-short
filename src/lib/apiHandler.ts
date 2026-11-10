import { ZodError } from 'zod';
import { log } from '@/src/lib/log';

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// Every route goes through here: one place that shapes success and failure responses.
export function apiHandler<Ctx = unknown>(fn: (req: Request, ctx: Ctx) => unknown | Promise<unknown>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return Response.json({ ok: true, data: await fn(req, ctx) });
    } catch (e) {
      if (e instanceof ApiError) return Response.json({ ok: false, error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        const i = e.issues[0];
        const error = `Invalid request: ${[...(i?.path ?? [])].join('.') || 'body'} ${i?.message ?? 'is invalid'}`;
        return Response.json({ ok: false, error }, { status: 400 });
      }
      log.error('Unhandled API error', { error: e instanceof Error ? e.message : 'unknown', path: new URL(req.url).pathname });
      return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 });
    }
  };
}
