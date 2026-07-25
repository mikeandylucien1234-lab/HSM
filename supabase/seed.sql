-- ============================================================================
-- HSM — Données de démonstration (extraites des maquettes Home + Admin)
-- Idempotent : à exécuter après les migrations sur un projet vierge.
-- ============================================================================

-- ── Catégories ──────────────────────────────────────────────────────────
insert into public.categories (slug, label, sort_order) values
  ('interview',  'Interview',   1),
  ('podcast',    'Podcast',     2),
  ('rap_kreyol', 'Rap Kreyòl',  3),
  ('debat',      'Débat',       4),
  ('collab',     'Collab',      5)
on conflict (slug) do nothing;

-- ── Émissions (home : "Émissions en direct") ────────────────────────────
insert into public.shows (title, description, kind, status, is_live, viewers, is_premium, early_access, members_only, featured)
values
  ('Haitian Stars LIVE',      'Interview VLAD — En direct',                 'interview',  'live',    true,  12480, false, false, false, true),
  ('Sajes ak Vlad',           'Ego se pi gwo andikap rap kreyòl',           'podcast',    'live',    true,  8320,  true,  false, false, false),
  ('Rap Kreyòl Cypher',       'Freestyle live ak envite sipriz',            'rap_kreyol', 'live',    true,  4210,  false, false, false, false),
  ('Papi-G Real Talk',        'Rezon ki fè li ak Jeff 3 wa pa...',          'interview',  'live',    true,  2670,  false, false, false, false),
  ('Baky Corner',             'Prochaine émission — vendredi 20h',          'rap_kreyol', 'offline', false, 0,     true,  false, false, false),
  ('Sajes Net Ale — Débat',   'Prochaine émission — dimanche 18h',          'debat',      'offline', false, 0,     false, true,  false, false),
  ('Cypher privé — invités surprise', 'Réservé aux Star Member — jeudi 22h','rap_kreyol', 'scheduled', false, 0,   true,  false, true,  false)
on conflict do nothing;

-- Rattacher category_id d'après le kind
update public.shows s set category_id = c.id
from public.categories c
where c.slug = s.kind::text and s.category_id is null;

-- ── Vidéos (rangées de contenu) ─────────────────────────────────────────
insert into public.videos (title, kind, duration_sec, views) values
  ('Gno tap fon ti pale ak Sajes Net Ale',        'interview',  397,  1300),
  ('VLAD ENJOY sot nan silans li pou...',          'interview',  3260, 1700),
  ('EGO SA A KAY NEG YO SE PI GWO...',             'podcast',    4441, 360),
  ('SAJES NET ALE KASE MET NAN',                   'debat',      3712, 5200),
  ('D-JA — Mèsi Grenadye Yo (Official...)',        'clip',       156,  188),
  ('BAKY Toujou rapè e li ka fe eks...',           'collab',     498,  1000),
  ('Moment fò nan podcast la',                     'short',      45,   0),
  ('Sajes ak Vlad — punchline',                    'short',      32,   0),
  ('Rap kreyòl : les alliances qui...',            'article',    null, 0),
  ('Diaspora Weekly — l''agenda de...',            'newsletter', null, 0)
on conflict do nothing;

-- ── Sondage home ────────────────────────────────────────────────────────
with p as (
  insert into public.polls (question, is_active)
  values ('Ki pi bon rap kreyòl mwa sa a?', true)
  returning id
)
insert into public.poll_options (poll_id, label, sort_order)
select p.id, x.label, x.ord from p,
  (values ('BAKY — Toujou rapè',1), ('D-JA — Mèsi Grenadye Yo',2), ('Sajes Net Ale — freestyle',3)) as x(label, ord);

-- ── Événement spécial ───────────────────────────────────────────────────
insert into public.events (title, description, status, featured, starts_at)
values ('HSM Live Awards Kreyòl', 'Événement spécial — remise de prix du rap kreyòl', 'upcoming', true, now() + interval '4 days 12 hours')
on conflict do nothing;

-- ── Partenaires (emplacements) ──────────────────────────────────────────
insert into public.partners (label, sort_order) values
  ('LOGO', 1), ('LOGO', 2), ('LOGO', 3), ('LOGO', 4)
on conflict do nothing;

-- ── Notifications broadcast (démo) ──────────────────────────────────────
insert into public.notifications (user_id, body) values
  (null, 'Haitian Stars LIVE commence dans 15 min'),
  (null, 'Nouvel épisode : Sajes ak Vlad est disponible'),
  (null, 'BAKY Corner revient vendredi 20h')
on conflict do nothing;
