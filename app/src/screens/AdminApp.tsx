import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';
import { Thumb } from '../components/Thumb';
import { AdminNav, AdminTab } from '../components/AdminNav';
import { useAuth } from '../lib/auth';
import type { ContentKind, ShowStatus } from '../lib/database.types';
import {
  fetchDashboard, fetchAdminShows, fetchSchedule, fetchUsers,
  createShow, deleteShow, broadcastNotification, initials,
  DashboardData, AdminShow, DaySchedule, AdminUser,
} from '../data/admin';

/* ══════════════════════ shell ══════════════════════ */
export function AdminApp({ onExit }: { onExit: () => void }) {
  const { isAdmin, configured } = useAuth();
  const [tab, setTab] = useState<AdminTab>('tableau');
  const [creating, setCreating] = useState(false);
  const [plusPage, setPlusPage] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <Gate onExit={onExit}
        text={configured ? 'Accès réservé aux administrateurs.' : 'Backend Supabase non configuré.'} />
    );
  }

  const back = () => {
    if (creating) return setCreating(false);
    if (plusPage) return setPlusPage(null);
    onExit();
  };

  let title = 'Tableau de bord';
  if (tab === 'emissions') title = 'Émissions';
  if (tab === 'programme') title = 'Programme';
  if (tab === 'utilisateurs') title = 'Utilisateurs';
  if (tab === 'plus') title = plusPage ? PLUS_TITLES[plusPage] : 'Plus';
  if (creating) title = 'Nouvelle émission';

  const showPlusBtn = tab === 'emissions' && !creating;

  return (
    <View style={styles.root}>
      <Header
        title={title}
        onBack={back}
        rightLabel={showPlusBtn ? '+' : undefined}
        onRight={showPlusBtn ? () => setCreating(true) : undefined}
      />
      <View style={styles.body}>
        {tab === 'tableau' && <Dashboard />}
        {tab === 'emissions' && (creating
          ? <CreateShow onDone={() => setCreating(false)} />
          : <Emissions />)}
        {tab === 'programme' && <Programme />}
        {tab === 'utilisateurs' && <Utilisateurs />}
        {tab === 'plus' && (plusPage
          ? <PlusDetail page={plusPage} />
          : <PlusMenu onOpen={setPlusPage} />)}
      </View>
      <AdminNav active={tab} onSelect={(t) => { setTab(t); setCreating(false); setPlusPage(null); }} />
    </View>
  );
}

function Gate({ text, onExit }: { text: string; onExit: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header title="Admin" onBack={onExit} />
      <View style={styles.gate}>
        <Ionicons name="lock-closed" size={40} color={colors.textDim} />
        <Text style={styles.gateText}>{text}</Text>
      </View>
    </View>
  );
}

function Header({ title, onBack, rightLabel, onRight }: {
  title: string; onBack: () => void; rightLabel?: string; onRight?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <Pressable style={styles.hSide} onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.hTitle} numberOfLines={1}>{title}</Text>
      <Pressable style={[styles.hSide, styles.hRight]} onPress={onRight} hitSlop={10}>
        {rightLabel === '+'
          ? <Ionicons name="add" size={26} color={colors.text} />
          : rightLabel
            ? <Text style={styles.hRightText}>{rightLabel}</Text>
            : null}
      </Pressable>
    </View>
  );
}

/* ══════════════════════ Tableau de bord ══════════════════════ */
function Dashboard() {
  const [d, setD] = useState<DashboardData | null>(null);
  useEffect(() => { fetchDashboard().then(setD); }, []);
  if (!d) return <Loader />;

  const cards = [
    { icon: 'play', value: d.stats.emissions, label: 'Émissions actives' },
    { icon: 'contrast', value: d.stats.users, label: 'Utilisateurs inscrits' },
    { icon: 'star', value: d.stats.stars, label: 'Star Members' },
    { icon: 'pie-chart', value: d.stats.views, label: 'Vues 30 jours' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.hello}>Bonjour Admin</Text>
      <Text style={styles.helloSub}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>

      <View style={styles.statGrid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.statCard}>
            <Ionicons name={c.icon as any} size={20} color={colors.gold} />
            <Text style={styles.statValue}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>En direct maintenant</Text>
      {d.live.map((l) => (
        <View key={l.id} style={styles.liveRow}>
          <View style={styles.liveBar} />
          <Thumb seed={l.seed} style={styles.liveThumb} />
          <Text style={styles.liveTitle} numberOfLines={1}>{l.title}</Text>
          <Text style={styles.liveViewers}>{l.viewers.toLocaleString('fr-FR')}</Text>
        </View>
      ))}

      <Text style={styles.section}>Dernières inscriptions Star Member</Text>
      {d.members.map((m) => (
        <View key={m.id} style={styles.memberRow}>
          <View style={styles.avatarGold}><Text style={styles.avatarGoldText}>{initials(m.name)}</Text></View>
          <Text style={styles.memberName}>{m.name}</Text>
          <Text style={styles.memberWhen}>{m.when}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* ══════════════════════ Émissions ══════════════════════ */
function Emissions() {
  const [rows, setRows] = useState<AdminShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = () => fetchAdminShows().then((r) => { setRows(r); setLoading(false); });
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => rows.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextInput
            style={styles.searchInput} value={q} onChangeText={setQ}
            placeholder="Rechercher une émission..." placeholderTextColor={colors.textDim}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => Alert.alert('Filtres', 'Bientôt disponible')}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </Pressable>
      </View>
      {loading ? <Loader /> : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
          {filtered.map((s) => (
            <Pressable key={s.id} style={styles.showCard}>
              <Thumb seed={s.seed} style={styles.showThumb} rounded={radius.md} />
              <View style={styles.showInfo}>
                <Text style={styles.showTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.showCat}>{s.category}</Text>
                <StatusBadge label={s.statusLabel} color={s.statusColor} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const KINDS: { key: ContentKind; label: string }[] = [
  { key: 'interview', label: 'Interview' }, { key: 'podcast', label: 'Podcast' },
  { key: 'rap_kreyol', label: 'Rap Kreyòl' }, { key: 'debat', label: 'Débat' },
  { key: 'collab', label: 'Collab' },
];
const STATUSES: { key: ShowStatus; label: string }[] = [
  { key: 'live', label: 'En direct' }, { key: 'scheduled', label: 'Planifié' },
  { key: 'offline', label: 'Terminé' }, { key: 'draft', label: 'Brouillon' },
];

function CreateShow({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [kind, setKind] = useState<ContentKind>('interview');
  const [status, setStatus] = useState<ShowStatus>('scheduled');
  const [airAt, setAirAt] = useState('');
  const [premium, setPremium] = useState(false);
  const [early, setEarly] = useState(false);
  const [membersOnly, setMembersOnly] = useState(false);
  const [guests, setGuests] = useState<string[]>([]);
  const [guestName, setGuestName] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim()) { Alert.alert('Titre requis'); return; }
    setBusy(true);
    const res = await createShow({
      title: title.trim(), description: desc.trim(), kind, status,
      video_url: url.trim(), is_premium: premium, early_access: early,
      members_only: membersOnly, air_at: airAt.trim() || null,
    });
    setBusy(false);
    if (res.error) return Alert.alert('Erreur', res.error);
    Alert.alert('Émission créée', title.trim(), [{ text: 'OK', onPress: onDone }]);
  };

  return (
    <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
      <FieldLabel>TITRE</FieldLabel>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Titre de l'émission" placeholderTextColor={colors.textDim} />
      <FieldLabel>DESCRIPTION</FieldLabel>
      <TextInput style={[styles.input, styles.textarea]} value={desc} onChangeText={setDesc} placeholder="Description" placeholderTextColor={colors.textDim} multiline />
      <FieldLabel>URL VIDÉO</FieldLabel>
      <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="https://..." placeholderTextColor={colors.textDim} autoCapitalize="none" />
      <FieldLabel>CATÉGORIE</FieldLabel>
      <View style={styles.pickRow}>
        {KINDS.map((k) => <Pick key={k.key} label={k.label} on={kind === k.key} onPress={() => setKind(k.key)} />)}
      </View>
      <FieldLabel>STATUT</FieldLabel>
      <View style={styles.pickRow}>
        {STATUSES.map((s) => <Pick key={s.key} label={s.label} on={status === s.key} onPress={() => setStatus(s.key)} />)}
      </View>
      <FieldLabel>DATE ET HEURE DE DIFFUSION</FieldLabel>
      <TextInput style={styles.input} value={airAt} onChangeText={setAirAt} placeholder="2026-07-25 20:00" placeholderTextColor={colors.textDim} />

      <Text style={styles.optTitle}>Options</Text>
      <ToggleRow label="Contenu premium" sub="Réservé aux Star Member" value={premium} onValueChange={setPremium} />
      <ToggleRow label="Accès anticipé Star Member" sub="Visible en avance pour les membres" value={early} onValueChange={setEarly} />
      <ToggleRow label="Réservé membres uniquement" sub="Invisible pour les non-membres" value={membersOnly} onValueChange={setMembersOnly} />

      <Text style={styles.optTitle}>Invités</Text>
      <View style={styles.guestWrap}>
        {guests.map((g, i) => (
          <View key={i} style={styles.guestChip}>
            <Text style={styles.guestChipText}>{g}</Text>
            <Pressable onPress={() => setGuests(guests.filter((_, j) => j !== i))}><Ionicons name="close" size={13} color={colors.text} /></Pressable>
          </View>
        ))}
      </View>
      <View style={styles.searchRow}>
        <TextInput style={[styles.input, { flex: 1 }]} value={guestName} onChangeText={setGuestName} placeholder="Nom de l'invité" placeholderTextColor={colors.textDim} />
        <Pressable style={styles.addGuest} onPress={() => { if (guestName.trim()) { setGuests([...guests, guestName.trim()]); setGuestName(''); } }}>
          <Text style={styles.addGuestText}>+ Ajouter</Text>
        </Pressable>
      </View>

      <Pressable style={styles.saveBtn} onPress={save} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
      </Pressable>
    </ScrollView>
  );
}

/* ══════════════════════ Programme ══════════════════════ */
function Programme() {
  const [week, setWeek] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchSchedule().then((w) => { setWeek(w); setLoading(false); }); }, []);
  if (loading) return <Loader />;

  return (
    <ScrollView contentContainerStyle={styles.pad}>
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
  );
}

/* ══════════════════════ Utilisateurs ══════════════════════ */
function Utilisateurs() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  useEffect(() => { fetchUsers().then((r) => { setRows(r); setLoading(false); }); }, []);

  const filtered = useMemo(
    () => rows.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextInput style={styles.searchInput} value={q} onChangeText={setQ} placeholder="Rechercher un utilisateur..." placeholderTextColor={colors.textDim} />
        </View>
      </View>
      {loading ? <Loader /> : (
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          {filtered.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(u.name)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <RoleBadge label={u.role} color={u.roleColor} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ══════════════════════ Plus ══════════════════════ */
const PLUS_ITEMS = [
  'Invités', 'Star Member', 'Playlists', 'Historique & progression', 'Communauté',
  'Charts & Musique', 'Notifications', 'Recherche & tags', 'Événements spéciaux', 'Pages institutionnelles',
];
const PLUS_TITLES: Record<string, string> = Object.fromEntries(PLUS_ITEMS.map((i) => [i, i]));

function PlusMenu({ onOpen }: { onOpen: (k: string) => void }) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      {PLUS_ITEMS.map((label) => (
        <Pressable key={label} style={styles.plusRow} onPress={() => onOpen(label)}>
          <Text style={styles.plusLabel}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

function PlusDetail({ page }: { page: string }) {
  if (page === 'Notifications') return <NotificationsAdmin />;
  if (page === 'Invités') return <SimpleList title="Invités récurrents" rows={[
    ['Vlad Enjoy', '48 apparitions'], ['Sajes Net Ale', '31 apparitions'], ['BAKY', '22 apparitions'],
    ['D-JA', '17 apparitions'], ['Papi-G', '12 apparitions'],
  ]} avatar />;
  if (page === 'Star Member') return <SimpleList title="Abonnements Star Member" rows={[
    ['Jean_MTL', 'Mensuel · renouv. 12 août'], ['Marie_FL', 'Annuel · renouv. 3 mars'],
    ['Wilkens', 'Mensuel · renouv. 28 juillet'],
  ]} avatar badge="Actif" />;
  if (page === 'Charts & Musique') return <SimpleList title="Top titres" rows={[
    ['1 · SAJES NET ALE KASE MET NAN', '5.2K vues'], ['2 · VLAD ENJOY sot nan silans', '1.7K vues'],
    ['3 · Gno tap fon ti pale', '1.3K vues'], ['4 · BAKY Toujou rapè', '1.0K vues'],
  ]} />;
  if (page === 'Playlists') return <SimpleList title="Playlists" rows={[
    ['Best of Interviews', 'Vlad · 24 vidéos'], ['Rap Kreyòl 2026', 'Admin · 18 vidéos'],
    ['Podcasts complets', 'Sajes · 12 vidéos'],
  ]} />;
  if (page === 'Événements spéciaux') return <SimpleList title="Événements" rows={[
    ['HSM Live Awards Kreyòl', 'À venir · 28 juillet'], ['Cypher de la diaspora', 'Terminé · 12 juin'],
  ]} badge="Mise en avant" />;
  if (page === 'Recherche & tags') return <SimpleList title="Termes populaires" rows={[
    ['vlad enjoy', '1 240 recherches'], ['sajes', '980 recherches'], ['baky', '760 recherches'],
    ['rap kreyòl', '640 recherches'],
  ]} />;
  if (page === 'Historique & progression') return <SimpleList title="Complétion des vidéos" rows={[
    ['Interview VLAD', '62% · 320 vues incomplètes'], ['Sajes ak Vlad', '48% · 210 vues incomplètes'],
  ]} />;
  if (page === 'Communauté') return <SimpleList title="Messages récents" rows={[
    ['@diaspora_miami', 'Gwo respè pou Vlad 🔥'], ['@kreyol_pride', 'Kilè pwochen episòd la?'],
  ]} />;
  return <SimpleList title="Pages institutionnelles" rows={[
    ['À propos', ''], ['Contact & booking', ''], ['Presse', ''], ['Confidentialité', ''],
  ]} />;
}

function NotificationsAdmin() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    const res = await broadcastNotification(msg.trim());
    setBusy(false);
    if (res.error) Alert.alert('Erreur', res.error);
    else { setMsg(''); Alert.alert('Diffusé', 'Notification envoyée à tous les utilisateurs.'); }
  };
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <FieldLabel>MESSAGE</FieldLabel>
      <TextInput style={[styles.input, styles.textarea]} value={msg} onChangeText={setMsg} multiline placeholder="Message envoyé à tous les utilisateurs…" placeholderTextColor={colors.textDim} />
      <Pressable style={styles.saveBtn} onPress={send} disabled={busy}>
        {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveBtnText}>Diffuser</Text>}
      </Pressable>
    </ScrollView>
  );
}

function SimpleList({ title, rows, avatar, badge }: {
  title: string; rows: [string, string][]; avatar?: boolean; badge?: string;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.section}>{title}</Text>
      {rows.map(([a, b], i) => (
        <View key={i} style={styles.simpleRow}>
          {avatar && <View style={styles.avatar}><Text style={styles.avatarText}>{initials(a)}</Text></View>}
          <View style={{ flex: 1 }}>
            <Text style={styles.simpleA} numberOfLines={1}>{a}</Text>
            {!!b && <Text style={styles.simpleB}>{b}</Text>}
          </View>
          {badge && <View style={styles.softBadge}><Text style={styles.softBadgeText}>{badge}</Text></View>}
        </View>
      ))}
    </ScrollView>
  );
}

/* ══════════════════════ small pieces ══════════════════════ */
const Loader = () => <ActivityIndicator color={colors.red} style={{ marginTop: spacing.xxl }} />;
const FieldLabel = ({ children }: { children: React.ReactNode }) => <Text style={styles.fieldLabel}>{children}</Text>;
const Pick = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
  <Pressable style={[styles.pick, on && styles.pickOn]} onPress={onPress}>
    <Text style={[styles.pickText, on && styles.pickTextOn]}>{label}</Text>
  </Pressable>
);
const ToggleRow = ({ label, sub, value, onValueChange }: { label: string; sub: string; value: boolean; onValueChange: (v: boolean) => void }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleSub}>{sub}</Text>
    </View>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.red, false: colors.surfaceHi }} thumbColor={colors.text} />
  </View>
);
function StatusBadge({ label, color }: { label: string; color: 'red' | 'gold' | 'grey' }) {
  const bg = color === 'red' ? colors.red : color === 'gold' ? colors.gold : colors.surfaceHi;
  const fg = color === 'gold' ? '#1a1200' : colors.text;
  return <View style={[styles.statusBadge, { backgroundColor: bg }]}><Text style={[styles.statusBadgeText, { color: fg }]}>{label}</Text></View>;
}
function RoleBadge({ label, color }: { label: string; color: 'gold' | 'grey' | 'red' }) {
  if (color === 'gold') return <View style={styles.roleGold}><Text style={styles.roleGoldText}>{label}</Text></View>;
  if (color === 'red') return <View style={styles.roleRed}><Text style={styles.roleRedText}>{label}</Text></View>;
  return <View style={styles.roleGrey}><Text style={styles.roleGreyText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  pad: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  gateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg,
  },
  hSide: { width: 72, justifyContent: 'center' },
  hRight: { alignItems: 'flex-end' },
  hTitle: { flex: 1, textAlign: 'center', color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  hRightText: { color: colors.red, fontFamily: fonts.bold, fontSize: 15 },

  hello: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 27 },
  helloSub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14, marginTop: 2, textTransform: 'capitalize' },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  statCard: {
    width: '47.5%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  statValue: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 26 },
  statLabel: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },

  section: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, marginTop: spacing.xl, marginBottom: spacing.md },

  liveRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, overflow: 'hidden',
  },
  liveBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.red },
  liveThumb: { width: 56, height: 40, borderRadius: radius.sm, marginLeft: 6 },
  liveTitle: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  liveViewers: { color: colors.red, fontFamily: fonts.bold, fontSize: 14 },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatarGold: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  avatarGoldText: { color: colors.gold, fontFamily: fonts.bold, fontSize: 13 },
  memberName: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  memberWhen: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 13 },

  searchRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, alignItems: 'center' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, height: 46 },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  filterBtn: { width: 46, height: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },

  showCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginTop: spacing.md,
  },
  showThumb: { width: 76, height: 60 },
  showInfo: { flex: 1, gap: 4 },
  showTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  showCat: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },

  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, marginTop: 2 },
  statusBadgeText: { fontFamily: fonts.bold, fontSize: 11 },

  fieldLabel: { color: colors.textDim, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, marginTop: spacing.lg, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  pickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pick: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  pickOn: { backgroundColor: colors.red, borderColor: colors.red },
  pickText: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13 },
  pickTextOn: { color: colors.text },
  optTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.xs },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  toggleLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  toggleSub: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 11, marginTop: 1 },
  guestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  guestChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceHi, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill },
  guestChipText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  addGuest: { justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  addGuestText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  saveBtn: { backgroundColor: colors.red, borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },

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

  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  userName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  userEmail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  roleGold: { backgroundColor: 'rgba(232,178,61,0.14)', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  roleGoldText: { color: colors.gold, fontFamily: fonts.bold, fontSize: 12 },
  roleRed: { backgroundColor: colors.red, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  roleRedText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  roleGrey: { backgroundColor: colors.surfaceHi, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  roleGreyText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 12 },

  plusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  plusLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },

  simpleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  simpleA: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  simpleB: { color: colors.textDim, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  softBadge: { backgroundColor: colors.surfaceHi, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.sm },
  softBadgeText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 11 },
});
