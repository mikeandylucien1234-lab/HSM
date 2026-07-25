import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';

/**
 * Capture toute erreur de rendu et l'affiche à l'écran,
 * au lieu de laisser un écran noir muet (utile en build de test).
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[HSM] Render error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Une erreur est survenue</Text>
            <Text style={styles.msg}>{this.state.error.message}</Text>
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingTop: 80 },
  title: { color: colors.red, fontFamily: fonts.bold, fontSize: 20, marginBottom: spacing.md },
  msg: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14, marginBottom: spacing.lg },
  stack: { color: colors.textDim, fontSize: 11, fontFamily: 'monospace' },
});
