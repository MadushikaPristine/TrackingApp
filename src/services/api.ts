/**
 * Thin REST client for the TrackingApp FastAPI backend.
 *
 * All endpoints return camelCase JSON that maps directly onto the app's
 * domain types, so responses can be consumed without transformation.
 */
import {API_BASE_URL} from '../constants/config';
import {GeoPoint, Rep, Route} from '../types';

export interface LiveLocation {
  currentPosition: GeoPoint | null;
  history: GeoPoint[];
  totalDistanceKm: number;
  lastUpdated: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {'Content-Type': 'application/json', ...init?.headers},
    });
  } catch (e) {
    throw new ApiError(0, 'Network request failed. Is the backend running?');
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // non-JSON error body — keep default message
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
}

export const api = {
  getReps: (signal?: AbortSignal) => request<Rep[]>('/reps', {signal}),

  getRep: (repId: string, signal?: AbortSignal) =>
    request<Rep>(`/reps/${repId}`, {signal}),

  getRoute: (repId: string, signal?: AbortSignal) =>
    request<Route>(`/reps/${repId}/route`, {signal}),

  getLocation: (repId: string, signal?: AbortSignal) =>
    request<LiveLocation>(`/reps/${repId}/location`, {signal}),

  postLocation: (repId: string, point: GeoPoint) =>
    request<LiveLocation>(`/reps/${repId}/location`, {
      method: 'POST',
      body: JSON.stringify(point),
    }),
};
