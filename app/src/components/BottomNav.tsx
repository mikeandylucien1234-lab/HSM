import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

export interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/** Navigation utilisateur — identique à la maquette HSM_Home. */
const ITEMS: NavItem[] = [
  { key: 'home', label: 'Accueil', icon: 'home' },
  { key: 'live', label: 'Live', icon: 'videocam' },
  { key: 'programme', label: 'Programme', icon: 'calendar' },
  { key: 'search', label: 'Recherche', icon: 'search' },
  { key: 'profil', label: 'Profil', icon: 'person' },
];

export function BottomNav({
  active = 'home',
  onSelect,
}: {
  active?: string;
  onSelect?: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {ITEMS.map((item) => {
        const on = item.key === active;
        return (
          <Pressable key={item.key} style={styles.item} onPress={() => onSelect?.(item.key)}>
            <Ionicons name={on ? item.icon : (`${item.icon}-outline` as any)} size={22} color={on ? colors.red : colors.textDim} />
            <Text style={[styles.label, on && styles.labelOn]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { color: colors.textDim, fontFamily: fonts.medium, fontSize: 10 },
  labelOn: { color: colors.red },
});
