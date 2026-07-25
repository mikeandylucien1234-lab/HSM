import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { Thumb } from '../components/Thumb';
import { fetchSchedule, DaySchedule } from '../data/admin';

/** Programme utilisateur — grille hebdomadaire (même données que l'admin). */
export function ProgrammeScreen() {
  const [week, setWeek] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchSchedule().then((w) => { setWeek(w); setLoading(false); }); }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Programme" subtitle="La semaine sur Haitian Stars Media" />
      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <View style={styles.weekNav}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={styles.weekTitle}>Semaine du 21 juillet</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </View>
          {week.map((d) => (
            <View key={d.day}>
              <Text style={styles.dayName}>{d.day}</Text>
              {d.slots.length === 0
                ? <Text style={styles.noSlot}>Aucune émission prévue</Text>
                : d.slots.map((s) => (
                  <View key={s.id} style={styles.slot}>
                    <Text style={styles.slotTime}>{s.time}</Text>
                    <Thumb seed={s.seed} style={styles.slotThumb} rounded={radius.sm} />
                    <Text style={styles.slotTitle} numberOfLines={1}>{s.title}</Text>
                    {!!s.category && <View style={styles.slotCat}><Text style={styles.slotCatText}>{s.category}</Text></View>}
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  weekTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  dayName: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm },
  noSlot: { color: colors.textDim, fontFamily: fonts.regular, fontStyle: 'italic', fontSize: 13 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  slotTime: { color: colors.gold, fontFamily: fonts.bold, fontSize: 15, width: 48 },
  slotThumb: { width: 44, height: 32 },
  slotTitle: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  slotCat: { backgroundColor: colors.surfaceHi, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  slotCatText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5 },
});
