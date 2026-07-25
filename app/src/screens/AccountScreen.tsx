import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { Seal } from '../components/Logo';
import { useAuth } from '../lib/auth';

export function AccountScreen() {
  const { session, profile, loading, configured, isMember, isAdmin, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  if (!session) return <AuthForm configured={configured} onSignIn={signIn} onSignUp={signUp} />;

  const name = profile?.full_name ?? profile?.email ?? 'Membre';
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const roleLabel = isAdmin ? 'Admin' : isMember ? 'Star Member' : 'Membre';

  return (
    <View style={styles.root}>
      <ScreenHeader title="Compte" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.profileCard}>
          <View style={styles.bigAvatar}><Text style={styles.bigAvatarText}>{initials}</Text></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={[styles.roleTag, isMember && styles.roleTagStar]}>
            <Ionicons name={isMember ? 'star' : 'person'} size={12} color={isMember ? '#1a1200' : colors.text} />
            <Text style={[styles.roleText, isMember && styles.roleTextStar]}>{roleLabel}</Text>
          </View>
        </View>

        {!isMember && (
          <Pressable style={styles.upsell}>
            <View style={{ flex: 1 }}>
              <Text style={styles.upsellTitle}>Devenir Star Member</Text>
              <Text style={styles.upsellSub}>Accès premium, lives privés & accès anticipé.</Text>
            </View>
            <Ionicons name="star" size={22} color={colors.gold} />
          </Pressable>
        )}

        <View style={styles.menu}>
          {[
            { icon: 'heart', label: 'Favoris' },
            { icon: 'time', label: 'Historique' },
            { icon: 'list', label: 'Mes playlists' },
            { icon: 'notifications', label: 'Notifications' },
          ].map((row) => (
            <Pressable key={row.label} style={styles.menuRow}>
              <Ionicons name={row.icon as any} size={18} color={colors.textMuted} />
              <Text style={styles.menuLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function AuthForm({
  configured,
  onSignIn,
  onSignUp,
}: {
  configured: boolean;
  onSignIn: (e: string, p: string) => Promise<{ error?: string }>;
  onSignUp: (e: string, p: string, n: string) => Promise<{ error?: string }>;
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setError(null); setNotice(null); setBusy(true);
    const res = mode === 'login'
      ? await onSignIn(email.trim(), password)
      : await onSignUp(email.trim(), password, fullName.trim());
    setBusy(false);
    if (res.error) setError(res.error);
    else if (mode === 'signup') setNotice('Compte créé ! Vérifie ton email pour confirmer.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.authWrap} keyboardShouldPersistTaps="handled">
        <Seal size={54} />
        <Text style={styles.authTitle}>
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </Text>
        <Text style={styles.authSub}>Haitian Stars Media — rejoins la diaspora</Text>

        {!configured && (
          <Text style={styles.warn}>
            Backend non configuré : renseigne les clés Supabase pour activer les comptes.
          </Text>
        )}

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor={colors.textDim}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textDim}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor={colors.textDim}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <Pressable style={styles.submit} onPress={submit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.submitText}>
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setNotice(null); }}>
          <Text style={styles.switch}>
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },

  profileCard: { alignItems: 'center', paddingVertical: spacing.lg },
  bigAvatar: {
    width: 84, height: 84, borderRadius: radius.pill, backgroundColor: colors.surfaceHi,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  bigAvatarText: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 28 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  email: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  roleTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.md,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill,
    backgroundColor: colors.surfaceHi,
  },
  roleTagStar: { backgroundColor: colors.gold },
  roleText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  roleTextStar: { color: '#1a1200' },

  upsell: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg,
    padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(232,178,61,0.35)', backgroundColor: 'rgba(232,178,61,0.06)',
  },
  upsellTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  upsellSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },

  menu: { marginTop: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },

  signOut: {
    marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  signOutText: { color: colors.red, fontFamily: fonts.bold, fontSize: 14 },

  authWrap: { padding: spacing.xl, paddingTop: 80, alignItems: 'stretch' },
  authTitle: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 26, marginTop: spacing.lg },
  authSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 13, marginBottom: spacing.xl },
  warn: {
    color: colors.gold, fontFamily: fonts.regular, fontSize: 12, marginBottom: spacing.md,
    backgroundColor: 'rgba(232,178,61,0.08)', padding: spacing.md, borderRadius: radius.md,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, fontSize: 15,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  error: { color: colors.redHover, fontFamily: fonts.regular, fontSize: 13, marginBottom: spacing.sm },
  notice: { color: colors.success, fontFamily: fonts.regular, fontSize: 13, marginBottom: spacing.sm },
  submit: {
    backgroundColor: colors.red, borderRadius: radius.pill, paddingVertical: spacing.md,
    alignItems: 'center', marginTop: spacing.sm,
  },
  submitText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  switch: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13, textAlign: 'center', marginTop: spacing.lg },
});
