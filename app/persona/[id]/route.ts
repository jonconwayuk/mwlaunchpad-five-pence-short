import { NextResponse } from 'next/server';
import { PERSONAS } from '@/src/lib/persona';

export const dynamic = 'force-dynamic';

// /persona/A|B|C picks the persona for this phone, then goes to /me or /team.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  if (!PERSONAS.some((p) => p.id === id)) return new Response('Unknown persona. Use A, B or C.', { status: 404 });
  const to = url.searchParams.get('to');
  const res = NextResponse.redirect(new URL(to === '/team' ? '/team' : '/me', url));
  res.cookies.set('persona', id, { path: '/', sameSite: 'lax' });
  return res;
}
