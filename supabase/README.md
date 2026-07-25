# HSM — Backend Supabase

Schéma partagé entre l'app mobile (`../app`) et le site web (`../web`).

## Fichiers

| Fichier | Rôle |
|---------|------|
| `migrations/0001_init.sql` | Tables, enums, vues, triggers |
| `migrations/0002_rls.sql`  | Row Level Security + helpers `is_admin()` / `is_star_member()` |
| `seed.sql`                 | Données de démo (issues des maquettes) |

## Modèle de données

- **profiles** — utilisateurs (rôle `member` / `star_member` / `admin`, points fan, statut)
- **categories** — Interview, Podcast, Rap Kreyòl, Débat, Collab
- **shows** — émissions (live, viewers, premium, early_access, members_only, featured, air_at)
- **videos** — contenus des rangées (durée, vues, premium)
- **subscriptions** — abonnements Star Member (plan, statut, renouvellement)
- **events** — événements (HSM Live Awards…)
- **schedule_slots** — programmation hebdomadaire
- **polls / poll_options / poll_votes** — sondages (1 vote/utilisateur) + vue `poll_results`
- **notifications** — perso + broadcast
- **playlists / playlist_items / favorites / watch_progress** — données utilisateur
- **partners** — bandeau partenaires
- **chat_messages / user_reports** — chat live + modération

## Sécurité (RLS)

- Catalogue public en lecture ; `members_only` / `premium` filtrés par `is_star_member()`.
- Données perso (profil, favoris, votes, progression) : propriétaire uniquement.
- Écritures catalogue + modération : rôle `admin`.

## Appliquer

Via la CLI Supabase (recommandé) :

```bash
supabase link --project-ref <ref>
supabase db push
psql "$(supabase db url)" -f seed.sql
```

Ou coller le contenu des fichiers dans le **SQL Editor** du dashboard, dans
l'ordre : `0001_init.sql` → `0002_rls.sql` → `seed.sql`.

## Projet en ligne

Projet Supabase dédié **`hsm`** : `pkksupaobxgfekskvazo`
(`https://pkksupaobxgfekskvazo.supabase.co`). Migrations + seed déjà
appliqués. L'app (`app/app.json` → extra) et le site (`web/config.js`)
pointent dessus via la clé publishable.

## Promouvoir un administrateur

Après inscription d'un compte (email + mot de passe dans l'app), passer son
rôle à `admin` pour débloquer le panneau d'administration :

```sql
update public.profiles set role = 'admin' where email = 'ton@email.com';
-- ou Star Member :
update public.profiles set role = 'star_member' where email = 'ton@email.com';
```
