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
  // Accumulated distance in km — incremented by one haversine step per poll tick
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref of latest position to avoid stale closure in setInterval
  const positionRef = useRef<Position | null>(initialPos);
  // Accumulate distance in a ref too so setInterval always sees the latest value
  const distanceRef = useRef(0);

  const stopTracking = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(() => {
    if (!rep) {return;}
    setIsTracking(true);

    intervalRef.current = setInterval(() => {
      const base = positionRef.current ?? {
        latitude: rep.currentLat,
        longitude: rep.currentLng,
      };

      // Simulate realistic movement: slight forward bias toward next unvisited shop
      const deltaLat = (Math.random() - 0.38) * CONFIG.MAX_MOVEMENT_DELTA;
      const deltaLng = (Math.random() - 0.28) * CONFIG.MAX_MOVEMENT_DELTA;

      const next: Position = {
        latitude: base.latitude + deltaLat,
        longitude: base.longitude + deltaLng,
      };

      // Accumulate distance: one haversine step per poll — O(1), not O(n)
      const stepKm = haversineDistance(base, next);
      distanceRef.current += stepKm;
      setTotalDistanceKm(distanceRef.current);

      positionRef.current = next;
      setCurrentPosition(next);

      // Append to breadcrumb trail, capping at MAX_BREADCRUMB_POINTS to prevent memory growth
      setBreadcrumbs(prev => {
        const updated = [...prev, next];
        if (updated.length > CONFIG.MAX_BREADCRUMB_POINTS) {
          return updated.slice(updated.length - CONFIG.MAX_BREADCRUMB_POINTS);
        }
        return updated;
      });

      setLastUpdated(new Date());
    }, CONFIG.POLLING_INTERVAL_MS);
  }, [rep]);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  // Reset breadcrumbs and distance when live tracking is toggled off
  useEffect(() => {
    if (!enabled) {
      setBreadcrumbs(initialPos ? [initialPos] : []);
      positionRef.current = initialPos;
      distanceRef.current = 0;
      setCurrentPosition(initialPos);
      setTotalDistanceKm(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {currentPosition, breadcrumbs, totalDistanceKm, lastUpdated, isTracking};
}
