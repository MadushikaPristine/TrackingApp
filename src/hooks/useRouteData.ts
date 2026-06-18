import {useState, useEffect, useCallback} from 'react';
import {Rep, Route} from '../types';
import {MOCK_REPS, MOCK_ROUTES} from '../data/mockData';

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

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Simulate async fetch
    const timer = setTimeout(() => {
      try {
        const foundRep = MOCK_REPS.find(r => r.id === repId) ?? null;
        const foundRoute =
          MOCK_ROUTES.find(r => r.repId === repId) ?? null;

        if (!foundRep) {
          setError('Representative not found');
        } else {
          setRep(foundRep);
          setRoute(foundRoute);
        }
      } catch (e) {
        setError('Failed to load route data');
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [repId]);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {route, rep, loading, error, refresh};
}
