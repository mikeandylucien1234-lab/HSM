/**
 * Couche d'accès aux données HSM.
 * Chaque fonction tente Supabase ; en cas d'absence de config ou d'erreur,
 * elle retombe proprement sur les données de démo (mock) — l'UI reste
 * identique à la maquette web et l'app démarre sans backend.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Show, ContentSection, Poll, Partner } from '../types';
import {
  mockShows, mockTopSections, mockBottomSections,
  mockPoll, mockPartners,
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
