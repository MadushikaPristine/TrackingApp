import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface StatusTagProps {
  label: string;
  color: string;
  bgColor: string;
}

export default function StatusTag({label, color, bgColor}: StatusTagProps) {
  return (
    <View style={[styles.tag, {backgroundColor: bgColor}]}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={[styles.label, {color}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  label: {fontSize: 12, fontWeight: '600'},
});
