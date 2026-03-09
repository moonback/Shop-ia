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
| 7 | **Click & Collect** | Option retrait en boutique ou marché local | ✅ |
| 8 | **Compte client** | Profil, historique commandes, adresses | ✅ |
| 9 | **Layout premium** | Design system Tailwind, animations Motion | ✅ |
| 10 | **SEO de base** | Meta tags, URLs sémantiques, sitemap | ✅ |

---

## ✅ V0 — Intelligence Artificielle (Livré)

Shopia Assistant et fonctionnalités IA.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Shopia Assistant Chat** | Conseiller IA conversationnel avec contexte produit terroir | ✅ |
| 2 | **Quiz de préférences** | Questions pour personnaliser recommandations gastronomiques | ✅ |
| 3 | **Recherche vectorielle** | Embeddings pgvector pour recherche sémantique | ✅ |
| 4 | **Intégration OpenRouter** | LLM pour génération de réponses | ✅ |
| 5 | **Conseiller vocal (Gemini)** | Chat vocal temps réel WebSocket | ✅ |
| 6 | **Mémoire conversations** | Historique et contexte utilisateur | ✅ |
| 7 | **Suggestions intelligentes** | Produits recommandés selon profil et saison | ✅ |
| 8 | **Enrichissement IA produits** | Génération automatique descriptions, Nutriscore, tags | ✅ |
| 9 | **Sync vecteurs manquants** | Détection et indexation des produits sans embedding | ✅ |

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
| 2 | **Gestion produits** | CRUD, stocks, images, bundles, Nutriscore | ✅ |
| 3 | **Gestion catégories** | CRUD avec icônes et ordonnancement | ✅ |
| 4 | **Gestion commandes** | Workflow complet, filtres, actions bulk | ✅ |
| 5 | **Gestion clients** | Profils, historique, droits admin | ✅ |
| 6 | **Gestion stocks** | Mouvements, alertes, ajustements | ✅ |
| 7 | **Configuration boutique** | Paramètres généraux, livraison, SEO | ✅ |
| 8 | **Marketing & Promo** | Codes promo, parrainage, newsletters | ✅ |
| 9 | **Import CSV produits** | Import en masse avec validation et feedback | ✅ |
| 10 | **Export CSV catalogue** | Export complet avec BOM pour Excel | ✅ |
| 11 | **Génération catalogue terroir** | Seed de 22 produits alimentaires avec catégories auto-créées | ✅ |

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
| 6 | **Page producteur** | Fiche dédiée par producteur avec story, photos, carte | 🚧 |

---

## 📋 V1 — Catalogue & Produits Alimentaires (Planifié)

Enrichissement spécifique aux produits du terroir.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Nutriscore affiché** | Badge Nutriscore visible sur fiches et listings | ✅  |
| 2 | **Origine géographique** | Région, appellation, label (AOP/IGP/Bio) | 📋 |
| 3 | **Allergènes** | Déclaration obligatoire CE 1169/2011 | 📋 |
| 4 | **Saisonnalité** | Indicateur de disponibilité par mois | 📋 |
| 5 | **Accords mets & vins** | Suggestions générées par l'IA | 📋 |
| 6 | **Recettes liées** | Suggestions de recettes utilisant le produit | 📋 |
| 7 | **Variantes produit** | Poids, conditionnement, maturité (ex : fromage 6 mois / 12 mois) | 📋 |

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
| 4 | **Newsletter** | Campagnes marketing, segmentation | 📋 |
| 5 | **Rappels panier abandonné** | Email de relance automatique | 📋 |
| 6 | **Alertes nouveaux produits** | Notification arrivée selon préférences client | 📋 |

---

## 💡 V2+ — Producteurs & Marketplace (Idées)

Évolution vers une plateforme multi-producteurs.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Espace producteur** | Dashboard dédié, gestion de leur stock, stats ventes | 💡 |
| 2 | **Marketplace multi-vendeurs** | Commissions, paiements séparés, onboarding | 💡 |
| 3 | **Carte interactive** | Géolocalisation des producteurs sur une carte | 💡 |
| 4 | **Box abonnement découverte** | Sélection mensuelle curatée par région ou thème | 💡 |
| 5 | **Certification labels** | AOP, IGP, Bio, Fait-Maison — vérification et badge | 💡 |
| 6 | **Drive fermier** | Commande groupée avec livraison en point relais | 💡 |

---

## 💡 V2+ — IA & Personnalisation (Idées)

Évolutions futures IA.

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Inventory AI** | Prédiction ruptures de stock, suggestions réappro saisonnière | 💡 |
| 2 | **Menu planificateur** | IA suggère un menu de la semaine à partir du panier | 💡 |
| 3 | **Profil gustatif** | Quiz sensoriel pour affiner les recommandations (textures, goûts) | 💡 |
| 4 | **Personnalisation prix** | Tarifs fidélité dynamiques selon fréquence d'achat | 💡 |
| 5 | **Voice commerce** | Commandes vocales complètes via Shopia | 💡 |
| 6 | **Traçabilité blockchain** | Certificats d'origine produits sur chaîne | 💡 |

---

## 💡 V2+ — Fonctionnalités Avancées (Idées)

| # | Fonctionnalité | Description | Statut |
|---|----------------|-------------|--------|
| 1 | **Mode Offline POS** | Fonctionnement sans connexion (IndexedDB) | 💡 |
| 2 | **Application mobile** | React Native / Capacitor | 💡 |
| 3 | **Multi-boutique** | Architecture SaaS multi-tenants | 💡 |
| 4 | **Livraison optimisée** | Intégration transporteurs, tracking temps réel | 💡 |
| 5 | **Chat support intégré** | Support client live depuis l'interface | 💡 |
| 6 | **Analytics avancés** | Segmentation, LTV, cohortes, A/B testing | 💡 |

---

## 📊 Vue d'ensemble

```
V0 (Livré)               ████████████████████████████████████████ 100%
V1 UX/UI (En cours)      ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  30%
V1 Produits terroir      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
V1 Paiement              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
V2+ Marketplace          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🗓️ Planning indicatif

| Phase | Période | Focus |
|-------|---------|-------|
| **V1.0** | Q2 2026 | Paiement, facturation, emails, page producteur |
| **V1.1** | Q3 2026 | Catalogue terroir (Nutriscore, allergènes, origine, saisonnalité) |
| **V1.2** | Q4 2026 | PWA, performance, notifications push |
| **V2.0** | 2027 | Marketplace multi-producteurs, espace producteur |

---

## 📝 Backlog

Idées non priorisées :

- [ ] Intégration Instagram Shopping (photos produits du marché)
- [ ] Programme d'affiliation avancé
- [ ] API publique pour développeurs tiers
- [ ] Intégration comptabilité (QuickBooks, Pennylane)
- [ ] Bornes interactives marché / épicerie fine
- [ ] Réalité augmentée (visualisation emballage, étiquette)
- [ ] Gamification (badges Épicurien, Chef, Explorateur…)
- [ ] Intégration avis Trustpilot / Google Reviews
- [ ] Conciergerie VIP (sélection personnalisée par un expert)
- [ ] Intégration Deliveroo / Uber Eats pour les restaurants

---

<p align="center">
  Roadmap | Shop-ia | Dernière mise à jour : Mars 2026
</p>
