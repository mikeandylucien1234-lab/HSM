import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShowListItem } from '../components/ShowListItem';
import { Chips } from '../components/Chips';
import { fetchShows } from '../data/repository';
import { useAuth } from '../lib/auth';
import type { Show } from '../types';

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'PODCAST', label: 'Podcast' },
  { key: 'RAP KREYÒL', label: 'Rap Kreyòl' },
  { key: 'DÉBAT', label: 'Débat' },
  { key: 'COLLAB', label: 'Collab' },
];

export function ShowsScreen() {
  const { isMember } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchShows().then((s) => { setShows(s); setLoading(false); });
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? shows : shows.filter((s) => s.category === filter)),
    [shows, filter]
  );

  return (
    <View style={styles.root}>
      <ScreenHeader title="Émissions" subtitle="Tout le catalogue HSM" />
      <Chips items={FILTERS} active={filter} onSelect={setFilter} />
      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <ShowListItem show={item} index={index} isMember={isMember} />
          )}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucune émission dans cette catégorie.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, opacity: 0.5 },
  empty: { color: colors.textDim, fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing.xxl },
});
