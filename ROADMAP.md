# Roadmap — Shop-ia

> Feuille de route du projet avec les fonctionnalités livrées, en cours et planifiées.

---

## 🏷️ Légende

| Statut | Emoji | Description |
|--------|-------|-------------|
| **Fait** | ✅ | Fonctionnalité livrée et stable |
| **En cours** | 🚧 | Développement actif |
| **Planifié** | 📋 | Priorisé pour les 3 prochains mois |
| **Idée** | 💡 | À l'étude, pas encore planifié |

---

## ✅ V0 — Socle E-commerce (Livré)

Fonctionnalités fondamentales de la plateforme.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Catalogue produits** | CRUD produits, catégories, images, SEO | ✅ |
| 2 | **Panier d'achat** | Ajout/suppression, quantités, persistance localStorage | ✅ |
| 3 | **Authentification** | Inscription, connexion, mot de passe oublié (Supabase Auth) | ✅ |
| 4 | **Tunnel de commande** | Adresses, livraison, récapitulatif | ✅ |
| 5 | **Paiement Viva Wallet** | Intégration iframe, webhooks, confirmation | ✅ |
| 6 | **Gestion des commandes** | Workflow statuts (pending → paid → shipped → delivered) | ✅ |
| 7 | **Click & Collect** | Option retrait en magasin | ✅ |
| 8 | **Compte client** | Profil, historique commandes, adresses | ✅ |
| 9 | **Layout premium** | Design system Tailwind, animations Motion | ✅ |
| 10 | **SEO de base** | Meta tags, URLs sémantiques, sitemap | ✅ |

---

## ✅ V0 — Intelligence Artificielle (Livré)

Shopia Assistant et fonctionnalités IA.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Shopia Assistant Chat** | Conseiller IA conversationnel avec contexte produit | ✅ |
| 2 | **Quiz de préférences** | Questions pour personnaliser recommandations | ✅ |
| 3 | **Recherche vectorielle** | Embeddings pgvector pour recherche sémantique | ✅ |
| 4 | **Intégration OpenRouter** | LLM pour génération de réponses | ✅ |
| 5 | **Conseiller vocal (Gemini)** | Chat vocal temps réel WebSocket | ✅ |
| 6 | **Mémoire conversations** | Historique et contexte utilisateur | ✅ |
| 7 | **Suggestions intelligentes** | Produits recommandés selon profil | ✅ |

---

## ✅ V0 — Fidélité & Engagement (Livré)

Programme de fidélité et système de parrainage.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Points de fidélité** | Gagnés à l'achat, historique complet | ✅ |
| 2 | **Carte digitale** | QR Code avec solde et avantages | ✅ |
| 3 | **Système de parrainage** | Code personnel, bonus bienvenue, tracking | ✅ |
| 4 | **Codes promo** | Réductions fixes et pourcentages | ✅ |
| 5 | **Avis vérifiés** | Notation post-achat, modération | ✅ |
| 6 | **Liste de souhaits** | Favoris persistant cross-device | ✅ |

---

## ✅ V0 — Administration (Livré)

Back-office complet pour les administrateurs.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Dashboard analytics** | Revenus, commandes, top produits (Recharts) | ✅ |
| 2 | **Gestion produits** | CRUD, stocks, images, bundles | ✅ |
| 3 | **Gestion catégories** | CRUD avec icônes et ordonnancement | ✅ |
| 4 | **Gestion commandes** | Workflow complet, filtres, actions bulk | ✅ |
| 5 | **Gestion clients** | Profils, historique, droits admin | ✅ |
| 6 | **Gestion stocks** | Mouvements, alertes, ajustements | ✅ |
| 7 | **Configuration boutique** | Paramètres généraux, livraison, SEO | ✅ |
| 8 | **Marketing & Promo** | Codes promo, parrainage, newsletters | ✅ |

---

## ✅ V0 — Point de Vente (Livré)

Module caisse pour vente physique.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Interface POS** | Caisse tactile rapide, scanner QR | ✅ |
| 2 | **Customer Display** | Écran client secondaire (affichage prix) | ✅ |
| 3 | **Paiement multicanal** | Espèces, carte, mobile | ✅ |
| 4 | **Création client rapide** | Profil minimal depuis la caisse | ✅ |
| 5 | **Rapports de caisse** | Clôture journalière, comptage | ✅ |

---

## 🚧 V1 — Améliorations UX/UI (En cours)

Optimisations de l'expérience utilisateur.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Refonte dashboard admin** | Nouveau design, dark mode, widgets personnalisables | 🚧 |
| 2 | **Filtres avancés commandes** | Recherche multi-critères, export CSV | 🚧 |
| 3 | **Édition client admin** | Modifier profil, points, statut depuis l'admin | ✅ |
| 4 | **Optimisation mobile** | Responsive admin, gestures tactiles | 🚧 |
| 5 | **Performance frontend** | Lazy loading, code splitting, PWA | 📋 |

---

## 📋 V1 — Paiement & Facturation (Planifié)

Améliorations du module paiement.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Webhooks Viva Wallet** | Synchro temps réel statuts paiement | 📋 |
| 2 | **Facturation auto PDF** | Génération et envoi automatique | 📋 |
| 3 | **Paiement par wallet** | Apple Pay, Google Pay | 📋 |
| 4 | **Remboursements** | Gestion des annulations et refunds | 📋 |
| 5 | **Abonnements paiement** | Prélèvement automatique récurrent | 📋 |

---

## 📋 V1 — Notifications & Communication (Planifié)

Système de notifications multicanal.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Emails transactionnels** | Confirmation commande, expédition, livraison | 📋 |
| 2 | **SMS notifications** | Alertes statut commande | 📋 |
| 3 | **Push notifications** | Navigateur et mobile (PWA) | 📋 |
| 4 | **Newsletter** | Campagnes marketing, segmentation | � |
| 5 | **Rappels panier abandonné** | Email de relance automatique | 📋 |

---

## 💡 V2+ — Fonctionnalités Avancées (Idées)

Évolutions futures à l'étude.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Inventory AI** | Prédiction ruptures de stock, suggestions réappro | 💡 |
| 2 | **Mode Offline POS** | Fonctionnement sans connexion (IndexedDB) | 💡 |
| 3 | **Multi-boutique** | Architecture SaaS multi-tenants | 💡 |
| 4 | **Marketplace** | Vendeurs tiers, commissions | 💡 |
| 5 | **Livraison optimisée** | Intégration transporteurs, tracking | 💡 |
| 6 | **Chat temps réel** | Support client intégré | 💡 |
| 7 | **Analytics avancés** | Segmentation, LTV, cohortes | 💡 |
| 8 | **Application mobile** | React Native / Capacitor | 💡 |
| 9 | **Blockchain traçabilité** | Certificats produits CBD | 💡 |
| 10 | **Voice commerce** | Commandes vocales complètes | 💡 |

---

## 📊 Vue d'ensemble

```
V0 (Livré)          ████████████████████████████████████████ 100%
V1 (En cours)       ████████████████████░░░░░░░░░░░░░░░░░░░░  50%
V2+ (Idées)         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🗓️ Planning indicatif

| Phase | Période | Focus |
|-------|---------|-------|
| **V1.0** | Q2 2026 | Paiement, facturation, emails |
| **V1.1** | Q3 2026 | PWA, performance, mobile |
| **V2.0** | 2027 | Multi-boutique, marketplace |

---

## 📝 Backlog

Idées non priorisées :

- [ ] Intégration Instagram Shopping
- [ ] Programme d'affiliation avancé
- [ ] API publique pour développeurs tiers
- [ ] Intégration comptabilité (QuickBooks, etc.)
- [ ] Bornes interactives magasin
- [ ] Réalité augmentée (visualisation produits)
- [ ] Gamification (badges, défis)
- [ ] Intégration avis Trustpilot
- [ ] Abonnements box découverte
- [ ] Conciergerie VIP

---

<p align="center">
  Roadmap | Shop-ia | Dernière mise à jour : Mars 2026
</p>
