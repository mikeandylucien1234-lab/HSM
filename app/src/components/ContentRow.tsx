import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import type { ContentSection } from '../types';
import { Thumb } from './Thumb';

/** Rangée horizontale de vidéos avec titre + "Voir tout". */
export function ContentRow({ section }: { section: ContentSection }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{section.title}</Text>
        <Pressable hitSlop={8}>
          <Text style={styles.seeAll}>Voir tout</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {section.items.map((item, i) => (
          <Pressable key={item.id} style={styles.item}>
            <View>
              <Thumb
                uri={item.thumbUrl}
                seed={i + 1}
                style={styles.thumb}
                icon={item.showPlay ? 'play' : 'document-text'}
              />
              {item.showPlay && (
                <View style={styles.play}>
                  <Ionicons name="play" size={16} color={colors.text} />
                </View>
              )}
            </View>
            <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.meta} numberOfLines={1}>{item.meta}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  seeAll: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13 },
  scroll: { paddingHorizontal: spacing.lg },
  item: { width: 180, marginRight: spacing.md },
  thumb: { width: 180, height: 102 },
  play: {
    position: 'absolute', top: 34, left: 78,
    backgroundColor: 'rgba(227,28,37,0.9)', width: 32, height: 32, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13, marginTop: spacing.sm, lineHeight: 17 },
  meta: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11, marginTop: 3 },
});
