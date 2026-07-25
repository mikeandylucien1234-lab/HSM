/**
 * Types de la base HSM.
 * Version écrite à la main, alignée sur supabase/migrations.
 * À terme, régénérer avec :
 *   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */
export type ContentKind =
  | 'interview' | 'podcast' | 'rap_kreyol' | 'debat' | 'collab'
  | 'clip' | 'short' | 'article' | 'newsletter';
export type ShowStatus = 'draft' | 'scheduled' | 'live' | 'offline' | 'archived';
export type UserRole = 'member' | 'star_member' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'banned';
export type EventStatus = 'upcoming' | 'ongoing' | 'finished';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          role: UserRole;
          status: AccountStatus;
          fan_points: number;
          joined_at: string;
        };
        Insert: { id: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; role?: UserRole; status?: AccountStatus; fan_points?: number };
        Update: Partial<{ full_name: string | null; avatar_url: string | null; role: UserRole; status: AccountStatus; fan_points: number }>;
        Relationships: [];
      };
      shows: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          kind: ContentKind;
          status: ShowStatus;
          cover_url: string | null;
          video_url: string | null;
          is_live: boolean;
          viewers: number;
          is_premium: boolean;
          early_access: boolean;
          members_only: boolean;
          featured: boolean;
          air_at: string | null;
          followers: number;
          created_at: string;
        };
        Insert: { title: string } & Partial<Database['public']['Tables']['shows']['Row']>;
        Update: Partial<Database['public']['Tables']['shows']['Row']>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string;
          kind: ContentKind;
          thumb_url: string | null;
          video_url: string | null;
          duration_sec: number | null;
          views: number;
          is_premium: boolean;
          show_id: string | null;
          published_at: string;
        };
        Insert: { title: string } & Partial<Database['public']['Tables']['videos']['Row']>;
        Update: Partial<Database['public']['Tables']['videos']['Row']>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
          status: EventStatus;
          starts_at: string | null;
          featured: boolean;
        };
        Insert: { title: string } & Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
        Relationships: [];
      };
      polls: {
        Row: { id: string; question: string; is_active: boolean; created_at: string };
        Insert: { question: string; is_active?: boolean };
        Update: Partial<{ question: string; is_active: boolean }>;
        Relationships: [];
      };
      poll_options: {
        Row: { id: string; poll_id: string; label: string; sort_order: number };
        Insert: { poll_id: string; label: string; sort_order?: number };
        Update: Partial<{ label: string; sort_order: number }>;
        Relationships: [];
      };
      partners: {
        Row: { id: string; label: string; logo_url: string | null; website: string | null; sort_order: number };
        Insert: { label: string; logo_url?: string | null; website?: string | null; sort_order?: number };
        Update: Partial<{ label: string; logo_url: string | null; sort_order: number }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string; user_id: string | null; title: string | null;
          body: string; show_id: string | null; read: boolean; created_at: string;
        };
        Insert: { body: string; user_id?: string | null; title?: string | null };
        Update: Partial<{ read: boolean }>;
        Relationships: [];
      };
    };
    Views: {
      poll_results: {
        Row: { option_id: string; poll_id: string; label: string; sort_order: number; votes: number };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      content_kind: ContentKind;
      show_status: ShowStatus;
      user_role: UserRole;
      account_status: AccountStatus;
      event_status: EventStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
