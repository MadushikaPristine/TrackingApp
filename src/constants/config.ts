import {Platform} from 'react-native';

/**
 * Base URL of the FastAPI backend.
 * - Android emulator reaches the host machine via 10.0.2.2
 * - iOS simulator can use localhost directly
 * - On a physical device, replace with your machine's LAN IP (e.g. http://192.168.1.20:8000)
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

export const CONFIG = {
  POLLING_INTERVAL_MS: 3000,
  MAX_BREADCRUMB_POINTS: 1200, // 1 hr of 3-second pings before oldest point drops off
  MAP_INITIAL_ZOOM_DELTA: 0.05,
  MAP_INITIAL_ZOOM_DELTA_LONG: 0.05,
  BOTTOM_SHEET_SNAP_POINTS: ['35%', '65%'],
  PULSE_ANIMATION_DURATION: 1200,
  MAP_PADDING: {top: 80, right: 40, bottom: 120, left: 40},
  MAX_MOVEMENT_DELTA: 0.0005,
} as const;
