import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../theme';

/** Menu utilisateur (hamburger) — identique à la maquette HSM_Home. */
const MEDIA_ITEMS = [
  { key: 'apropos', label: 'À propos' },
  { key: 'contact', label: 'Contact & booking' },
  { key: 'presse', label: 'Presse' },
  { key: 'confidentialite', label: 'Confidentialité' },
  { key: 'evenements', label: 'Événements' },
  { key: 'playlists', label: 'Mes playlists' },
];

export function Drawer({
  visible,
  onClose,
  onNavigate,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.panel, { paddingTop: insets.top + spacing.md }]}>
        <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.header}>MÉDIA</Text>
        {MEDIA_ITEMS.map((it) => (
          <Pressable key={it.key} onPress={() => { onClose(); onNavigate(it.key); }}>
            <Text style={styles.item}>{it.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => { onClose(); onNavigate('admin'); }}>
          <Text style={styles.admin}>Admin</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    position: 'absolute', top: 0, bottom: 0, right: 0, width: '72%',
    backgroundColor: '#0d0d0d', paddingHorizontal: spacing.xl,
    borderLeftWidth: 1, borderLeftColor: colors.border,
  },
  close: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  header: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.5, marginBottom: spacing.lg },
  item: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, paddingVertical: spacing.md },
  admin: { color: colors.gold, fontFamily: fonts.bold, fontSize: 20, paddingVertical: spacing.md },
});
