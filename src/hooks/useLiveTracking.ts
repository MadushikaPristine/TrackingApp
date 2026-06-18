/**
 * useLiveTracking
 *
 * Polls the backend every POLLING_INTERVAL_MS for the rep's current GPS
 * position (sent from the rep's own mobile app). This manager app never
 * accesses device location — all coordinates come from the server.
 *
 * In production replace the mock block inside setInterval with:
 *   const data = await fetch(`/api/reps/${repId}/location`).then(r => r.json());
 *   const next = { latitude: data.lat, longitude: data.lng };
 */
import {useState, useEffect, useRef, useCallback} from 'react';
import {MOCK_REPS} from '../data/mockData';
import {CONFIG} from '../constants/config';
import {haversineDistance} from '../utils/mapUtils';

export interface Position {
  latitude: number;
  longitude: number;
}

interface UseLiveTrackingResult {
  currentPosition: Position | null;
  breadcrumbs: Position[];
  totalDistanceKm: number;
  lastUpdated: Date | null;
  isTracking: boolean;
}

export function useLiveTracking(
  repId: string,
  enabled: boolean,
): UseLiveTrackingResult {
  const rep = MOCK_REPS.find(r => r.id === repId);

  const initialPos: Position | null = rep
    ? {latitude: rep.currentLat, longitude: rep.currentLng}
    : null;

  const [currentPosition, setCurrentPosition] = useState<Position | null>(initialPos);
  const [breadcrumbs, setBreadcrumbs] = useState<Position[]>(
    initialPos ? [initialPos] : [],
  );
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionRef = useRef<Position | null>(initialPos);
  const distanceRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startPolling = useCallback(() => {
    if (!rep) {return;}
    setIsTracking(true);

    intervalRef.current = setInterval(() => {
      // ── Mock: simulates a server response from the rep's mobile app ──
      // In production: replace with await fetch(`/api/reps/${repId}/location`)
      const base = positionRef.current ?? {
        latitude: rep.currentLat,
        longitude: rep.currentLng,
      };
      const deltaLat = (Math.random() - 0.38) * CONFIG.MAX_MOVEMENT_DELTA;
      const deltaLng = (Math.random() - 0.28) * CONFIG.MAX_MOVEMENT_DELTA;
      const next: Position = {
        latitude: base.latitude + deltaLat,
        longitude: base.longitude + deltaLng,
      };
      // ── End mock ──

      // Accumulate distance: one haversine step per tick — O(1)
      distanceRef.current += haversineDistance(base, next);
      setTotalDistanceKm(distanceRef.current);

      positionRef.current = next;
      setCurrentPosition(next);

      setBreadcrumbs(prev => {
        const updated = [...prev, next];
        return updated.length > CONFIG.MAX_BREADCRUMB_POINTS
          ? updated.slice(updated.length - CONFIG.MAX_BREADCRUMB_POINTS)
          : updated;
      });

      setLastUpdated(new Date());
    }, CONFIG.POLLING_INTERVAL_MS);
  }, [rep]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  // Reset accumulated state when polling is disabled
  useEffect(() => {
    if (!enabled) {
      setBreadcrumbs(initialPos ? [initialPos] : []);
      setCurrentPosition(initialPos);
      setTotalDistanceKm(0);
      positionRef.current = initialPos;
      distanceRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {currentPosition, breadcrumbs, totalDistanceKm, lastUpdated, isTracking};
}
