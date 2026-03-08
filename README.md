# Shop-ia — Votre Épicerie Intelligente & Assistant POS 🛒🤖

Shop-ia est une plateforme e-commerce moderne couplée à un système d'encaissement (POS) pour la vente physique, boostée par l'Intelligence Artificielle. Elle allie gestion des produits, tunnel de vente fluide, programme de fidélité et recommandations par IA (recherche vectorielle et assistance vocale).

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🛠 Stack Technique

| Technologie | Rôle | Version |
| --- | --- | --- |
| **React** | Framework Frontend (SPA) | 19.0.0 |
| **Vite** | Bundler & Dev Server | 6.2.0 |
| **Tailwind CSS** | Styling & Utility classes | 4.1.14 |
| **Zustand** | Gestion d'état global | 5.0.11 |
| **Supabase** | Backend/Auth/BDD (PostgreSQL) | 2.98.0 |
| **GenAI / OpenRouter** | Modèles IA (Assistant & Embeddings) | 1.29.0 |

## ✨ Fonctionnalités Principales

- **Expérience Client (B2C)**
  - Catalogue intelligent avec recherche prédictive et vectorielle.
  - Panier d'achat, tunnel de paiement sécurisé (Viva Wallet) et abonnements.
  - Assistant IA intégré (Chat et Vocal temps réel).
  - Programme de fidélité avancé (Points, carte digitale, parrainage).
- **Administration & POS (Point of Sale)**
  - Caisse enregistreuse rapide pour boutique (scanner QR Code).
  - Terminal client/écran LCD dédié (Customer Display).
  - Gestion des commandes, produits, catégories et stocks.

## ⚙️ Prérequis

- **Node.js**: v18+ recommandé
- **NPM**: v9+ (ou `yarn`, `pnpm`)
- Un projet [Supabase](https://supabase.com) configuré avec Base de données.
- Clés API Google Gemini / OpenRouter pour l'IA.

## 🚀 Installation

1. Cloner le projet :
```bash
git clone https://github.com/votre-user/shop-ia.git
cd shop-ia
```

2. Installer les dépendances :
```bash
npm install
```

3. Configuration des variables (voir section ci-dessous) :
```bash
cp .env.example .env
```

4. Initialiser la BD Supabase (Copier/coller le contenu de `supabase/init_database.sql` dans le SQL Editor de Supabase)

## 🔑 Configuration (.env)

| Variable | Description | Exemple | Requis |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | `https://xyz.supabase.co` | OUI |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme d'accès Supabase | `eyJhb...` | OUI |
| `VITE_GEMINI_API_KEY` | API Key Google Gemini (Assistant) | `AIzaSy...` | NON* |
| `VITE_OPENROUTER_API_KEY` | Clé API Embeddings OpenRouter | `sk-or-v1-...` | NON* |
| `VITE_VIVA_WALLET_BASE_URL` | Endpoint Viva Payments | `https://demo.vivapayments.com` | NON |

*(Requis si vous souhaitez tester les fonctionnalités d'IA)*

## 💻 Lancement

```bash
# Lancement en développement (Hot Reload)
npm run dev

# Construction pour la production
npm run build && npm run preview
```

## 📁 Structure du Projet

```text
src/
├── components/   # Composants réutilisables (CartSidebar, Assistant IA, Header...)
├── hooks/        # Custom React Hooks
├── lib/          # Logique métier, clients API (Supabase, embeddings)
├── pages/        # Vues principales / Routage (Catalogue, POS, Admin...)
├── store/        # Stores Zustand (Cart, Auth, Settings)
├── App.tsx       # Déclaration des Routes
└── index.css     # Styles globaux (Tailwind variables)
supabase/
└── init_database.sql # Scripts de création de la BD PostgreSQL
```

## 🤝 Contribuer
Lisez notre guide [CONTRIBUTING.md](./CONTRIBUTING.md) pour les détails du processus de pull request.

## 📄 Licence
Sauf mention contraire, ce projet est sous licence MIT.
