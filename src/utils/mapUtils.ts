import {Shop} from '../types';

export interface Coordinate {
  latitude: number;
  longitude: number;
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
