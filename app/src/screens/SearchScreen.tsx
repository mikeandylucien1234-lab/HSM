import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';
import { ShowListItem } from '../components/ShowListItem';
import { fetchShows } from '../data/repository';
import { useAuth } from '../lib/auth';
import type { Show } from '../types';

const SUGGESTIONS = ['vlad enjoy', 'sajes', 'baky', 'rap kreyòl', 'podcast', 'interview'];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { isMember } = useAuth();
  const [q, setQ] = useState('');
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => { fetchShows().then(setShows); }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return shows.filter((s) => s.title.toLowerCase().includes(t) || s.description.toLowerCase().includes(t) || s.category.toLowerCase().includes(t));
  }, [q, shows]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={19} color={colors.textDim} />
        <TextInput
          style={styles.input} value={q} onChangeText={setQ} autoFocus
          placeholder="Rechercher une émission, un invité…" placeholderTextColor={colors.textDim}
        />
        {q.length > 0 && <Ionicons name="close-circle" size={18} color={colors.textDim} onPress={() => setQ('')} />}
      </View>

      {q.trim() === '' ? (
        <View style={styles.suggest}>
          <Text style={styles.suggestTitle}>Recherches populaires</Text>
          <View style={styles.tags}>
            {SUGGESTIONS.map((s) => (
              <Text key={s} style={styles.tag} onPress={() => setQ(s)}>{s}</Text>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => <ShowListItem show={item} index={index} isMember={isMember} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          ListEmptyComponent={<Text style={styles.empty}>Aucun résultat pour « {q} ».</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 48 },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  suggest: { padding: spacing.lg },
  suggestTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, marginBottom: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, opacity: 0.5 },
  empty: { color: colors.textDim, fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing.xxl },
});
