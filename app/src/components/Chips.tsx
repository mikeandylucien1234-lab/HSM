import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

export function Chips({
  items,
  active,
  onSelect,
}: {
  items: { key: string; label: string }[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable
            key={it.key}
            style={[styles.chip, on && styles.chipOn]}
            onPress={() => onSelect(it.key)}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.red, borderColor: colors.red },
  label: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13 },
  labelOn: { color: colors.text },
});
