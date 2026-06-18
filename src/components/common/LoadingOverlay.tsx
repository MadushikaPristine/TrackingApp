import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {COLORS} from '../../constants/colors';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({message = 'Loading...'}: LoadingOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,250,0.85)',
    zIndex: 99,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
