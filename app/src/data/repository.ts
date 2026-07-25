/**
 * Couche d'accès aux données HSM.
 * Chaque fonction tente Supabase ; en cas d'absence de config ou d'erreur,
 * elle retombe proprement sur les données de démo (mock) — l'UI reste
 * identique à la maquette web et l'app démarre sans backend.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Show, ContentSection, Poll, Partner, HsmEvent, NotificationItem, VideoItem,
} from '../types';
import {
  mockShows, mockTopSections, mockBottomSections,
  mockPoll, mockPartners, mockEvent, mockNotifications,
} from './mock';

const CATEGORY_LABELS: Record<string, string> = {
  interview: 'INTERVIEW', podcast: 'PODCAST', rap_kreyol: 'RAP KREYÒL',
  debat: 'DÉBAT', collab: 'COLLAB', clip: 'CLIP', short: 'SHORT',
  article: 'ARTICLE', newsletter: 'NEWSLETTER',
};

function fmtDuration(sec?: number | null): string | null {
  if (!sec) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function fmtViews(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K vues`;
  return `${v} vues`;
}

export async function fetchShows(): Promise<Show[]> {
  if (!isSupabaseConfigured) return mockShows;
  try {
    const { data, error } = await supabase
      .from('shows')
      .select('*')
      .in('status', ['live', 'offline', 'scheduled'])
      .order('is_live', { ascending: false })
      .order('viewers', { ascending: false });
    if (error || !data?.length) return mockShows;
    return data.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? '',
      category: CATEGORY_LABELS[s.kind] ?? s.kind.toUpperCase(),
      kind: s.kind,
      isLive: s.is_live,
      viewers: s.viewers,
      coverUrl: s.cover_url,
      premium: s.is_premium,
      earlyAccess: s.early_access,
      membersOnly: s.members_only,
    }));
  } catch {
    return mockShows;
  }
}

export async function fetchContentSections(): Promise<{
  top: ContentSection[];
  bottom: ContentSection[];
}> {
  if (!isSupabaseConfigured) {
    return { top: mockTopSections, bottom: mockBottomSections };
  }
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('published_at', { ascending: false });
    if (error || !data?.length) {
      return { top: mockTopSections, bottom: mockBottomSections };
    }
    const groupByKinds = (kinds: string[]) =>
      data
        .filter((v) => kinds.includes(v.kind))
        .map((v) => ({
          id: v.id,
          title: v.title,
          meta: [CATEGORY_LABELS[v.kind] ?? v.kind, fmtDuration(v.duration_sec), fmtViews(v.views)]
            .filter(Boolean)
            .join(' · '),
          kind: v.kind,
          thumbUrl: v.thumb_url,
          showPlay: !['article', 'newsletter'].includes(v.kind),
        }));

    const top: ContentSection[] = [
      { title: 'Interviews à ne pas manquer', items: groupByKinds(['interview']) },
      { title: 'Podcasts & débats', items: groupByKinds(['podcast', 'debat']) },
      { title: 'Collaborations', items: groupByKinds(['collab', 'clip']) },
    ].filter((s) => s.items.length > 0);

    const bottom: ContentSection[] = [
      { title: 'Shorts & moments viraux', items: groupByKinds(['short']) },
      { title: 'Actualités showbiz kreyòl', items: groupByKinds(['article', 'newsletter']) },
    ].filter((s) => s.items.length > 0);

    return {
      top: top.length ? top : mockTopSections,
      bottom: bottom.length ? bottom : mockBottomSections,
    };
  } catch {
    return { top: mockTopSections, bottom: mockBottomSections };
  }
}

export async function fetchActivePoll(): Promise<Poll> {
  if (!isSupabaseConfigured) return mockPoll;
  try {
    const { data: poll } = await supabase
      .from('polls')
      .select('id, question')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!poll) return mockPoll;
    const { data: results } = await supabase
      .from('poll_results')
      .select('*')
      .eq('poll_id', poll.id)
      .order('sort_order');
    if (!results?.length) return mockPoll;
    const options = results.map((r) => ({ id: r.option_id, label: r.label, votes: r.votes }));
    return {
      id: poll.id,
      question: poll.question,
      options,
      totalVotes: options.reduce((sum, o) => sum + o.votes, 0),
    };
  } catch {
    return mockPoll;
  }
}

export async function fetchPartners(): Promise<Partner[]> {
  if (!isSupabaseConfigured) return mockPartners;
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('sort_order');
    if (error || !data?.length) return mockPartners;
    return data.map((p) => ({ id: p.id, label: p.label, logoUrl: p.logo_url }));
  } catch {
    return mockPartners;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'À l’instant';
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Hier' : `Il y a ${d} j`;
}

export async function fetchFeaturedEvent(): Promise<HsmEvent | null> {
  if (!isSupabaseConfigured) return mockEvent;
  try {
    const { data } = await supabase
      .from('events')
      .select('id, title, starts_at')
      .eq('featured', true)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!data) return mockEvent;
    let countdown = '';
    if (data.starts_at) {
      const diff = new Date(data.starts_at).getTime() - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        countdown = days > 0 ? `${days} jours ${hours}h` : `${hours}h`;
      } else countdown = 'En cours';
    }
    return { id: data.id, title: data.title, countdown };
  } catch {
    return mockEvent;
  }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) return mockNotifications;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, body, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error || !data?.length) return mockNotifications;
    return data.map((n) => ({ id: n.id, text: n.body, time: relativeTime(n.created_at) }));
  } catch {
    return mockNotifications;
  }
}

/** Charts : top vidéos par nombre de vues. */
export async function fetchTopVideos(limit = 10): Promise<VideoItem[]> {
  if (!isSupabaseConfigured) {
    return mockTopSections.flatMap((s) => s.items).slice(0, limit);
  }
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);
    if (error || !data?.length) {
      return mockTopSections.flatMap((s) => s.items).slice(0, limit);
    }
    return data.map((v) => ({
      id: v.id,
      title: v.title,
      meta: `${CATEGORY_LABELS[v.kind] ?? v.kind} · ${fmtViews(v.views)}`,
      kind: v.kind,
      thumbUrl: v.thumb_url,
      showPlay: !['article', 'newsletter'].includes(v.kind),
    }));
  } catch {
    return mockTopSections.flatMap((s) => s.items).slice(0, limit);
  }
}

export interface TopFan {
  id: string;
  name: string;
  points: number;
}

export async function fetchTopFans(limit = 10): Promise<TopFan[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, fan_points')
      .order('fan_points', { ascending: false })
      .limit(limit);
    if (error || !data?.length) return [];
    return data.map((p) => ({
      id: p.id,
      name: p.full_name ?? 'Fan',
      points: p.fan_points,
    }));
  } catch {
    return [];
  }
}

/** Enregistre le vote de l'utilisateur courant (1 vote/sondage via PK). */
export async function submitVote(pollId: string, optionId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  const { data: sess } = await supabase.auth.getUser();
  const uid = sess.user?.id;
  if (!uid) return { error: 'Connecte-toi pour voter.' };
  const { error } = await supabase
    .from('poll_votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: uid });
  return error ? { error: error.message } : {};
}
