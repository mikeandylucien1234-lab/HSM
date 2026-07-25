import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { Seal } from './Logo';

/** Lockup "HAITIAN STARS MEDIA" du header. */
export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Seal size={size} />
      <View style={styles.words}>
        <Text style={styles.line}>HAITIAN</Text>
        <Text style={[styles.line, styles.red]}>STARS</Text>
        <Text style={styles.line}>MEDIA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  words: { flexDirection: 'row', gap: 5 },
  line: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 13, letterSpacing: 1 },
  red: { color: colors.red },
});
