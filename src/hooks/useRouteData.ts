import {useState, useEffect, useCallback} from 'react';
import {Rep, Route} from '../types';
import {api} from '../services/api';

interface UseRouteDataResult {
  route: Route | null;
  rep: Rep | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRouteData(repId: string): UseRouteDataResult {
  const [route, setRoute] = useState<Route | null>(null);
  const [rep, setRep] = useState<Rep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped to trigger a re-fetch
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [foundRep, foundRoute] = await Promise.all([
          api.getRep(repId, controller.signal),
          api.getRoute(repId, controller.signal),
        ]);
        setRep(foundRep);
        setRoute(foundRoute);
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          return;
        }
        setError(e?.message ?? 'Failed to load route data');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [repId, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken(t => t + 1);
  }, []);

  return {route, rep, loading, error, refresh};
}
