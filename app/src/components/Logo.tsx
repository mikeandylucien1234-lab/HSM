import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { colors } from '../theme';

/** Sceau HSM (thumbnail) : cercle rouge + play or. */
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

const STAR = '50,12 61,38 89,40 67,59 74,87 50,71 26,87 33,59 11,40 39,38';

/** Sceau du header d'accueil : cercle or + étoile or (identique à HSM_Home). */
export function StarSeal({ size = 40 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Circle cx="50" cy="50" r="46" fill="#141414" stroke={colors.gold} strokeWidth={3} />
        <Polygon points={STAR} fill={colors.gold} />
      </Svg>
    </View>
  );
}
