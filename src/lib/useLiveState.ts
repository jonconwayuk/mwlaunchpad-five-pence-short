'use client';
import { useCallback, useEffect, useState } from 'react';
import type { EngineState } from '@/src/engine/types';

export interface LiveData {
  engineState: EngineState;
  person: { id: string; name: string };
  simulatedDate: string;
  basedOn?: string;
  personas: { id: string; name: string }[];
}

/** Polls GET /api/state every 2500 ms, paused while the tab is hidden. */
// `query` is a raw query string including the leading '?', e.g. '?as=starter'.
export function useLiveState(query = '') {
  const [state, setState] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/state${query}`, { cache: 'no-store' });
      const body = (await res.json()) as { ok: true; data: LiveData } | { ok: false; error: string };
      if (!body.ok) throw new Error(body.error);
      setState(body.data);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') void refresh().catch(() => undefined);
    };
    tick();
    const id = setInterval(tick, 2500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  return { state, loading, refresh };
}
