import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

export type AdminTab = 'tableau' | 'emissions' | 'programme' | 'utilisateurs' | 'plus';

const ITEMS: { key: AdminTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'tableau', label: 'Tableau', icon: 'grid-outline' },
  { key: 'emissions', label: 'Émissions', icon: 'videocam-outline' },
  { key: 'programme', label: 'Programme', icon: 'browsers-outline' },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: 'people-outline' },
  { key: 'plus', label: 'Plus', icon: 'ellipsis-horizontal' },
];

export function AdminNav({ active, onSelect }: { active: AdminTab; onSelect: (t: AdminTab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {ITEMS.map((it) => {
        const on = it.key === active;
        return (
          <Pressable key={it.key} style={styles.item} onPress={() => onSelect(it.key)}>
            <Ionicons name={it.icon} size={22} color={on ? colors.red : colors.textDim} />
            <Text style={[styles.label, on && styles.on]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#0d0d0d', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { color: colors.textDim, fontFamily: fonts.medium, fontSize: 10 },
  on: { color: colors.red },
});
