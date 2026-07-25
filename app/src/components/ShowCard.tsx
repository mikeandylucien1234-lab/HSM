import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import type { Show } from '../types';
import { Badge } from './Badge';
import { Thumb } from './Thumb';

/** Carte d'émission — rangée "Émissions en direct". */
export function ShowCard({
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
  const locked = (show.premium || show.earlyAccess || show.membersOnly) && !isMember;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Thumb uri={show.coverUrl} seed={index} style={styles.cover} rounded={radius.md} />
        <View style={styles.topRow}>
          <Badge
            label={show.isLive ? 'LIVE' : 'OFFLINE'}
            bg={show.isLive ? colors.live : colors.offline}
          />
          {show.premium && <Badge label="STAR" bg={colors.gold} color="#1a1200" />}
          {show.earlyAccess && !show.premium && <Badge label="BIENTÔT DISPONIBLE" bg={colors.surfaceHi} />}
        </View>
        {show.isLive && (
          <View style={styles.viewers}>
            <Ionicons name="eye" size={12} color={colors.text} />
            <Text style={styles.viewersText}>{show.viewers.toLocaleString('fr-FR')}</Text>
          </View>
        )}
        {locked && (
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={18} color={colors.gold} />
          </View>
        )}
      </View>
      <Text style={styles.category}>{show.category}</Text>
      <Text style={styles.title} numberOfLines={1}>{show.title}</Text>
      <Text style={styles.desc} numberOfLines={2}>{show.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 220, marginRight: spacing.md },
  cover: { width: 220, height: 128 },
  topRow: {
    position: 'absolute', top: spacing.sm, left: spacing.sm,
    flexDirection: 'row', gap: 6,
  },
  viewers: {
    position: 'absolute', bottom: spacing.sm, left: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: radius.sm,
  },
  viewersText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  lock: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: radius.pill,
  },
  category: { color: colors.red, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, marginTop: spacing.sm },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, marginTop: 2 },
  desc: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2, lineHeight: 16 },
});
