import type { ContentKind } from './lib/database.types';

export interface Show {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: ContentKind;
  isLive: boolean;
  viewers: number;
  coverUrl?: string | null;
  premium: boolean;
  earlyAccess: boolean;
  membersOnly: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  meta: string;
  kind: ContentKind;
  thumbUrl?: string | null;
  showPlay: boolean;
}

export interface ContentSection {
  title: string;
  items: VideoItem[];
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  progress: number; // 0..1
  remaining: string;
  thumbUrl?: string | null;
}

export interface HsmEvent {
  id: string;
  title: string;
  countdown: string;
}

export interface Partner {
  id: string;
  label: string;
  logoUrl?: string | null;
}
