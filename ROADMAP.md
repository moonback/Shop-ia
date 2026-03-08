# ROADMAP

## V0 — Fonctionnalités livrées

| Élément | Statut | Notes |
|---|---|---|
| SPA e-commerce (catalogue, panier, checkout, compte) | ✅ Fait | Routes publiques + protégées en place |
| Back-office admin (produits, catégories, commandes, stocks, clients) | ✅ Fait | Onglets admin dédiés |
| POS (point de vente) | ✅ Fait | Page POS + customer display + rapports |
| Authentification et profils Supabase | ✅ Fait | Login, signup, reset, profile |
| Fidélité, parrainage, abonnements, avis | ✅ Fait | Tables + écrans dédiés |
| Assistant IA texte + recherche vectorielle | ✅ Fait | OpenRouter + RPC `match_products` |
| Assistant vocal Gemini Live | ✅ Fait | Hook `useGeminiLiveVoice` |
| RLS et policies SQL | ✅ Fait | Activées sur toutes les tables clés |

## V1 — Priorités court terme (< 3 mois)

| Élément | Statut | Notes |
|---|---|---|
| Industrialiser CI/CD (build, lint, tests) | 📋 Planifié | Badges build actuellement placeholders |
| Couvrir les flux critiques par tests E2E | 📋 Planifié | Checkout, admin produits, POS |
| Clarifier intégration paiement Viva côté backend sécurisé | 📋 Planifié | Éviter secrets côté client |
| Nettoyer dépendances non utilisées (ex: express) | 📋 Planifié | Réduire surface maintenance |
| Documentation API plus contractuelle (OpenAPI) | 📋 Planifié | Actuellement docs descriptives |

## V2+ — Vision long terme

| Élément | Statut | Notes |
|---|---|---|
| Multi-boutiques / multi-tenant | 💡 Idée | Séparation des catalogues et settings |
| Moteur de recommandations temps réel enrichi | 💡 Idée | Historique achats + signaux comportementaux |
| Orchestration IA omnicanale (chat, voix, email) | 💡 Idée | Personnalisation cross-canal |
| Application mobile dédiée | 💡 Idée | PWA déjà présente, app native à évaluer |

## Backlog (non planifié)

- 💡 Idée : exporter les rapports POS/analytics en PDF.
- 💡 Idée : webhooks d'événements commande vers outils tiers.
- 💡 Idée : monitoring applicatif avancé (logs centralisés + tracing).
- 💡 Idée : gestion des rôles admin granulaire (RBAC fin).
