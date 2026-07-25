# Haitian Stars Media (HSM)

Écosystème **Haitian Stars Media** — plateforme de streaming / média dédiée au
rap kreyòl et au showbiz haïtien, pour la diaspora.

Monorepo : l'**app mobile**, le **site web** et le **backend Supabase**
partagent le même design (source de vérité) et la même base de données.

```
HSM/
├── app/         → App mobile Expo / React Native (iOS + Android)
├── web/         → Site web (maquettes Home + Admin, branchées sur Supabase)
└── supabase/    → Schéma de base de données, RLS et données de démo
```

## 🎨 Design (source de vérité)

Extrait des maquettes web (`web/HSM_Home.html`, `web/HSM_Admin.html`) :

| Token        | Valeur      |
|--------------|-------------|
| Fond         | `#0a0a0a`   |
| Rouge        | `#E31C25` (hover `#ff3b44`) |
| Or           | `#E8B23D`   |
| Police       | Inter       |

L'app et le web **doivent** rester alignés sur ces tokens
(`app/src/theme/index.ts`).

## 📱 App mobile (`app/`)

```bash
cd app
npm install
cp .env.example .env       # renseigner les clés Supabase (optionnel en démo)
npx expo start             # Expo Go : scanner le QR code
```

Sans clés Supabase, l'app démarre sur les **données de démo**
(`app/src/data/mock.ts`), strictement identiques à la maquette web.
Dès que `.env` est renseigné, la couche `app/src/data/repository.ts`
bascule automatiquement sur Supabase.

Écran de référence terminé : **Home** (`app/src/screens/HomeScreen.tsx`).
Écrans à venir : En direct, Émissions, Charts, Compte, Admin.

## 🌐 Site web (`web/`)

Maquettes autonomes (rendu JavaScript). À brancher sur Supabase via le
client `@supabase/supabase-js` (mêmes tables que l'app).

## 🗄️ Backend Supabase (`supabase/`)

- `migrations/0001_init.sql` — schéma complet (profiles, shows, videos,
  subscriptions, events, schedule, polls, notifications, playlists,
  partners, modération…).
- `migrations/0002_rls.sql` — Row Level Security (public / membres / admin).
- `seed.sql` — données de démo issues des maquettes.

Application (via le dashboard Supabase ou la CLI) :

```bash
supabase db push          # applique les migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # charge les données de démo
```

Générer les types TypeScript depuis le schéma :

```bash
supabase gen types typescript --project-id <ref> > app/src/lib/database.types.ts
```

## 🗺️ Roadmap

- [x] Backend : schéma + RLS + seed
- [x] App : design system, client Supabase, écran Home
- [ ] App : écrans Live / Émissions / Charts / Compte / Auth
- [ ] App : Admin (création émissions, modération, programmation)
- [ ] Web : branchement Supabase sur les maquettes
- [ ] Création du projet Supabase HSM + application des migrations
```
