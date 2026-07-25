import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { Thumb } from '../components/Thumb';
import { PollCard } from '../components/PollCard';
import { fetchTopVideos, fetchTopFans, fetchActivePoll, TopFan } from '../data/repository';
import type { VideoItem, Poll } from '../types';

export function ChartsScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [fans, setFans] = useState<TopFan[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [v, f, p] = await Promise.all([
        fetchTopVideos(10), fetchTopFans(10), fetchActivePoll(),
      ]);
      setVideos(v); setFans(f); setPoll(p); setLoading(false);
    })();
  }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Charts" subtitle="Le meilleur du rap kreyòl cette semaine" />
      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          <Text style={styles.section}>Top vidéos</Text>
          {videos.map((v, i) => (
            <View key={v.id} style={styles.trackRow}>
              <Text style={styles.rank}>{i + 1}</Text>
              <Thumb uri={v.thumbUrl} seed={i} style={styles.trackThumb} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{v.title}</Text>
                <Text style={styles.trackMeta} numberOfLines={1}>{v.meta}</Text>
              </View>
              <Ionicons
                name={i < 3 ? 'trending-up' : 'remove'}
                size={16}
                color={i < 3 ? colors.success : colors.textDim}
              />
            </View>
          ))}

          <Text style={styles.section}>Top fans</Text>
          {fans.length === 0 ? (
            <Text style={styles.empty}>
              Le classement des fans s’activera dès les premiers membres inscrits.
            </Text>
          ) : (
            fans.map((f, i) => (
              <View key={f.id} style={styles.fanRow}>
                <Text style={[styles.rank, i < 3 && styles.rankGold]}>{i + 1}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {f.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.fanName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.fanPts}>{f.points} pts</Text>
              </View>
            ))
          )}

          {poll && <PollCard poll={poll} />}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: {
    color: colors.text, fontFamily: fonts.bold, fontSize: 17,
    paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  trackRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  rank: { color: colors.textDim, fontFamily: fonts.extrabold, fontSize: 16, width: 22, textAlign: 'center' },
  rankGold: { color: colors.gold },
  trackThumb: { width: 64, height: 40 },
  trackInfo: { flex: 1 },
  trackTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  trackMeta: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },
  fanRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  avatar: {
    width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surfaceHi,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  fanName: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  fanPts: { color: colors.gold, fontFamily: fonts.bold, fontSize: 13 },
  empty: {
    color: colors.textDim, fontFamily: fonts.regular, fontSize: 13,
    paddingHorizontal: spacing.lg, lineHeight: 18,
  },
});
