import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';
import type { Poll } from '../types';

/** Sondage interactif — un seul vote par utilisateur (local pour la démo). */
export function PollCard({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<string | null>(null);
  const bonus = voted ? 1 : 0;
  const total = poll.options.reduce((s, o) => s + o.votes, 0) + bonus;

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{poll.question}</Text>
      {poll.options.map((opt) => {
        const votes = opt.votes + (voted === opt.id ? 1 : 0);
        const pct = total ? Math.round((votes / total) * 100) : 0;
        const selected = voted === opt.id;
        return (
          <Pressable
            key={opt.id}
            style={styles.option}
            disabled={!!voted}
            onPress={() => setVoted(opt.id)}
          >
            <View style={styles.optionBg}>
              {voted && (
                <View
                  style={[
                    styles.fill,
                    { width: `${pct}%`, backgroundColor: selected ? colors.red : colors.surfaceHi },
                  ]}
                />
              )}
              <View style={styles.optionRow}>
                <Text style={[styles.optionLabel, selected && styles.optionLabelSel]} numberOfLines={1}>
                  {opt.label}
                </Text>
                {voted && <Text style={styles.pct}>{pct}%</Text>}
              </View>
            </View>
          </Pressable>
        );
      })}
      <Text style={styles.footer}>
        {total.toLocaleString('fr-FR')} votes · un seul vote par utilisateur
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg, marginTop: spacing.xl,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  question: { color: colors.text, fontFamily: fonts.bold, fontSize: 16, marginBottom: spacing.md },
  option: { marginBottom: spacing.sm },
  optionBg: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.md, overflow: 'hidden',
    height: 44, justifyContent: 'center',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.35 },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  optionLabel: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 14, flex: 1 },
  optionLabelSel: { color: colors.text },
  pct: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginLeft: spacing.sm },
  footer: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 12, marginTop: spacing.sm },
});
