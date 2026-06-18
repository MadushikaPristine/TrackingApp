import {useState, useEffect, useRef, useCallback} from 'react';
import {MOCK_REPS} from '../data/mockData';
import {CONFIG} from '../constants/config';

interface Position {
  latitude: number;
  longitude: number;
}

interface UseLiveTrackingResult {
  currentPosition: Position | null;
  lastUpdated: Date | null;
  isTracking: boolean;
}

export function useLiveTracking(
  repId: string,
  enabled: boolean,
): UseLiveTrackingResult {
  const rep = MOCK_REPS.find(r => r.id === repId);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(
    rep
      ? {latitude: rep.currentLat, longitude: rep.currentLng}
      : null,
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionRef = useRef<Position | null>(currentPosition);

  const stopTracking = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(() => {
    if (!rep) {
      return;
    }

    setIsTracking(true);

    intervalRef.current = setInterval(() => {
      setCurrentPosition(prev => {
        const base = prev ?? {
          latitude: rep.currentLat,
          longitude: rep.currentLng,
        };

        // Simulate small movement
        const deltaLat =
          (Math.random() - 0.4) * CONFIG.MAX_MOVEMENT_DELTA;
        const deltaLng =
          (Math.random() - 0.3) * CONFIG.MAX_MOVEMENT_DELTA;

        const next = {
          latitude: base.latitude + deltaLat,
          longitude: base.longitude + deltaLng,
        };

        positionRef.current = next;
        return next;
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

  return {currentPosition, lastUpdated, isTracking};
}
