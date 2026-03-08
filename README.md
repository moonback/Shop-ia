# Shop-ia

## Pitch
Shop-ia est une application e-commerce orientée épicerie fine, pensée pour une boutique physique qui vend aussi en ligne.
Elle propose un catalogue produit, un panier, un tunnel de commande et un espace client complet (adresses, commandes, fidélité, favoris).
Un back-office admin est intégré pour gérer produits, catégories, commandes, promotions, stocks, clients et POS (point de vente).
Le produit inclut aussi un assistant IA (chat + voix) pour recommander des produits via OpenRouter, Gemini Live et la recherche vectorielle Supabase.
La cible principale est une équipe retail qui veut centraliser vente en ligne + magasin dans une même base de données sécurisée (RLS Supabase).

## Badges
![Build](https://img.shields.io/badge/build-%C3%A0%20configurer-lightgrey)
![Licence](https://img.shields.io/badge/licence-MIT-green)
![Version](https://img.shields.io/badge/version-0.0.0-blue)

## Stack technique

| Technologie | Rôle | Version détectée |
|---|---|---|
| React | UI frontend SPA | 19.0.0 |
| TypeScript | Typage statique | ~5.8.2 |
| Vite | Dev server + build frontend | ^6.2.0 |
| Tailwind CSS | Styles utilitaires | ^4.1.14 |
| Zustand | State management client | ^5.0.11 |
| React Router DOM | Routing SPA | ^7.13.1 |
| Supabase JS | Auth, DB Postgres, Storage, RPC | ^2.98.0 |
| PostgreSQL + pgvector | Données + recherche vectorielle | via Supabase |
| OpenRouter API | Chat LLM + embeddings | API externe |
| Google Gemini (`@google/genai`) | Voix temps réel (Gemini Live) | ^1.29.0 |
| Recharts | Graphiques dashboard admin | ^3.7.0 |
| PapaParse | Imports CSV produits/catégories | ^5.5.3 |
| html5-qrcode | Scan QR côté POS | ^2.3.8 |

## Fonctionnalités principales

### Côté utilisateur
- Navigation catalogue et pages vitrines (home, boutique, guides, qualité).
- Fiche produit détaillée avec suggestions/recommandations.
- Panier persistant + application de codes promo.
- Checkout (click & collect / livraison), création de commande et lignes de commande.
- Espace compte : profil, adresses, commandes, abonnements, fidélité, avis, favoris, parrainage.
- Assistant IA texte + assistant vocal (Gemini Live) avec mémoire utilisateur.

### Côté administrateur
- Dashboard opérationnel (KPIs, analytics, commandes, clients).
- Gestion CRUD produits/catégories + import CSV + upload d'images (bucket Supabase Storage).
- Gestion stocks, promotions, abonnements, recommandations croisées, avis.
- POS intégré (vente en boutique, scanner QR, clôtures, rapports).
- Paramétrage du comportement assistant IA via `store_settings`.

## Prérequis
- Node.js **>= 20** recommandé (Vite 6 + toolchain moderne).
- npm **>= 10** recommandé.
- Un projet Supabase avec DB initialisée via `supabase/init_database.sql`.
- Clés API pour OpenRouter et Gemini si vous utilisez les fonctions IA.

## Installation
1. Cloner le dépôt.
2. Installer les dépendances.
3. Configurer les variables d'environnement.
4. Lancer le projet.

```bash
git clone <URL_DU_REPO>
cd Shop-ia
npm install
cp .env.example .env
```

## Configuration

| Variable | Description | Exemple | Obligatoire |
|---|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` | Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJ...` | Oui |
| `VITE_OPENROUTER_API_KEY` | Clé API OpenRouter (chat + embeddings) | `sk-or-...` | Oui (IA) |
| `VITE_OPENROUTER_EMBED_MODEL` | Modèle d'embedding OpenRouter | `openai/text-embedding-3-small` | Non |
| `VITE_OPENROUTER_EMBED_DIMENSIONS` | Dimensions embeddings attendues | `768` | Non |
| `VITE_GEMINI_API_KEY` | Clé Gemini Live pour voix | `AIza...` | Oui (voix) |
| `GEMINI_API_KEY` | Variable exposée dans la config Vite (`process.env.GEMINI_API_KEY`) | `AIza...` | Non |
| `APP_URL` | URL de déploiement de l'app | `https://app.exemple.com` | Non |
| `VITE_VIVA_WALLET_BASE_URL` | Base URL Viva Wallet | `https://demo.vivapayments.com` | Non |
| `VITE_VIVA_CLIENT_ID` | Client ID Viva | `...` | Non |
| `VITE_VIVA_CLIENT_SECRET` | Secret Viva (⚠️ ne pas exposer en client) | `...` | ⚠️ À compléter : actuellement présent dans `.env.example` mais non exploité côté serveur |
| `VIVA_MERCHANT_ID` | Merchant ID Viva | `...` | Non |
| `VIVA_API_KEY` | API key Viva | `...` | Non |
| `DISABLE_HMR` | Désactive HMR en dev | `true` | Non |
| `OPENROUTER_API_KEY` | Clé OpenRouter utilisée par scripts Node (`sync_vectors.ts`) | `sk-or-...` | Non (scripts) |
| `OPENROUTER_SITE_URL` | Header HTTP-Referer scripts OpenRouter | `http://localhost:3000` | Non |
| `OPENROUTER_APP_NAME` | Header X-Title scripts OpenRouter | `Shop-ia Vector Sync` | Non |

## Lancement

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

## Structure du projet

```text
.
├── src/
│   ├── components/        # UI partagée + UI admin + assistant
│   ├── pages/             # Pages routées (public, compte, admin, POS)
│   ├── hooks/             # Hooks métier (chat IA, voix, mémoire, etc.)
│   ├── store/             # Stores Zustand (auth, panier, wishlist, settings)
│   ├── lib/               # Clients, helpers, prompts IA, types, SEO
│   └── seo/               # Provider SEO applicatif
├── supabase/
│   ├── init_database.sql  # Schéma principal, fonctions SQL, RLS, storage
│   └── *.sql/js/cjs       # Scripts correctifs et maintenance
├── scripts/               # Scripts techniques (sync embeddings, sitemap)
├── public/                # Assets statiques, sitemaps, PWA
└── docs/                  # Documents produit/stratégie
```

## Contribuer
Voir [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licence
Ce projet est distribué sous licence **MIT**.
