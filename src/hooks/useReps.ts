import {useState, useEffect, useCallback} from 'react';
import {Rep} from '../types';
import {api} from '../services/api';

interface UseRepsResult {
  reps: Rep[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useReps(): UseRepsResult {
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await api.getReps(controller.signal);
        setReps(data);
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          return;
        }
        setError(e?.message ?? 'Failed to load representatives');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken(t => t + 1);
  }, []);

  return {reps, loading, error, refresh};
}
