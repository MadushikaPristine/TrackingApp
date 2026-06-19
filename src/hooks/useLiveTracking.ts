/**
 * useLiveTracking
 *
 * Polls the FastAPI backend every POLLING_INTERVAL_MS for the rep's GPS
 * location. The backend stores breadcrumb pings posted by the rep's own
 * mobile app and returns the full trail plus the total distance travelled.
 * This manager app never accesses device location.
 */
import {useState, useEffect, useRef, useCallback} from 'react';
import {CONFIG} from '../constants/config';
import {api} from '../services/api';
import {GeoPoint} from '../types';

export type Position = GeoPoint;

interface UseLiveTrackingResult {
  currentPosition: Position | null;
  breadcrumbs: Position[];
  totalDistanceKm: number;
  lastUpdated: Date | null;
  isTracking: boolean;
  error: string | null;
}

export function useLiveTracking(
  repId: string,
  enabled: boolean,
  initialHistory: GeoPoint[] = [],
): UseLiveTrackingResult {
  const initialPos =
    initialHistory.length > 0 ? initialHistory[initialHistory.length - 1] : null;

  const [currentPosition, setCurrentPosition] = useState<Position | null>(initialPos);
  const [breadcrumbs, setBreadcrumbs] = useState<Position[]>(initialHistory);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against overlapping requests if one poll is slower than the interval
  const inFlightRef = useRef(false);

  const poll = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    try {
      const data = await api.getLocation(repId);
      const trimmed =
        data.history.length > CONFIG.MAX_BREADCRUMB_POINTS
          ? data.history.slice(data.history.length - CONFIG.MAX_BREADCRUMB_POINTS)
          : data.history;
      setBreadcrumbs(trimmed);
      setCurrentPosition(data.currentPosition);
      setTotalDistanceKm(data.totalDistanceKm);
      setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch location');
    } finally {
      inFlightRef.current = false;
    }
  }, [repId]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    setIsTracking(true);
    poll(); // immediate first fetch
    intervalRef.current = setInterval(poll, CONFIG.POLLING_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
    };
  }, [enabled, poll]);

  return {
    currentPosition,
    breadcrumbs,
    totalDistanceKm,
    lastUpdated,
    isTracking,
    error,
  };
}
