import React, {useCallback, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, {Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList, Shop} from '../types';
import {COLORS} from '../constants/colors';
import {useRouteData} from '../hooks/useRouteData';
import {useLiveTracking} from '../hooks/useLiveTracking';
import {getBoundingBox, getRouteProgress, totalPathDistance, formatDistance} from '../utils/mapUtils';
import ShopMarker from '../components/map/ShopMarker';
import RepMarker from '../components/map/RepMarker';
import ShopDetailSheet, {ShopDetailSheetRef} from '../components/sheets/ShopDetailSheet';
import LoadingOverlay from '../components/common/LoadingOverlay';

type RouteParam = RouteProp<RootStackParamList, 'RouteMap'>;

export default function RouteMapScreen() {
  const {params} = useRoute<RouteParam>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<ShopDetailSheetRef>(null);

  const {route, rep, loading, error, refresh} = useRouteData(params.repId);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const {currentPosition, breadcrumbs, totalDistanceKm, lastUpdated} = useLiveTracking(
    params.repId,
    liveEnabled,
    route?.locationHistory ?? [],
  );

  const handleFitRoute = useCallback(() => {
    if (!route?.polylineCoords.length) {return;}
    const region = getBoundingBox(route.polylineCoords);
    mapRef.current?.animateToRegion(region, 600);
  }, [route]);

  const handleShopPress = useCallback((shop: Shop) => {
    sheetRef.current?.open(shop);
  }, []);

  const toggleLive = useCallback(() => {
    setLiveEnabled(prev => !prev);
  }, []);

  // Fit map once route loads
  useEffect(() => {
    if (route?.polylineCoords.length) {
      const timer = setTimeout(handleFitRoute, 500);
      return () => clearTimeout(timer);
    }
  }, [route, handleFitRoute]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = route ? getRouteProgress(route.shops) : 0;
  const visitedCount = route?.shops.filter(s => s.visitStatus === 'visited').length ?? 0;
  const totalCount = route?.shops.length ?? 0;

  // Planned route connecting all shop stops in sequence
  const plannedCoords = route?.polylineCoords ?? [];
  const plannedDistanceKm = totalPathDistance(plannedCoords);

  // Index of the last visited shop — remaining shops form the "ahead" segment
  const lastVisitedIdx = route
    ? [...route.shops]
        .reverse()
        .findIndex(s => s.visitStatus === 'visited')
    : -1;
  const lastVisitedSequence =
    lastVisitedIdx >= 0 && route
      ? route.shops.length - lastVisitedIdx
      : 0;

  // Remaining planned route: from last visited shop onward (dashed)
  const remainingCoords = route
    ? route.shops
        .filter(s => s.sequence >= lastVisitedSequence)
        .map(s => ({latitude: s.lat, longitude: s.lng}))
    : [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        showsScale
        mapType="standard"
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}>

        {/* ── Planned route: full dashed gray line connecting all shops ── */}
        {plannedCoords.length > 1 && (
          <Polyline
            coordinates={plannedCoords}
            strokeColor={COLORS.unvisited + '50'}
            strokeWidth={2}
            lineDashPattern={[6, 5]}
          />
        )}

        {/* ── Remaining planned route: bolder dashed from last visited shop ── */}
        {remainingCoords.length > 1 && (
          <Polyline
            coordinates={remainingCoords}
            strokeColor={COLORS.accent + 'CC'}
            strokeWidth={3}
            lineDashPattern={[10, 6]}
          />
        )}

        {/* ── Actual traveled path: breadcrumb GPS trail (3-second updates) ── */}
        {breadcrumbs.length > 1 && liveEnabled && (
          <Polyline
            coordinates={breadcrumbs}
            strokeColor={COLORS.live}
            strokeWidth={4}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* Shop markers */}
        {route?.shops.map(shop => (
          <ShopMarker key={shop.id} shop={shop} onPress={handleShopPress} />
        ))}

        {/* Live rep position at the tip of the breadcrumb trail */}
        {currentPosition && liveEnabled && (
          <RepMarker
            latitude={currentPosition.latitude}
            longitude={currentPosition.longitude}
          />
        )}
      </MapView>

      {loading && <LoadingOverlay message="Loading route..." />}

      {/* Map action buttons */}
      <View style={[styles.actionButtons, {top: insets.top + 60}]}>
        <TouchableOpacity style={styles.mapBtn} onPress={handleFitRoute}>
          <Text style={styles.mapBtnIcon}>⊞</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mapBtn, liveEnabled && styles.mapBtnActive]}
          onPress={toggleLive}>
          <Text style={[styles.mapBtnIcon, liveEnabled && styles.mapBtnIconActive]}>
            ◎
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, {top: insets.top + 60}]}>
        <LegendItem color={COLORS.live} label="Traveled path" solid />
        <LegendItem color={COLORS.accent} label="Remaining route" dashed />
        <LegendItem color={COLORS.visited} label="Visited shop" solid />
        <LegendItem color={COLORS.unvisited} label="Pending shop" solid />
      </View>

      {/* Bottom summary card */}
      <View style={[styles.bottomCard, {paddingBottom: insets.bottom + 16}]}>
        <View style={styles.bottomCardTop}>
          <View style={styles.repInfoRow}>
            <View style={styles.repAvatarSm}>
              <Text style={styles.repAvatarSmText}>{rep?.avatar ?? '??'}</Text>
            </View>
            <View>
              <Text style={styles.repNameSm}>{rep?.name ?? '—'}</Text>
              <Text style={styles.repZone}>{rep?.zone ?? ''}</Text>
            </View>
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressFraction}>{visitedCount}/{totalCount}</Text>
            <Text style={styles.progressLabel}>Shops</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
        </View>
        <Text style={styles.progressPct}>{progress}% complete</Text>

        {/* Distance row */}
        <View style={styles.distanceRow}>
          <DistanceStat
            label="Traveled"
            value={formatDistance(totalDistanceKm)}
            color={COLORS.live}
          />
          <View style={styles.distanceDivider} />
          <DistanceStat
            label="Planned"
            value={formatDistance(plannedDistanceKm)}
            color={COLORS.textSecondary}
          />
          <View style={styles.distanceDivider} />
          <DistanceStat
            label="Remaining"
            value={formatDistance(Math.max(0, plannedDistanceKm - totalDistanceKm))}
            color={COLORS.accent}
          />
        </View>

        {liveEnabled && (
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {breadcrumbs.length} GPS point{breadcrumbs.length !== 1 ? 's' : ''} · every 3s
              {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString()}` : ''}
            </Text>
          </View>
        )}
      </View>

      <ShopDetailSheet ref={sheetRef} />
    </View>
  );
}

function DistanceStat({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <View style={styles.distanceStat}>
      <Text style={[styles.distanceValue, {color}]}>{value}</Text>
      <Text style={styles.distanceLabel}>{label}</Text>
    </View>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  solid?: boolean;
  dashed?: boolean;
}

function LegendItem({color, label, solid, dashed}: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      {dashed ? (
        <View style={styles.legendDashRow}>
          <View style={[styles.legendDash, {backgroundColor: color}]} />
          <View style={[styles.legendDashGap]} />
          <View style={[styles.legendDash, {backgroundColor: color}]} />
        </View>
      ) : (
        <View style={[styles.legendDot, {backgroundColor: color}]} />
      )}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  map: {flex: 1},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorText: {fontSize: 16, color: COLORS.danger, textAlign: 'center', marginBottom: 16},
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {color: COLORS.textInverse, fontWeight: '600'},
  actionButtons: {position: 'absolute', right: 16, gap: 10},
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapBtnActive: {backgroundColor: COLORS.primary},
  mapBtnIcon: {fontSize: 20, color: COLORS.textPrimary},
  mapBtnIconActive: {color: COLORS.textInverse},
  legend: {
    position: 'absolute',
    left: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', marginVertical: 3},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 7},
  legendDashRow: {flexDirection: 'row', alignItems: 'center', marginRight: 7},
  legendDash: {width: 5, height: 3, borderRadius: 1},
  legendDashGap: {width: 3},
  legendLabel: {fontSize: 11, color: COLORS.textSecondary, fontWeight: '500'},
  bottomCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  repInfoRow: {flexDirection: 'row', alignItems: 'center'},
  repAvatarSm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  repAvatarSmText: {color: COLORS.textInverse, fontSize: 13, fontWeight: '700'},
  repNameSm: {fontSize: 15, fontWeight: '700', color: COLORS.textPrimary},
  repZone: {fontSize: 12, color: COLORS.textSecondary},
  progressStats: {alignItems: 'flex-end'},
  progressFraction: {fontSize: 22, fontWeight: '800', color: COLORS.primary},
  progressLabel: {fontSize: 11, color: COLORS.textSecondary},
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 4,
  },
  progressPct: {fontSize: 12, color: COLORS.textSecondary, fontWeight: '500'},
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.live,
    marginRight: 7,
  },
  liveText: {fontSize: 12, color: COLORS.live, fontWeight: '500'},
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  distanceStat: {flex: 1, alignItems: 'center'},
  distanceValue: {fontSize: 15, fontWeight: '700'},
  distanceLabel: {fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: '500'},
  distanceDivider: {width: 1, height: 28, backgroundColor: COLORS.borderLight},
});
