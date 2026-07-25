import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { colors } from '../theme';

/** Sceau HSM (repris du thumbnail SVG de la maquette) : cercle rouge + play or. */
export function Seal({ size = 34 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Circle cx="50" cy="50" r="42" fill="none" stroke={colors.red} strokeWidth={7} />
        <Polygon points="42,34 42,66 70,50" fill={colors.gold} />
      </Svg>
    </View>
  );
}
