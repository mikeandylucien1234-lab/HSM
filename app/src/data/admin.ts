/**
 * Couche d'administration HSM — nécessite un profil `admin`.
 * Toutes les écritures sont protégées côté serveur par la RLS
 * (policies `*_admin_write` + helper `is_admin()`).
 */
import { supabase } from '../lib/supabase';
import type { ContentKind, ShowStatus } from '../lib/database.types';

export interface AdminStats {
  shows: number;
  live: number;
  videos: number;
  members: number;
  users: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const count = async (
    table: 'shows' | 'videos' | 'profiles',
    filter?: (q: any) => any
  ) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: c } = await q;
    return c ?? 0;
  };

  const [shows, live, videos, users, members] = await Promise.all([
    count('shows'),
    count('shows', (q) => q.eq('is_live', true)),
    count('videos'),
    count('profiles'),
    count('profiles', (q) => q.in('role', ['star_member', 'admin'])),
  ]);

  return { shows, live, videos, users, members };
}

export interface AdminMember {
  id: string;
  name: string;
  joined: string;
}

export async function fetchLatestMembers(limit = 6): Promise<AdminMember[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, joined_at')
    .in('role', ['star_member', 'admin'])
    .order('joined_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name ?? p.email ?? 'Membre',
    joined: new Date(p.joined_at).toLocaleDateString('fr-FR'),
  }));
}

export interface NewShowInput {
  title: string;
  description: string;
  kind: ContentKind;
  status: ShowStatus;
  is_premium: boolean;
  early_access: boolean;
  members_only: boolean;
  video_url?: string;
  air_at?: string | null;
}

export async function createShow(input: NewShowInput): Promise<{ error?: string }> {
  const { error } = await supabase.from('shows').insert({
    title: input.title,
    description: input.description,
    kind: input.kind,
    status: input.status,
    is_live: input.status === 'live',
    is_premium: input.is_premium,
    early_access: input.early_access,
    members_only: input.members_only,
    video_url: input.video_url || null,
    air_at: input.air_at ?? null,
  });
  return error ? { error: error.message } : {};
}

export interface AdminShowRow {
  id: string;
  title: string;
  kind: string;
  status: string;
  is_live: boolean;
}

export async function fetchAdminShows(): Promise<AdminShowRow[]> {
  const { data } = await supabase
    .from('shows')
    .select('id, title, kind, status, is_live')
    .order('created_at', { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id, title: s.title, kind: s.kind, status: s.status, is_live: s.is_live,
  }));
}

export async function setShowLive(id: string, live: boolean): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('shows')
    .update({ is_live: live, status: live ? 'live' : 'offline' })
    .eq('id', id);
  return error ? { error: error.message } : {};
}

export async function deleteShow(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('shows').delete().eq('id', id);
  return error ? { error: error.message } : {};
}

export interface FlaggedMessage {
  id: string;
  body: string;
  flagged: boolean;
  created_at: string;
}

export async function fetchRecentMessages(limit = 20): Promise<FlaggedMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('id, body, flagged, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function toggleFlag(id: string, flagged: boolean): Promise<{ error?: string }> {
  const { error } = await supabase.from('chat_messages').update({ flagged }).eq('id', id);
  return error ? { error: error.message } : {};
}

/** Publie une notification broadcast (user_id null). */
export async function broadcastNotification(body: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('notifications').insert({ body, user_id: null });
  return error ? { error: error.message } : {};
}
