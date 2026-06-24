import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../../constants/colors';

type StatusType = 'visited' | 'unvisited' | 'skipped';
type SizeType = 'sm' | 'md' | 'lg';

interface BadgeProps {
  status: StatusType;
  size?: SizeType;
}

const STATUS_CONFIG: Record<StatusType, {label: string; bg: string; text: string}> = {
  visited: {label: 'Visited', bg: COLORS.visitedLight, text: COLORS.visited},
  unvisited: {label: 'Pending', bg: COLORS.unvisitedLight, text: COLORS.unvisited},
  skipped: {label: 'Skipped', bg: COLORS.skippedLight, text: COLORS.skipped},
};

const SIZE_CONFIG: Record<SizeType, {px: number; py: number; fontSize: number; radius: number}> = {
  sm: {px: 8, py: 3, fontSize: 10, radius: 10},
  md: {px: 10, py: 4, fontSize: 12, radius: 12},
  lg: {px: 14, py: 6, fontSize: 14, radius: 14},
};

export default function Badge({status, size = 'md'}: BadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const sz = SIZE_CONFIG[size];
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          paddingHorizontal: sz.px,
          paddingVertical: sz.py,
          borderRadius: sz.radius,
        },
      ]}>
      <Text style={[styles.text, {color: cfg.text, fontSize: sz.fontSize}]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {alignSelf: 'flex-start'},
  text: {fontWeight: '600', letterSpacing: 0.3},
});
