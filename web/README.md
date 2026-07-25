# HSM — Site web

Site public **Haitian Stars Media**, connecté en direct au backend Supabase
partagé avec l'app mobile.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Site web live (design HSM + données Supabase, sans build) |
| `config.js`  | URL + clé publishable Supabase (publique, protégée par RLS) |
| `mockups/`   | Maquettes d'origine (Home + Admin) — référence design |

## Lancer en local

Le site utilise des modules ES + `fetch` : il faut le servir par HTTP
(pas d'ouverture `file://`).

```bash
cd web
npx serve .          # ou : python3 -m http.server 8080
```

Puis ouvrir l'URL indiquée. La pastille en bas à droite confirme la
connexion Supabase (« ● En ligne — données Supabase »).

## Ce qui est branché sur Supabase

- **Émissions en direct** — table `shows` (badges live/star, spectateurs, verrou premium)
- **Événement à la une** — table `events` (avec compte à rebours)
- **Sondage** — vue `poll_results` (résultats en %) ; le vote se fait dans l'app (auth requise)
- **Partenaires** — table `partners`

## Déploiement

N'importe quel hébergeur statique (Vercel, Netlify, GitHub Pages,
Cloudflare Pages) : déployer le dossier `web/` tel quel. Aucune étape de
build. Pense à garder `config.js` à jour si le projet Supabase change.

> Les maquettes `mockups/` restent la **source de vérité du design**
> (couleurs, typographie, structure) pour l'app comme pour le site.
