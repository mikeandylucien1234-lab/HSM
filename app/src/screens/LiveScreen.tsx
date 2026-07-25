import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShowListItem } from '../components/ShowListItem';
import { fetchShows } from '../data/repository';
import { useAuth } from '../lib/auth';
import type { Show } from '../types';

export function LiveScreen() {
  const { isMember } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const all = await fetchShows();
    setShows(all.filter((s) => s.isLive));
    setLoading(false);
    setRefreshing(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader title="En direct" subtitle={`${shows.length} shows diffusent en ce moment`} />
      {loading ? (
        <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={shows}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <ShowListItem show={item} index={index} isMember={isMember} />
          )}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.red}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aucune émission en direct pour le moment.</Text>
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
