import React, {useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Marker} from 'react-native-maps';
import {Shop} from '../../types';
import {COLORS} from '../../constants/colors';

interface ShopMarkerProps {
  shop: Shop;
  onPress: (shop: Shop) => void;
}

function getMarkerColors(status: Shop['visitStatus']) {
  switch (status) {
    case 'visited':
      return {bg: COLORS.visited, border: '#27AE60', text: COLORS.textInverse};
    case 'skipped':
      return {bg: COLORS.skipped, border: '#D68910', text: COLORS.textInverse};
    default:
      return {bg: COLORS.surface, border: COLORS.unvisited, text: COLORS.textSecondary};
  }
}

function ShopMarker({shop, onPress}: ShopMarkerProps) {
  const colors = getMarkerColors(shop.visitStatus);

  const handlePress = useCallback(() => {
    onPress(shop);
  }, [onPress, shop]);

  return (
    <Marker
      coordinate={{latitude: shop.lat, longitude: shop.lng}}
      onPress={handlePress}
      tracksViewChanges={false}>
      <View style={styles.wrapper}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.seq, {color: colors.text}]}>{shop.sequence}</Text>
        </View>
        <View style={[styles.arrow, {borderTopColor: colors.border}]} />
      </View>
    </Marker>
  );
}

export default React.memo(ShopMarker);

const styles = StyleSheet.create({
  wrapper: {alignItems: 'center'},
  bubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  seq: {fontSize: 13, fontWeight: '700'},
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
