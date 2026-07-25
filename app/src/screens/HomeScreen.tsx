import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';
import { StarSeal } from '../components/Logo';
import { ShowListItem } from '../components/ShowListItem';
import { ContentRow } from '../components/ContentRow';
import { PollCard } from '../components/PollCard';
import { Thumb } from '../components/Thumb';
import type { Show, ContentSection, Poll, Partner, NotificationItem, HsmEvent } from '../types';
import {
  fetchShows, fetchContentSections, fetchActivePoll, fetchPartners,
  fetchFeaturedEvent, fetchNotifications,
} from '../data/repository';
import { mockEvent, mockContinueWatching } from '../data/mock';

export function HomeScreen({
  onOpenMenu,
  onNavigate,
}: {
  onOpenMenu?: () => void;
  onNavigate?: (tab: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [top, setTop] = useState<ContentSection[]>([]);
  const [bottom, setBottom] = useState<ContentSection[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [event, setEvent] = useState<HsmEvent | null>(mockEvent);

  useEffect(() => {
    (async () => {
      const [s, sections, p, pa, notifs, ev] = await Promise.all([
        fetchShows(), fetchContentSections(), fetchActivePoll(), fetchPartners(),
        fetchNotifications(), fetchFeaturedEvent(),
      ]);
      setShows(s); setTop(sections.top); setBottom(sections.bottom);
      setPoll(p); setPartners(pa); setNotifications(notifs); setEvent(ev);
      setLoading(false);
    })();
  }, []);

  const visibleShows = shows.filter((s) => !s.membersOnly || isMember);
  const liveCount = shows.filter((s) => s.isLive).length;
  const topLive = shows.find((s) => s.isLive);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={styles.brand}>
          <StarSeal size={38} />
          <View style={styles.words}>
            <Text style={styles.wHaitian}>HAITIAN </Text>
            <Text style={styles.wStars}>STARS </Text>
            <Text style={styles.wMedia}>MEDIA</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Ionicons name="search" size={22} color={colors.text} />
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {notifications.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{notifications.length}</Text></View>
            )}
          </View>
          <Pressable onPress={onOpenMenu} hitSlop={8}>
            <Ionicons name="menu" size={26} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.red} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          {/* Hero */}
          <View style={styles.hero}>
            <Thumb seed={0} style={styles.heroImg} rounded={0} />
            <LinearGradient colors={['transparent', 'rgba(10,10,10,0.55)', colors.bg]} style={StyleSheet.absoluteFill} />
            <View style={styles.heroContent}>
              <View style={styles.livePill}>
                <View style={styles.livePillDot} />
                <Text style={styles.livePillText}>INTERVIEW EN DIRECT</Text>
              </View>
              <Text style={styles.heroTitle}>
                VLAD ENJOY sou plato — <Text style={styles.heroTitleRed}>tout verite yo san filt</Text>
              </Text>
              <Text style={styles.heroSub}>
                L'émission-phare de Haitian Stars Media. Interviews, débats, punchlines et analyses
                sur le rap kreyòl et le showbiz haïtien. En direct depuis Miami, avec la diaspora en chat.
              </Text>
              <Pressable style={styles.btnPrimary}>
                <Ionicons name="play" size={16} color={colors.text} />
                <Text style={styles.btnPrimaryText}>Regarder maintenant</Text>
              </Pressable>
              <Pressable style={styles.btnGold}>
                <Ionicons name="star" size={15} color={colors.gold} />
                <Text style={styles.btnGoldText}>Devenir Star Member</Text>
              </Pressable>
              <Pressable style={styles.btnGhost} onPress={() => onNavigate?.('programme')}>
                <Ionicons name="information-circle-outline" size={16} color={colors.text} />
                <Text style={styles.btnGhostText}>Programme</Text>
              </Pressable>
            </View>
          </View>

          {/* Événement spécial */}
          {event && (
            <LinearGradient colors={['rgba(227,28,37,0.22)', 'rgba(20,20,20,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.eventBanner}>
              <View style={styles.eventPill}><Text style={styles.eventPillText}>ÉVÉNEMENT SPÉCIAL</Text></View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {!!event.countdown && <Text style={styles.eventCountdown}>Commence dans {event.countdown}</Text>}
            </LinearGradient>
          )}

          {/* Continuer à regarder */}
          <Text style={styles.h2}>Continuer à regarder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {mockContinueWatching.map((cw, i) => (
              <View key={cw.id} style={styles.cwItem}>
                <View>
                  <Thumb seed={i} style={styles.cwThumb} />
                  <View style={styles.cwTrack}><View style={[styles.cwFill, { width: `${cw.progress * 100}%` }]} /></View>
                </View>
                <Text style={styles.cwTitle} numberOfLines={1}>{cw.title}</Text>
                <Text style={styles.cwRemaining}>{cw.remaining}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Émissions en direct */}
          <View style={styles.liveHead}>
            <Text style={styles.h2NoMargin}>Émissions en direct</Text>
            <Pressable onPress={() => setIsMember((m) => !m)}>
              <Text style={styles.demoToggle}>démo: Star Member {isMember ? 'ON' : 'OFF'}</Text>
            </Pressable>
          </View>
          <Text style={styles.liveCount}>{liveCount} shows diffusent en ce moment</Text>
          <View style={styles.liveList}>
            {visibleShows.map((show, i) => (
              <View key={show.id}>
                <ShowListItem show={show} index={i} isMember={isMember} />
                {i < visibleShows.length - 1 && <View style={styles.sep} />}
              </View>
            ))}
          </View>

          {/* Sondage */}
          {poll && <PollCard poll={poll} />}

          {/* Rangées de contenu (haut) */}
          {top.map((section) => <ContentRow key={section.title} section={section} />)}

          {/* YouTube */}
          <View style={styles.youtubeBox}>
            <View style={styles.ytHeader}>
              <View style={styles.ytLogo}><Ionicons name="logo-youtube" size={22} color="#FF0000" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ytName}>HAITIAN STARS MEDIA</Text>
                <Text style={styles.ytMeta}>@haitianstarsmedia · 38,5K abonnés</Text>
              </View>
            </View>
            <Pressable style={styles.ytBtn}>
              <Ionicons name="logo-youtube" size={18} color={colors.text} />
              <Text style={styles.ytBtnText}>S'abonner sur YouTube</Text>
            </Pressable>
          </View>

          {/* Rangées de contenu (bas) */}
          {bottom.map((section) => <ContentRow key={section.title} section={section} />)}

          {/* Partenaires */}
          <Text style={styles.h2}>Partenaires</Text>
          <Text style={styles.partnersSub}>Un espace dédié à nos partenaires. Votre logo peut apparaître ici.</Text>
          <Pressable style={styles.partnerBtn}><Text style={styles.partnerBtnText}>Devenir partenaire</Text></Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {partners.map((p) => (
              <View key={p.id} style={styles.partnerLogo}><Text style={styles.partnerLogoText}>{p.label}</Text></View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.brand}>
              <StarSeal size={38} />
              <View style={styles.words}>
                <Text style={styles.wHaitian}>HAITIAN </Text><Text style={styles.wStars}>STARS </Text><Text style={styles.wMedia}>MEDIA</Text>
              </View>
            </View>
            <Text style={styles.footerText}>
              Interviews, analyses et débats sur le rap kreyòl et le showbiz haïtien — pour la diaspora
              et tous les fans du mouvement.
            </Text>
            <View style={styles.socials}>
              {(['logo-youtube', 'logo-instagram', 'logo-facebook'] as const).map((ic) => (
                <View key={ic} style={styles.social}><Ionicons name={ic} size={18} color={colors.text} /></View>
              ))}
            </View>
            <FooterCol title="Contenu" items={['En direct', 'Interviews', 'Podcasts', 'Shorts', 'Replay', 'Charts', 'Nouveautés', 'Top fans', 'Invités']} />
            <FooterCol title="Compte" items={['Se connecter', 'Star Member', 'Favoris', 'Historique']} />
            <FooterCol title="Média" items={['À propos', 'Contact & booking', 'Presse', 'Confidentialité']} />
            <Text style={styles.copyright}>© 2026 Haitian Stars Media — Fèt ak lanmou pou dyaspora a.</Text>
          </View>
        </ScrollView>
      )}

      {/* Pastille flottante "En direct" */}
      {topLive && (
        <Pressable style={[styles.floatLive, { bottom: spacing.lg }]} onPress={() => onNavigate?.('live')}>
          <View style={styles.floatDot} />
          <Text style={styles.floatText}>En{'\n'}direct</Text>
          <Text style={styles.floatViewers}>{topLive.viewers.toLocaleString('fr-FR')}</Text>
        </Pressable>
      )}
    </View>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.footerCol}>
      <Text style={styles.footerColTitle}>{title}</Text>
      {items.map((it) => <Text key={it} style={styles.footerLink}>{it}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.bg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  words: { flexDirection: 'row', alignItems: 'baseline' },
  wHaitian: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 15, letterSpacing: 0.5 },
  wStars: { color: colors.red, fontFamily: fonts.extrabold, fontSize: 15, letterSpacing: 0.5 },
  wMedia: { color: colors.textDim, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: {
    position: 'absolute', top: -6, right: -8, backgroundColor: colors.red,
    minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: colors.text, fontFamily: fonts.bold, fontSize: 10 },

  hero: { minHeight: 420, justifyContent: 'flex-end' },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroContent: { padding: spacing.lg },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: colors.red, backgroundColor: 'rgba(227,28,37,0.12)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, marginBottom: spacing.md,
  },
  livePillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red },
  livePillText: { color: colors.red, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  heroTitle: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 35 },
  heroTitleRed: { color: colors.red },
  heroSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: spacing.md },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.red,
    paddingVertical: spacing.md + 2, borderRadius: radius.pill, marginTop: spacing.lg,
  },
  btnPrimaryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  btnGold: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold, paddingVertical: spacing.md + 2, borderRadius: radius.pill, marginTop: spacing.md,
  },
  btnGoldText: { color: colors.gold, fontFamily: fonts.bold, fontSize: 15 },
  btnGhost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md + 2, borderRadius: radius.pill, marginTop: spacing.md,
  },
  btnGhostText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },

  eventBanner: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg },
  eventPill: { alignSelf: 'flex-start', backgroundColor: colors.red, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  eventPillText: { color: colors.text, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.5 },
  eventTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 19, marginTop: spacing.md },
  eventCountdown: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },

  h2: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 22, paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  h2NoMargin: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 22 },
  hScroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.md },

  cwItem: { width: 210 },
  cwThumb: { width: 210, height: 118 },
  cwTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  cwFill: { height: 4, backgroundColor: colors.red },
  cwTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14, marginTop: spacing.sm },
  cwRemaining: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },

  liveHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  demoToggle: { color: colors.textDim, fontFamily: 'monospace', fontSize: 12 },
  liveCount: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, paddingHorizontal: spacing.lg, marginTop: 2 },
  liveList: { marginTop: spacing.md },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, opacity: 0.5 },

  youtubeBox: { marginHorizontal: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  ytHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ytLogo: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  ytName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  ytMeta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  ytBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF0000', paddingVertical: spacing.md, borderRadius: radius.pill, marginTop: spacing.lg },
  ytBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },

  partnersSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, paddingHorizontal: spacing.lg, marginTop: -spacing.xs, lineHeight: 20 },
  partnerBtn: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.red, paddingVertical: spacing.md + 2, borderRadius: radius.pill, alignItems: 'center' },
  partnerBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  partnerLogo: { width: 84, height: 84, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  partnerLogoText: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 12 },

  footer: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: spacing.md },
  socials: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  social: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  footerCol: { marginTop: spacing.xl },
  footerColTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16, marginBottom: spacing.md },
  footerLink: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 15, paddingVertical: spacing.sm },
  copyright: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 13, marginTop: spacing.xl },

  floatLive: {
    position: 'absolute', right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.red, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill,
    shadowColor: colors.red, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  floatDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text },
  floatText: { color: colors.text, fontFamily: fonts.bold, fontSize: 13, lineHeight: 15 },
  floatViewers: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
});
