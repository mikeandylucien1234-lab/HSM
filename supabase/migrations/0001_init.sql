-- ============================================================================
-- Haitian Stars Media (HSM) — Schéma initial
-- Backend partagé entre l'app mobile (Expo) et le site web.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role       as enum ('member', 'star_member', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status  as enum ('active', 'suspended', 'banned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type show_status     as enum ('draft', 'scheduled', 'live', 'offline', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_kind    as enum ('interview', 'podcast', 'rap_kreyol', 'debat', 'collab', 'clip', 'short', 'article', 'newsletter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_plan        as enum ('monthly', 'yearly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_status      as enum ('active', 'canceled', 'past_due');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status    as enum ('upcoming', 'ongoing', 'finished');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- PROFILES  (1-1 avec auth.users)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text,
  avatar_url   text,
  role         user_role      not null default 'member',
  status       account_status not null default 'active',
  fan_points   integer        not null default 0,
  joined_at    timestamptz    not null default now(),
  created_at   timestamptz    not null default now(),
  updated_at   timestamptz    not null default now()
);

-- Initiales dérivées (affichage admin/avatars)
create or replace function public.profile_initials(full_name text)
returns text language sql immutable as $$
  select upper(
    coalesce(left(split_part(full_name, ' ', 1), 1), '') ||
    coalesce(left(split_part(full_name, ' ', 2), 1), '')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  sort_order  integer not null default 0
);

-- ─────────────────────────────────────────────────────────────────────────
-- GUESTS  (invités récurrents)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.guests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- SHOWS  (émissions — carte "Émissions en direct" côté home)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.shows (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  kind          content_kind not null default 'interview',
  status        show_status  not null default 'draft',
  cover_url     text,
  video_url     text,
  is_live       boolean not null default false,
  viewers       integer not null default 0,
  is_premium    boolean not null default false,   -- réservé Star Member
  early_access  boolean not null default false,   -- accès anticipé Star Member
  members_only  boolean not null default false,   -- invisible pour non-membres
  featured      boolean not null default false,   -- mise en avant accueil
  air_at        timestamptz,                       -- date/heure de diffusion
  followers     integer not null default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists shows_status_idx  on public.shows(status);
create index if not exists shows_live_idx     on public.shows(is_live);
create index if not exists shows_air_idx       on public.shows(air_at);

-- Invités liés à une émission
create table if not exists public.show_guests (
  show_id   uuid references public.shows(id)  on delete cascade,
  guest_id  uuid references public.guests(id) on delete cascade,
  primary key (show_id, guest_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- VIDEOS  (rangées de contenu : interviews, podcasts, shorts, articles…)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  kind          content_kind not null default 'clip',
  thumb_url     text,
  video_url     text,
  duration_sec  integer,
  views         integer not null default 0,
  is_premium    boolean not null default false,
  show_id       uuid references public.shows(id) on delete set null,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists videos_kind_idx on public.videos(kind);

-- ─────────────────────────────────────────────────────────────────────────
-- CONTINUE WATCHING  (reprise de lecture par utilisateur)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.watch_progress (
  user_id       uuid references public.profiles(id) on delete cascade,
  video_id      uuid references public.videos(id)   on delete cascade,
  position_sec  integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS  (Star Member)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  plan         sub_plan   not null default 'monthly',
  status       sub_status not null default 'active',
  started_at   timestamptz not null default now(),
  renews_at    timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists subs_user_idx on public.subscriptions(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- EVENTS  (HSM Live Awards, etc.)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  cover_url    text,
  status       event_status not null default 'upcoming',
  starts_at    timestamptz,
  featured     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- SCHEDULE  (programmation hebdomadaire)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.schedule_slots (
  id           uuid primary key default gen_random_uuid(),
  show_id      uuid references public.shows(id) on delete set null,
  title        text not null,
  category_id  uuid references public.categories(id) on delete set null,
  starts_at    timestamptz not null,
  duration_min integer not null default 60,
  created_at   timestamptz not null default now()
);
create index if not exists schedule_start_idx on public.schedule_slots(starts_at);

-- ─────────────────────────────────────────────────────────────────────────
-- POLLS  (sondages home + admin)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.polls (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.poll_options (
  id          uuid primary key default gen_random_uuid(),
  poll_id     uuid not null references public.polls(id) on delete cascade,
  label       text not null,
  sort_order  integer not null default 0
);

create table if not exists public.poll_votes (
  poll_id     uuid not null references public.polls(id) on delete cascade,
  option_id   uuid not null references public.poll_options(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (poll_id, user_id)   -- un seul vote par utilisateur par sondage
);

-- Agrégat des votes (comptage par option)
create or replace view public.poll_results as
  select o.id as option_id, o.poll_id, o.label, o.sort_order,
         count(v.user_id)::int as votes
  from public.poll_options o
  left join public.poll_votes v on v.option_id = o.id
  group by o.id, o.poll_id, o.label, o.sort_order;

-- ─────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade, -- null = broadcast
  title       text,
  body        text not null,
  show_id     uuid references public.shows(id) on delete set null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notif_user_idx on public.notifications(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- PLAYLISTS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references public.profiles(id) on delete cascade,
  title       text not null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.playlist_items (
  playlist_id uuid references public.playlists(id) on delete cascade,
  video_id    uuid references public.videos(id)    on delete cascade,
  sort_order  integer not null default 0,
  primary key (playlist_id, video_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- FAVORITES (favoris / abonnements à des émissions)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id     uuid references public.profiles(id) on delete cascade,
  show_id     uuid references public.shows(id)    on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, show_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- PARTNERS  (bandeau partenaires)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.partners (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  logo_url    text,
  website     text,
  sort_order  integer not null default 0
);

-- ─────────────────────────────────────────────────────────────────────────
-- CHAT / MODÉRATION
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  show_id     uuid references public.shows(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  body        text not null,
  flagged     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists chat_show_idx on public.chat_messages(show_id);

create table if not exists public.user_reports (
  id            uuid primary key default gen_random_uuid(),
  reported_user uuid references public.profiles(id) on delete cascade,
  reporter      uuid references public.profiles(id) on delete set null,
  reason        text,
  resolved      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at auto
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ begin
  create trigger trg_profiles_touch before update on public.profiles
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_shows_touch before update on public.shows
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- Création auto du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

do $$ begin
  create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();
exception when duplicate_object then null; end $$;
