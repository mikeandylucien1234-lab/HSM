import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { Chips } from '../components/Chips';
import { useAuth } from '../lib/auth';
import type { ContentKind, ShowStatus } from '../lib/database.types';
import {
  fetchAdminStats, fetchLatestMembers, fetchAdminShows, createShow,
  setShowLive, deleteShow, broadcastNotification,
  AdminStats, AdminMember, AdminShowRow,
} from '../data/admin';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'shows', label: 'Émissions' },
  { key: 'moderation', label: 'Modération' },
];

export function AdminScreen() {
  const { isAdmin, configured } = useAuth();
  const [tab, setTab] = useState('dashboard');

  if (!configured) {
    return <Gate icon="cloud-offline" text="Backend Supabase non configuré." />;
  }
  if (!isAdmin) {
    return <Gate icon="lock-closed" text="Accès réservé aux administrateurs." />;
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Bonjour Admin" subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} />
      <Chips items={TABS} active={tab} onSelect={setTab} />
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'shows' && <ShowsAdmin />}
      {tab === 'moderation' && <Moderation />}
    </View>
  );
}

function Gate({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={[styles.root, styles.center]}>
      <ScreenHeader title="Admin" />
      <View style={styles.center}>
        <Ionicons name={icon} size={40} color={colors.textDim} />
        <Text style={styles.gateText}>{text}</Text>
      </View>
    </View>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, m] = await Promise.all([fetchAdminStats(), fetchLatestMembers()]);
      setStats(s); setMembers(m); setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />;

  const cards = [
    { icon: 'tv', value: stats?.shows ?? 0, label: 'Émissions' },
    { icon: 'radio', value: stats?.live ?? 0, label: 'En direct' },
    { icon: 'film', value: stats?.videos ?? 0, label: 'Vidéos' },
    { icon: 'star', value: stats?.members ?? 0, label: 'Star Members' },
    { icon: 'people', value: stats?.users ?? 0, label: 'Utilisateurs' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <View style={styles.statsGrid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.statCard}>
            <Ionicons name={c.icon as any} size={18} color={colors.red} />
            <Text style={styles.statValue}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Dernières inscriptions Star Member</Text>
      {members.length === 0 ? (
        <Text style={styles.muted}>Aucun Star Member pour l’instant.</Text>
      ) : (
        members.map((m) => (
          <View key={m.id} style={styles.memberRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.memberName}>{m.name}</Text>
            <Text style={styles.memberDate}>{m.joined}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const KINDS: { key: ContentKind; label: string }[] = [
  { key: 'interview', label: 'Interview' },
  { key: 'podcast', label: 'Podcast' },
  { key: 'rap_kreyol', label: 'Rap Kreyòl' },
  { key: 'debat', label: 'Débat' },
  { key: 'collab', label: 'Collab' },
];
const STATUSES: { key: ShowStatus; label: string }[] = [
  { key: 'live', label: 'En direct' },
  { key: 'scheduled', label: 'Programmé' },
  { key: 'offline', label: 'Hors ligne' },
  { key: 'draft', label: 'Brouillon' },
];

function ShowsAdmin() {
  const [rows, setRows] = useState<AdminShowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [kind, setKind] = useState<ContentKind>('interview');
  const [status, setStatus] = useState<ShowStatus>('scheduled');
  const [premium, setPremium] = useState(false);
  const [early, setEarly] = useState(false);
  const [membersOnly, setMembersOnly] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setRows(await fetchAdminShows());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title.trim()) { Alert.alert('Titre requis'); return; }
    setBusy(true);
    const res = await createShow({
      title: title.trim(), description: desc.trim(), kind, status,
      is_premium: premium, early_access: early, members_only: membersOnly,
    });
    setBusy(false);
    if (res.error) { Alert.alert('Erreur', res.error); return; }
    setTitle(''); setDesc(''); setPremium(false); setEarly(false); setMembersOnly(false);
    setCreating(false);
    load();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Pressable style={styles.primaryBtn} onPress={() => setCreating((c) => !c)}>
        <Ionicons name={creating ? 'close' : 'add'} size={18} color={colors.text} />
        <Text style={styles.primaryBtnText}>{creating ? 'Annuler' : 'Nouvelle émission'}</Text>
      </Pressable>

      {creating && (
        <View style={styles.form}>
          <Label text="TITRE" />
          <TextInput style={styles.input} value={title} onChangeText={setTitle}
            placeholder="Titre de l'émission" placeholderTextColor={colors.textDim} />
          <Label text="DESCRIPTION" />
          <TextInput style={[styles.input, styles.textarea]} value={desc} onChangeText={setDesc}
            placeholder="Description" placeholderTextColor={colors.textDim} multiline />
          <Label text="CATÉGORIE" />
          <View style={styles.pickRow}>
            {KINDS.map((k) => (
              <Pick key={k.key} label={k.label} on={kind === k.key} onPress={() => setKind(k.key)} />
            ))}
          </View>
          <Label text="STATUT" />
          <View style={styles.pickRow}>
            {STATUSES.map((s) => (
              <Pick key={s.key} label={s.label} on={status === s.key} onPress={() => setStatus(s.key)} />
            ))}
          </View>
          <Toggle label="Contenu premium (Star Member)" value={premium} onValueChange={setPremium} />
          <Toggle label="Accès anticipé Star Member" value={early} onValueChange={setEarly} />
          <Toggle label="Réservé membres uniquement" value={membersOnly} onValueChange={setMembersOnly} />
          <Pressable style={styles.saveBtn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Toutes les émissions</Text>
      {loading ? (
        <ActivityIndicator color={colors.red} />
      ) : (
        rows.map((r) => (
          <View key={r.id} style={styles.showRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.showTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.showMeta}>{r.kind} · {r.status}</Text>
            </View>
            <Pressable
              style={[styles.liveToggle, r.is_live && styles.liveToggleOn]}
              onPress={async () => { await setShowLive(r.id, !r.is_live); load(); }}
            >
              <Text style={[styles.liveToggleText, r.is_live && styles.liveToggleTextOn]}>
                {r.is_live ? 'LIVE' : 'OFF'}
              </Text>
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert('Supprimer', `Supprimer « ${r.title} » ?`, [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteShow(r.id); load(); } },
                ])
              }
            >
              <Ionicons name="trash" size={18} color={colors.textDim} />
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Moderation() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    const res = await broadcastNotification(msg.trim());
    setBusy(false);
    if (res.error) Alert.alert('Erreur', res.error);
    else { setMsg(''); Alert.alert('Envoyé', 'Notification diffusée à tous les utilisateurs.'); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={styles.sectionTitle}>Diffuser une notification</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={msg}
        onChangeText={setMsg}
        placeholder="Message envoyé à tous les utilisateurs…"
        placeholderTextColor={colors.textDim}
        multiline
      />
      <Pressable style={styles.saveBtn} onPress={send} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveBtnText}>Diffuser</Text>}
      </Pressable>

      <Text style={styles.sectionTitle}>Modération du chat</Text>
      <Text style={styles.muted}>
        Les messages signalés du chat live apparaîtront ici dès que le chat sera actif.
      </Text>
    </ScrollView>
  );
}

/* helpers UI */
const Label = ({ text }: { text: string }) => <Text style={styles.fieldLabel}>{text}</Text>;
const Pick = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
  <Pressable style={[styles.pick, on && styles.pickOn]} onPress={onPress}>
    <Text style={[styles.pickText, on && styles.pickTextOn]}>{label}</Text>
  </Pressable>
);
const Toggle = ({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.red, false: colors.surfaceHi }} thumbColor={colors.text} />
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  gateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '31%', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 4,
  },
  statValue: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 22 },
  statLabel: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11 },

  sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16, marginTop: spacing.xl, marginBottom: spacing.md },
  muted: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  memberName: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  memberDate: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 12 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.red, borderRadius: radius.pill, paddingVertical: spacing.md,
  },
  primaryBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },

  form: { marginTop: spacing.lg, gap: spacing.xs },
  fieldLabel: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, marginTop: spacing.md, marginBottom: 4 },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, fontSize: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  pickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pick: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  pickOn: { backgroundColor: colors.red, borderColor: colors.red },
  pickText: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13 },
  pickTextOn: { color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, marginTop: spacing.xs },
  toggleLabel: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, flex: 1 },
  saveBtn: { backgroundColor: colors.red, borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },

  showRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  showTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  showMeta: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },
  liveToggle: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  liveToggleOn: { backgroundColor: colors.red, borderColor: colors.red },
  liveToggleText: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 11 },
  liveToggleTextOn: { color: colors.text },
});
