-- ============================================================================
-- HSM — Row Level Security
-- Principe :
--   * Contenu public (shows/videos/events/…) : lecture ouverte à tous.
--   * Contenu members_only / premium : filtré côté requête + policy.
--   * Données perso (profil, favoris, progression, votes) : propriétaire only.
--   * Écritures d'admin (création shows, modération) : rôle 'admin'.
-- ============================================================================

-- Helper : l'utilisateur courant est-il admin ?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper : l'utilisateur courant est-il Star Member (ou admin) ?
create or replace function public.is_star_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('star_member', 'admin')
  );
$$;

-- ── Activer RLS ─────────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.guests          enable row level security;
alter table public.shows           enable row level security;
alter table public.show_guests     enable row level security;
alter table public.videos          enable row level security;
alter table public.watch_progress  enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.events          enable row level security;
alter table public.schedule_slots  enable row level security;
alter table public.polls           enable row level security;
alter table public.poll_options    enable row level security;
alter table public.poll_votes      enable row level security;
alter table public.notifications   enable row level security;
alter table public.playlists       enable row level security;
alter table public.playlist_items  enable row level security;
alter table public.favorites       enable row level security;
alter table public.partners        enable row level security;
alter table public.chat_messages   enable row level security;
alter table public.user_reports    enable row level security;

-- ── PROFILES ────────────────────────────────────────────────────────────
create policy profiles_read_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Contenu public en lecture (catalogue) ───────────────────────────────
create policy categories_read on public.categories for select using (true);
create policy guests_read     on public.guests     for select using (true);
create policy partners_read   on public.partners   for select using (true);
create policy events_read     on public.events     for select using (true);
create policy schedule_read   on public.schedule_slots for select using (true);
create policy showguests_read on public.show_guests for select using (true);

-- Shows : visibles à tous SAUF members_only qui exige Star Member
create policy shows_read_public on public.shows
  for select using (members_only = false or public.is_star_member());

-- Videos : premium exige Star Member
create policy videos_read_public on public.videos
  for select using (is_premium = false or public.is_star_member());

-- ── Écritures admin sur le catalogue ────────────────────────────────────
create policy shows_admin_write     on public.shows          for all using (public.is_admin()) with check (public.is_admin());
create policy videos_admin_write    on public.videos         for all using (public.is_admin()) with check (public.is_admin());
create policy categories_admin_write on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy guests_admin_write    on public.guests         for all using (public.is_admin()) with check (public.is_admin());
create policy showguests_admin_write on public.show_guests   for all using (public.is_admin()) with check (public.is_admin());
create policy events_admin_write    on public.events         for all using (public.is_admin()) with check (public.is_admin());
create policy schedule_admin_write  on public.schedule_slots for all using (public.is_admin()) with check (public.is_admin());
create policy partners_admin_write  on public.partners       for all using (public.is_admin()) with check (public.is_admin());

-- ── SUBSCRIPTIONS ───────────────────────────────────────────────────────
create policy subs_read_self on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());
create policy subs_admin_write on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── WATCH PROGRESS / FAVORITES / PLAYLISTS (propriétaire) ───────────────
create policy watch_owner on public.watch_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy fav_owner on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy playlists_owner on public.playlists
  for all using (owner_id = auth.uid() or (is_public and current_setting('request.method', true) is null))
  with check (owner_id = auth.uid());
create policy playlists_read_public on public.playlists
  for select using (is_public or owner_id = auth.uid() or public.is_admin());
create policy playlist_items_owner on public.playlist_items
  for all using (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()));
create policy playlist_items_read on public.playlist_items
  for select using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.is_public or p.owner_id = auth.uid())));

-- ── POLLS ───────────────────────────────────────────────────────────────
create policy polls_read        on public.polls        for select using (true);
create policy poll_options_read  on public.poll_options for select using (true);
create policy polls_admin_write  on public.polls        for all using (public.is_admin()) with check (public.is_admin());
create policy poll_opts_admin    on public.poll_options for all using (public.is_admin()) with check (public.is_admin());
-- Résultats agrégés lisibles par tous
create policy poll_votes_read_own on public.poll_votes
  for select using (user_id = auth.uid() or public.is_admin());
create policy poll_votes_insert_self on public.poll_votes
  for insert with check (user_id = auth.uid());

-- ── NOTIFICATIONS (broadcast + perso) ───────────────────────────────────
create policy notif_read on public.notifications
  for select using (user_id is null or user_id = auth.uid() or public.is_admin());
create policy notif_update_self on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notif_admin_write on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- ── CHAT / MODÉRATION ───────────────────────────────────────────────────
create policy chat_read on public.chat_messages for select using (true);
create policy chat_insert_self on public.chat_messages
  for insert with check (user_id = auth.uid());
create policy chat_admin on public.chat_messages
  for all using (public.is_admin()) with check (public.is_admin());
create policy reports_insert_self on public.user_reports
  for insert with check (reporter = auth.uid());
create policy reports_admin on public.user_reports
  for all using (public.is_admin()) with check (public.is_admin());
