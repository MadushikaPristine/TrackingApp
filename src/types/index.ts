export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitStatus: 'visited' | 'unvisited' | 'skipped';
  visitTime?: string;
  orderAmount?: number;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  sequence: number;
}

export interface Rep {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  zone: string;
  currentLat: number;
  currentLng: number;
  totalShops: number;
  visitedShops: number;
  isActive: boolean;
}

export interface Route {
  id: string;
  repId: string;
  date: string;
  shops: Shop[];
  /** Straight-line waypoints connecting shops in sequence (planned route). */
  polylineCoords: GeoPoint[];
  /**
   * GPS breadcrumb trail recorded by the rep's mobile app at 3-second
   * intervals and stored on the server. Covers the portion of the route
   * already traveled.
   */
  locationHistory: GeoPoint[];
  startTime: string;
  estimatedEndTime: string;
}

export type RootStackParamList = {
  RepList: undefined;
  RouteMap: {repId: string; repName: string};
};
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitStatus: 'visited' | 'unvisited' | 'skipped';
  visitTime?: string;
  orderAmount?: number;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  sequence: number;
}

export interface Rep {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  zone: string;
  currentLat: number;
  currentLng: number;
  totalShops: number;
  visitedShops: number;
  isActive: boolean;
}

export interface Route {
  id: string;
  repId: string;
  date: string;
  shops: Shop[];
  polylineCoords: {latitude: number; longitude: number}[];
  startTime: string;
  estimatedEndTime: string;
}

export type RootStackParamList = {
  RepList: undefined;
  RouteMap: {repId: string; repName: string};
};
