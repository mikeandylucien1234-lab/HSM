import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import type { Show } from '../types';
import { Badge } from './Badge';
import { Thumb } from './Thumb';

/** Ligne d'émission (listes verticales : Live, Émissions). */
export function ShowListItem({
  show,
  index,
  isMember,
  onPress,
}: {
  show: Show;
  index: number;
  isMember: boolean;
  onPress?: () => void;
}) {
  const locked = (show.premium || show.membersOnly) && !isMember;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View>
        <Thumb uri={show.coverUrl} seed={index} style={styles.thumb} />
        {show.isLive && (
          <View style={styles.liveDot}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {locked && (
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={14} color={colors.gold} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{show.category}</Text>
        <Text style={styles.title} numberOfLines={1}>{show.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{show.description}</Text>
        <View style={styles.metaRow}>
          {show.isLive ? (
            <>
              <Ionicons name="eye" size={13} color={colors.textDim} />
              <Text style={styles.meta}>{show.viewers.toLocaleString('fr-FR')} spectateurs</Text>
            </>
          ) : (
            <Text style={styles.meta}>Hors ligne</Text>
          )}
          {show.premium && <Badge label="STAR" bg={colors.gold} color="#1a1200" />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  thumb: { width: 130, height: 76 },
  liveDot: {
    position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.red, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.text },
  liveText: { color: colors.text, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5 },
  lock: {
    position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4, borderRadius: radius.pill,
  },
  info: { flex: 1, justifyContent: 'center' },
  category: { color: colors.red, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, marginTop: 2 },
  desc: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  meta: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11 },
});
