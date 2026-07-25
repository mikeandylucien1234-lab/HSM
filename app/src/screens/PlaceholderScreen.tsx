import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../theme';

/** Écran temporaire — à remplacer par les vrais écrans (Live, Shows, Charts, Compte). */
export function PlaceholderScreen({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Ionicons name="construct-outline" size={40} color={colors.textDim} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>Écran à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  sub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 13 },
});
