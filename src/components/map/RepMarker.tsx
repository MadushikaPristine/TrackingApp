import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {Marker} from 'react-native-maps';
import {COLORS} from '../../constants/colors';
import {CONFIG} from '../../constants/config';

interface RepMarkerProps {
  latitude: number;
  longitude: number;
}

export default function RepMarker({latitude, longitude}: RepMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.8,
            duration: CONFIG.PULSE_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: CONFIG.PULSE_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: CONFIG.PULSE_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: CONFIG.PULSE_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim, opacityAnim]);

  return (
    <Marker
      coordinate={{latitude, longitude}}
      tracksViewChanges={false}
      anchor={{x: 0.5, y: 0.5}}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.pulse,
            {transform: [{scale: pulseAnim}], opacity: opacityAnim},
          ]}
        />
        <View style={styles.dot}>
          <View style={styles.innerDot} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {width: 44, height: 44, justifyContent: 'center', alignItems: 'center'},
  pulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.live,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.live,
    borderWidth: 3,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.live,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
  },
});
