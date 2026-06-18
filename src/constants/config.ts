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
