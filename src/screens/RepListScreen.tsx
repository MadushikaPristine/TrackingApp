import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ListRenderItem,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Rep, RootStackParamList} from '../types';
import {MOCK_REPS} from '../data/mockData';
import {COLORS} from '../constants/colors';
import StatusTag from '../components/common/StatusTag';

type NavProp = StackNavigationProp<RootStackParamList, 'RepList'>;

function ProgressBar({visited, total}: {visited: number; total: number}) {
  const pct = total > 0 ? (visited / total) * 100 : 0;
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, {width: `${pct}%`}]} />
    </View>
  );
}

function RepCard({rep, onPress}: {rep: Rep; onPress: (rep: Rep) => void}) {
  const handlePress = useCallback(() => onPress(rep), [onPress, rep]);
  const pct = Math.round((rep.visitedShops / rep.totalShops) * 100);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.75}>
      <View style={styles.cardRow}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: rep.isActive ? COLORS.primary : COLORS.unvisited}]}>
          <Text style={styles.avatarText}>{rep.avatar}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.repName}>{rep.name}</Text>
            {rep.isActive && (
              <StatusTag label="Live" color={COLORS.live} bgColor={COLORS.liveLight} />
            )}
          </View>
          <Text style={styles.zone}>{rep.zone}</Text>
          <Text style={styles.phone}>{rep.phone}</Text>

          {/* Progress */}
          <View style={styles.progressRow}>
            <ProgressBar visited={rep.visitedShops} total={rep.totalShops} />
            <Text style={styles.progressText}>
              {rep.visitedShops}/{rep.totalShops} shops · {pct}%
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RepListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [reps, setReps] = useState<Rep[]>(MOCK_REPS);
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = useCallback(
    (rep: Rep) => {
      navigation.navigate('RouteMap', {repId: rep.id, repName: rep.name});
    },
    [navigation],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setReps([...MOCK_REPS]);
      setRefreshing(false);
    }, 800);
  }, []);

  const renderItem: ListRenderItem<Rep> = useCallback(
    ({item}) => <RepCard rep={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: Rep) => item.id, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const activeCount = reps.filter(r => r.isActive).length;

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom}]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.dateText}>{today}</Text>
        <View style={styles.statsRow}>
          <StatChip label="Total Reps" value={String(reps.length)} color={COLORS.info} />
          <StatChip label="Active Now" value={String(activeCount)} color={COLORS.live} />
        </View>
      </View>

      <FlatList
        data={reps}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
      />
    </View>
  );
}

function StatChip({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <View style={[styles.statChip, {borderColor: color + '30', backgroundColor: color + '12'}]}>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  subHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  dateText: {color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12},
  statsRow: {flexDirection: 'row', gap: 10},
  statChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {fontSize: 22, fontWeight: '800'},
  statLabel: {fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2},
  list: {padding: 16},
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: {flexDirection: 'row', alignItems: 'flex-start'},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {color: COLORS.textInverse, fontSize: 16, fontWeight: '700'},
  cardInfo: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3},
  repName: {fontSize: 16, fontWeight: '700', color: COLORS.textPrimary},
  zone: {fontSize: 13, color: COLORS.textSecondary, marginBottom: 2},
  phone: {fontSize: 12, color: COLORS.textLight, marginBottom: 10},
  progressRow: {},
  progressBg: {
    height: 6,
    backgroundColor: COLORS.progressBg,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 3,
  },
  progressText: {fontSize: 12, color: COLORS.textSecondary, fontWeight: '500'},
  chevron: {fontSize: 26, color: COLORS.border, marginLeft: 8, marginTop: 8},
});
