'use client';
import { useCallback, useEffect, useState } from 'react';
import type { EngineState, StageId, Tags, TaskRef } from '@/src/engine/types';

export type TeamRole = 'line-manager' | 'buddy';
export interface TeamStarter {
  person: { id: string; name: string; startDate: string | null };
  engineState: EngineState;
  chooseResults?: { itemId: string; title: string; label: string; value: string | number }[];
}
export interface TeamData {
  viewer: { id: string; name: string; role: TeamRole };
  viewers: { id: string; name: string; role: string }[];
  simulatedDate: string;
  starters: TeamStarter[];
  tasks: TaskRef[];
  library?: { id: string; title: string; stage: StageId; tags: Tags }[];
}

/** Polls GET /api/team every 3000 ms, paused while the tab is hidden (the useLiveState pattern). */
export function useTeam(viewerId: string, as: TeamRole) {
  const [data, setData] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/team?viewerId=${encodeURIComponent(viewerId)}&as=${as}`, { cache: 'no-store' });
    const body = (await res.json()) as { ok: true; data: TeamData } | { ok: false; error: string };
    if (body.ok) { setData(body.data); setError(null); } else setError(body.error);
  }, [viewerId, as]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') void refresh().catch(() => undefined);
    };
    tick();
    const id = setInterval(tick, 3000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  return { data, error, refresh };
}

/** POST or DELETE JSON; resolves to the error message, or null on success. */
export async function send(url: string, body: unknown, method = 'POST'): Promise<string | null> {
  try {
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = (await res.json().catch(() => ({ ok: false, error: `Request failed (${res.status})` }))) as { ok: boolean; error?: string };
    return json.ok ? null : (json.error ?? 'Something went wrong');
  } catch {
    return 'Could not reach the server';
  }
}
