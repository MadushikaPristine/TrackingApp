import {Shop} from '../types';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

/** Haversine formula — returns distance in kilometres between two coordinates. */
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Sum of haversine segments across an ordered coordinate array (km). */
export function totalPathDistance(coords: Coordinate[]): number {
  if (coords.length < 2) {return 0;}
  let dist = 0;
  for (let i = 1; i < coords.length; i++) {
    dist += haversineDistance(coords[i - 1], coords[i]);
  }
  return dist;
}

/** Format a km value for display: "0.3 km" or "12.4 km". */
export function formatDistance(km: number): string {
  if (km < 0.1) {return `${Math.round(km * 1000)} m`;}
  return `${km.toFixed(1)} km`;
}

export function getRouteProgress(shops: Shop[]): number {
  if (!shops.length) {return 0;}
  const done = shops.filter(s => s.visitStatus === 'visited').length;
  return Math.round((done / shops.length) * 100);
}

export function formatVisitTime(time?: string): string {
  if (!time) {return 'Not visited';}
  return time;
}

export function formatCurrency(amount?: number): string {
  if (!amount) {return '—';}
  return `LKR ${amount.toLocaleString('en-LK')}`;
}

export function getCenterCoordinate(coords: Coordinate[]): Coordinate {
  if (!coords.length) {return {latitude: 6.9271, longitude: 79.8612};}
  const lat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
  const lng = coords.reduce((s, c) => s + c.longitude, 0) / coords.length;
  return {latitude: lat, longitude: lng};
}

export function getBoundingBox(coords: Coordinate[]) {
  if (!coords.length) {
    return {latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.05, longitudeDelta: 0.05};
  }
  const lats = coords.map(c => c.latitude);
  const lngs = coords.map(c => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.015;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: maxLat - minLat + pad * 2,
    longitudeDelta: maxLng - minLng + pad * 2,
  };
}
