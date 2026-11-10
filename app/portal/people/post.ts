// One place for the People screens' POSTs: returns the error to show, or '' when it worked.
export async function post(url: string, body: unknown): Promise<string> {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = (await res.json().catch(() => ({ ok: false, error: 'The server did not answer. Try again.' }))) as { ok: boolean; error?: string };
  return j.ok ? '' : (j.error ?? 'Something went wrong');
}

export const SECONDARY = 'rounded-[4px] border border-heritage px-3 py-1 text-[13px] text-heritage hover:bg-paper-2 active:translate-y-[1px]';
