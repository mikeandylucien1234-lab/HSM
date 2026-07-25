import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

/**
 * Vignette de contenu : affiche l'image si disponible, sinon un dégradé
 * placeholder (les visuels des maquettes ne sont pas encore importés).
 */
export function Thumb({
  uri,
  seed = 0,
  style,
  rounded = radius.md,
  icon = 'play',
}: {
  uri?: string | null;
  seed?: number;
  style?: StyleProp<ViewStyle & ImageStyle>;
  rounded?: number;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const palettes: [string, string][] = [
    ['#3a0d10', '#1a1a1a'],
    ['#2a1810', '#141414'],
    ['#241016', '#171717'],
    ['#101f2a', '#141414'],
  ];
  const [a, b] = palettes[seed % palettes.length];

  if (uri) {
    return <Image source={{ uri }} style={[{ borderRadius: rounded }, style as StyleProp<ImageStyle>]} />;
  }
  return (
    <LinearGradient colors={[a, b]} style={[styles.base, { borderRadius: rounded }, style as StyleProp<ViewStyle>]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.textDim} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconWrap: { opacity: 0.7 },
});
