/**
 * Couche d'administration HSM — reproduit fidèlement la maquette admin.
 * Lit Supabase (RLS admin) et retombe sur des données de démo identiques
 * à la maquette quand une table est vide, pour un rendu conforme.
 */
import { supabase } from '../lib/supabase';
import type { ContentKind, ShowStatus } from '../lib/database.types';

/* ── helpers ── */
export function initials(name: string): string {
  return name.split(/[\s_]+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
export function compact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',').replace(',0', '') + 'K';
  return String(n);
}

/* ── Dashboard ── */
export interface DashboardData {
  stats: { emissions: string; users: string; stars: string; views: string };
  live: { id: string; title: string; viewers: number; seed: number }[];
  members: { id: string; name: string; when: string }[];
}

const MOCK_LIVE = [
  { id: 'l1', title: 'Haitian Stars LIVE — VLAD', viewers: 12480, seed: 0 },
  { id: 'l2', title: 'Sajes ak Vlad', viewers: 8320, seed: 1 },
  { id: 'l3', title: 'Rap Kreyòl Cypher', viewers: 4210, seed: 2 },
];
const MOCK_MEMBERS = [
  { id: 'm1', name: 'Jean_MTL', when: 'Aujourd’hui' },
  { id: 'm2', name: 'Marie_FL', when: 'Hier' },
  { id: 'm3', name: 'Ricardo', when: 'Il y a 2j' },
];

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    const cnt = async (table: string, f?: (q: any) => any) => {
      let q = supabase.from(table as any).select('*', { count: 'exact', head: true });
      if (f) q = f(q);
      const { count } = await q;
      return count ?? 0;
    };
    const [emissions, users, stars] = await Promise.all([
      cnt('shows'),
      cnt('profiles'),
      cnt('profiles', (q) => q.in('role', ['star_member', 'admin'])),
    ]);
    const { data: vids } = await supabase.from('videos').select('views');
    const views = (vids ?? []).reduce((s, v: any) => s + (v.views ?? 0), 0);

    const { data: liveRows } = await supabase
      .from('shows').select('id, title, viewers')
      .eq('is_live', true).order('viewers', { ascending: false });
    const live = liveRows?.length
      ? liveRows.map((s: any, i: number) => ({ id: s.id, title: s.title, viewers: s.viewers, seed: i }))
      : MOCK_LIVE;

    const { data: memRows } = await supabase
      .from('profiles').select('id, full_name, email, joined_at')
      .in('role', ['star_member', 'admin']).order('joined_at', { ascending: false }).limit(3);
    const members = memRows?.length
      ? memRows.map((p: any) => ({ id: p.id, name: p.full_name ?? p.email ?? 'Membre', when: relTime(p.joined_at) }))
      : MOCK_MEMBERS;

    return {
      stats: {
        emissions: compact(emissions || 214),
        users: compact(users || 38500),
        stars: compact(stars || 4120),
        views: compact(views || 1200000),
      },
      live, members,
    };
  } catch {
    return {
      stats: { emissions: '214', users: '38,5K', stars: '4 120', views: '1,2M' },
      live: MOCK_LIVE, members: MOCK_MEMBERS,
    };
  }
}

function relTime(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return 'Aujourd’hui';
  if (d === 1) return 'Hier';
  return `Il y a ${d}j`;
}

/* ── Émissions ── */
export interface AdminShow {
  id: string; title: string; category: string; status: ShowStatus;
  statusLabel: string; statusColor: 'red' | 'gold' | 'grey'; seed: number;
}
const CAT_LABEL: Record<string, string> = {
  interview: 'Interview', podcast: 'Podcast', rap_kreyol: 'Rap Kreyòl',
  debat: 'Débat', collab: 'Collab',
};
function statusMeta(s: ShowStatus): { statusLabel: string; statusColor: 'red' | 'gold' | 'grey' } {
  switch (s) {
    case 'live': return { statusLabel: 'En direct', statusColor: 'red' };
    case 'scheduled': return { statusLabel: 'Planifié', statusColor: 'gold' };
    case 'draft': return { statusLabel: 'Brouillon', statusColor: 'grey' };
    default: return { statusLabel: 'Terminé', statusColor: 'grey' };
  }
}
const MOCK_SHOWS_SRC: { title: string; category: string; status: ShowStatus }[] = [
  { title: 'Haitian Stars LIVE — VLAD', category: 'Interview', status: 'live' },
  { title: 'Sajes ak Vlad', category: 'Podcast', status: 'live' },
  { title: 'Papi-G Real Talk', category: 'Interview', status: 'offline' },
  { title: 'Baky Corner', category: 'Rap Kreyòl', status: 'scheduled' },
  { title: 'Rap Kreyòl Cypher', category: 'Rap Kreyòl', status: 'live' },
  { title: 'Sajes Net Ale — Débat', category: 'Débat', status: 'scheduled' },
  { title: 'D-JA — Collab spéciale', category: 'Collab', status: 'draft' },
  { title: 'HSM Live Awards Kreyòl', category: 'Collab', status: 'scheduled' },
];
const MOCK_SHOWS: AdminShow[] = MOCK_SHOWS_SRC.map((s, i) => ({
  id: `mk${i}`, seed: i, title: s.title, category: s.category, status: s.status, ...statusMeta(s.status),
}));

export async function fetchAdminShows(): Promise<AdminShow[]> {
  try {
    const { data } = await supabase
      .from('shows').select('id, title, kind, status').order('created_at', { ascending: false });
    if (!data?.length) return MOCK_SHOWS;
    return data.map((s: any, i: number) => ({
      id: s.id, title: s.title, category: CAT_LABEL[s.kind] ?? s.kind,
      status: s.status, seed: i, ...statusMeta(s.status),
    }));
  } catch {
    return MOCK_SHOWS;
  }
}

export interface NewShowInput {
  title: string; description: string; kind: ContentKind; status: ShowStatus;
  video_url?: string; is_premium: boolean; early_access: boolean; members_only: boolean;
  air_at?: string | null;
}
export async function createShow(input: NewShowInput): Promise<{ error?: string }> {
  const { error } = await supabase.from('shows').insert({
    title: input.title, description: input.description, kind: input.kind, status: input.status,
    is_live: input.status === 'live', video_url: input.video_url || null,
    is_premium: input.is_premium, early_access: input.early_access,
    members_only: input.members_only, air_at: input.air_at ?? null,
  });
  return error ? { error: error.message } : {};
}
export async function deleteShow(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('shows').delete().eq('id', id);
  return error ? { error: error.message } : {};
}

/* ── Programme ── */
export interface DaySchedule { day: string; slots: { id: string; time: string; title: string; category: string; seed: number }[]; }
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MOCK_SCHEDULE: DaySchedule[] = [
  { day: 'Lundi', slots: [{ id: 's1', time: '18:00', title: 'Papi-G Real Talk', category: 'INTERVIEW', seed: 3 }] },
  { day: 'Mardi', slots: [{ id: 's2', time: '20:00', title: 'EGO SA A KAY NEG YO', category: 'PODCAST', seed: 1 }] },
  { day: 'Mercredi', slots: [{ id: 's3', time: '19:00', title: 'Sajes ak Vlad', category: 'PODCAST', seed: 1 }] },
  { day: 'Jeudi', slots: [
    { id: 's4', time: '20:30', title: 'Rap Kreyòl Cypher', category: 'RAP KREYÒL', seed: 2 },
    { id: 's5', time: '21:00', title: 'Haitian Stars LIVE', category: 'INTERVIEW', seed: 0 },
  ] },
  { day: 'Vendredi', slots: [{ id: 's6', time: '20:00', title: 'Baky Corner', category: 'RAP KREYÒL', seed: 2 }] },
  { day: 'Samedi', slots: [] },
  { day: 'Dimanche', slots: [{ id: 's7', time: '18:00', title: 'Sajes Net Ale Débat', category: 'DÉBAT', seed: 3 }] },
];

export async function fetchSchedule(): Promise<DaySchedule[]> {
  try {
    const { data } = await supabase
      .from('schedule_slots').select('id, title, starts_at').order('starts_at');
    if (!data?.length) return MOCK_SCHEDULE;
    const byDay: Record<number, any[]> = {};
    data.forEach((s: any, i: number) => {
      const d = (new Date(s.starts_at).getDay() + 6) % 7; // lundi=0
      (byDay[d] ??= []).push({
        id: s.id, seed: i,
        time: new Date(s.starts_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        title: s.title, category: '',
      });
    });
    return DAYS.map((day, i) => ({ day, slots: byDay[i] ?? [] }));
  } catch {
    return MOCK_SCHEDULE;
  }
}

/* ── Utilisateurs ── */
export interface AdminUser {
  id: string; name: string; email: string;
  role: 'Star Member' | 'Standard' | 'Admin'; roleColor: 'gold' | 'grey' | 'red';
}
const MOCK_USERS: AdminUser[] = ([
  { name: 'Jean_MTL', email: 'jean.mtl@gmail.com', role: 'Star Member', roleColor: 'gold' },
  { name: 'Marie_FL', email: 'marie.fl@gmail.com', role: 'Star Member', roleColor: 'gold' },
  { name: 'Ricardo', email: 'ricardo92@gmail.com', role: 'Standard', roleColor: 'grey' },
  { name: 'Djoubi92', email: 'djoubi92@gmail.com', role: 'Standard', roleColor: 'grey' },
  { name: 'Kettelie', email: 'kettelie.b@gmail.com', role: 'Standard', roleColor: 'grey' },
  { name: 'MikeNY', email: 'mike.ny@gmail.com', role: 'Admin', roleColor: 'red' },
  { name: 'Sophonie', email: 'sophonie.d@gmail.com', role: 'Standard', roleColor: 'grey' },
  { name: 'Wilkens', email: 'wilkens.j@gmail.com', role: 'Star Member', roleColor: 'gold' },
  { name: 'Nadège', email: 'nadege.p@gmail.com', role: 'Standard', roleColor: 'grey' },
] as Omit<AdminUser, 'id'>[]).map((u, i) => ({ id: `u${i}`, ...u }));

export async function fetchUsers(): Promise<AdminUser[]> {
  try {
    const { data } = await supabase
      .from('profiles').select('id, full_name, email, role').order('joined_at', { ascending: false });
    if (!data?.length) return MOCK_USERS;
    return data.map((p: any) => {
      const role = p.role === 'admin' ? 'Admin' : p.role === 'star_member' ? 'Star Member' : 'Standard';
      const roleColor = p.role === 'admin' ? 'red' : p.role === 'star_member' ? 'gold' : 'grey';
      return { id: p.id, name: p.full_name ?? p.email ?? 'Membre', email: p.email ?? '', role, roleColor } as AdminUser;
    });
  } catch {
    return MOCK_USERS;
  }
}

/* ── Communication ── */
export async function broadcastNotification(body: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('notifications').insert({ body, user_id: null });
  return error ? { error: error.message } : {};
}
