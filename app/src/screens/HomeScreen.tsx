import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';
import { Wordmark } from '../components/Wordmark';
import { ShowCard } from '../components/ShowCard';
import { ContentRow } from '../components/ContentRow';
import { PollCard } from '../components/PollCard';
import { Thumb } from '../components/Thumb';
import type { Show, ContentSection, Poll, Partner } from '../types';
import {
  fetchShows, fetchContentSections, fetchActivePoll, fetchPartners,
} from '../data/repository';
import {
  mockNotifications, mockEvent, mockContinueWatching,
} from '../data/mock';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [top, setTop] = useState<ContentSection[]>([]);
  const [bottom, setBottom] = useState<ContentSection[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    (async () => {
      const [s, sections, p, pa] = await Promise.all([
        fetchShows(), fetchContentSections(), fetchActivePoll(), fetchPartners(),
      ]);
      setShows(s);
      setTop(sections.top);
      setBottom(sections.bottom);
      setPoll(p);
      setPartners(pa);
      setLoading(false);
    })();
  }, []);

  const liveCount = shows.filter((s) => s.isLive).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Wordmark />
        <View style={styles.headerActions}>
          <Ionicons name="search" size={22} color={colors.text} />
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {mockNotifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mockNotifications.length}</Text>
              </View>
            )}
          </View>
          <Ionicons name="menu" size={24} color={colors.text} />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.red} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <Thumb seed={0} style={styles.heroImg} rounded={0} />
            <LinearGradient
              colors={['transparent', 'rgba(10,10,10,0.6)', colors.bg]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.liveTag}>
                <View style={styles.dot} />
                <Text style={styles.liveTagText}>INTERVIEW EN DIRECT</Text>
              </View>
              <Text style={styles.heroTitle}>
                VLAD ENJOY sou plato — tout verite yo san filt
              </Text>
              <Text style={styles.heroSub} numberOfLines={2}>
                L'émission-phare de Haitian Stars Media. Interviews, débats,
                punchlines et analyses sur le rap kreyòl et le showbiz haïtien.
              </Text>
              <View style={styles.heroBtns}>
                <Pressable style={styles.btnPrimary}>
                  <Ionicons name="play" size={16} color={colors.text} />
                  <Text style={styles.btnPrimaryText}>Regarder maintenant</Text>
                </Pressable>
                <Pressable style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Devenir Star Member</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Événement spécial */}
          <View style={styles.eventBanner}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventTag}>ÉVÉNEMENT SPÉCIAL</Text>
              <Text style={styles.eventTitle}>{mockEvent.title}</Text>
              <Text style={styles.eventCountdown}>Commence dans {mockEvent.countdown}</Text>
            </View>
            <Ionicons name="trophy" size={30} color={colors.gold} />
          </View>

          {/* Continuer à regarder */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Continuer à regarder</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {mockContinueWatching.map((cw, i) => (
              <View key={cw.id} style={styles.cwItem}>
                <Thumb seed={i} style={styles.cwThumb} />
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${cw.progress * 100}%` }]} />
                </View>
                <Text style={styles.cwTitle} numberOfLines={1}>{cw.title}</Text>
                <Text style={styles.cwRemaining}>{cw.remaining}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Émissions en direct */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Émissions en direct</Text>
            <Pressable
              style={[styles.memberToggle, isMember && styles.memberToggleOn]}
              onPress={() => setIsMember((m) => !m)}
            >
              <Text style={[styles.memberToggleText, isMember && styles.memberToggleTextOn]}>
                démo: Star Member {isMember ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.liveCount}>
            {liveCount} shows diffusent en ce moment
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {shows.map((show, i) => (
              <ShowCard key={show.id} show={show} index={i} isMember={isMember} />
            ))}
          </ScrollView>

          {/* Rangées de contenu (haut) */}
          {top.map((section) => (
            <ContentRow key={section.title} section={section} />
          ))}

          {/* Sondage */}
          {poll && <PollCard poll={poll} />}

          {/* Rangées de contenu (bas) */}
          {bottom.map((section) => (
            <ContentRow key={section.title} section={section} />
          ))}

          {/* Partenaires */}
          <View style={styles.partnersBox}>
            <Text style={styles.partnersTitle}>Partenaires</Text>
            <Text style={styles.partnersSub}>
              Un espace dédié à nos partenaires. Votre logo peut apparaître ici.
            </Text>
            <View style={styles.partnersRow}>
              {partners.map((p) => (
                <View key={p.id} style={styles.partnerChip}>
                  <Text style={styles.partnerLabel}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Wordmark />
            <Text style={styles.footerText}>
              Interviews, analyses et débats sur le rap kreyòl et le showbiz
              haïtien — pour la diaspora et tous les fans du mouvement.
            </Text>
            <Text style={styles.copyright}>
              © 2026 Haitian Stars Media — Fèt ak lanmou pou dyaspora a.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: colors.bg,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: {
    position: 'absolute', top: -6, right: -8, backgroundColor: colors.red,
    minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.text, fontFamily: fonts.bold, fontSize: 10 },

  hero: { height: 340, justifyContent: 'flex-end' },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroContent: { padding: spacing.lg },
  liveTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: colors.red, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.sm, marginBottom: spacing.md,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.text },
  liveTagText: { color: colors.text, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
  heroTitle: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 31 },
  heroSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: spacing.sm },
  heroBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.red,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill,
  },
  btnPrimaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  btnGhost: {
    justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
  },
  btnGhostText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },

  eventBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(232,178,61,0.35)', backgroundColor: 'rgba(232,178,61,0.06)',
  },
  eventLeft: { flex: 1 },
  eventTag: { color: colors.gold, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1 },
  eventTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, marginTop: 3 },
  eventCountdown: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },

  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18 },
  hScroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },

  cwItem: { width: 200, marginRight: spacing.md },
  cwThumb: { width: 200, height: 112 },
  progressTrack: { height: 3, backgroundColor: colors.surfaceHi, borderRadius: 2, marginTop: 6 },
  progressFill: { height: 3, backgroundColor: colors.red, borderRadius: 2 },
  cwTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13, marginTop: 6 },
  cwRemaining: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },

  liveCount: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, paddingHorizontal: spacing.lg },
  memberToggle: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border,
  },
  memberToggleOn: { backgroundColor: 'rgba(232,178,61,0.15)', borderColor: colors.gold },
  memberToggleText: { color: colors.textDim, fontFamily: fonts.semibold, fontSize: 11 },
  memberToggleTextOn: { color: colors.gold },

  partnersBox: {
    marginHorizontal: spacing.lg, marginTop: spacing.xxl, padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  partnersTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  partnersSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 4, lineHeight: 17 },
  partnersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  partnerChip: {
    width: 64, height: 40, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  partnerLabel: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 11 },

  footer: {
    marginTop: spacing.xxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md,
  },
  footerText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  copyright: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 12, marginTop: spacing.sm },
});
