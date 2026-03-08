# API_DOCS

> Cette application consomme majoritairement l'API Supabase (Auth, PostgREST, RPC, Storage) via le SDK JavaScript. Il n'existe pas de serveur REST custom versionné (`/api/*`) implémenté dans `src/`.

## Authentification

### POST `/auth/v1/token?grant_type=password`
- **Description** : connexion utilisateur email/mot de passe (`supabase.auth.signInWithPassword`).
- **Auth requise** : non.

| Nom | Type | Requis | Description |
|---|---|---|---|
| `email` | string | Oui | Email utilisateur |
| `password` | string | Oui | Mot de passe |

```bash
curl -X POST "$VITE_SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

**Réponse succès (200)**
```json
{"access_token":"...","refresh_token":"...","user":{"id":"uuid"}}
```

**Réponse erreur (400/401)**
```json
{"error":"invalid_grant","error_description":"Invalid login credentials"}
```

**Codes HTTP** : `200`, `400`, `401`.

### POST `/auth/v1/signup`
- **Description** : inscription (`supabase.auth.signUp`) avec création de profil via trigger SQL.
- **Auth requise** : non.

### POST `/auth/v1/recover`
- **Description** : envoi email de réinitialisation (`supabase.auth.resetPasswordForEmail`).
- **Auth requise** : non.

### PUT `/auth/v1/user`
- **Description** : mise à jour du mot de passe (`supabase.auth.updateUser`).
- **Auth requise** : oui (Bearer JWT).

---

## Données métier (PostgREST `/rest/v1`)

> Les opérations sont faites via `supabase.from('<table>')`.

### Produits & catalogue

#### GET `/rest/v1/products`
- **Description** : lecture catalogue (listing, détail, recherche texte, filtres `is_active`/`is_available`).
- **Auth requise** : non (RLS lecture publique).
- **Query courantes** : `select`, `eq`, `ilike`, `order`, `limit`.

#### POST/PATCH `/rest/v1/products`
- **Description** : création/mise à jour produit (admin).
- **Auth requise** : oui (admin via policy SQL `is_admin`).

### Catégories
#### GET `/rest/v1/categories`
- **Description** : récupération catégories actives.
- **Auth requise** : non.

#### POST/PATCH/DELETE `/rest/v1/categories`
- **Description** : administration des catégories.
- **Auth requise** : oui (admin).

### Commandes
#### POST `/rest/v1/orders`
- **Description** : création commande client/POS.
- **Auth requise** : oui.

#### GET `/rest/v1/orders`
- **Description** : listing commandes utilisateur ou admin.
- **Auth requise** : oui.

#### PATCH `/rest/v1/orders`
- **Description** : update statut commande.
- **Auth requise** : oui (admin pour update).

### Lignes de commande
#### POST `/rest/v1/order_items`
- **Description** : insertion des lignes après création commande.
- **Auth requise** : oui.

### Profil & compte
- `GET/PATCH /rest/v1/profiles`
- `GET/POST/PATCH/DELETE /rest/v1/addresses`
- `GET /rest/v1/loyalty_transactions`
- `GET/POST/PATCH /rest/v1/subscriptions`
- `POST /rest/v1/reviews`, `PATCH/DELETE /rest/v1/reviews` (admin modération)
- `GET /rest/v1/referrals`

### Marketing & paramètres
- `GET/POST/PATCH/DELETE /rest/v1/promo_codes` (admin écriture)
- `GET/POST /rest/v1/store_settings` (lecture publique, écriture admin)
- `GET/POST/PATCH/DELETE /rest/v1/product_recommendations` (admin)

### Assistant IA
- `GET/POST/PATCH /rest/v1/user_ai_preferences`
- `GET/POST/PATCH /rest/v1/assistant_interactions`

### POS / Opérations internes
- `POST /rest/v1/stock_movements`
- `GET/POST /rest/v1/pos_reports`
- `GET/POST/PATCH/DELETE /rest/v1/user_active_sessions`

**Exemple requête PostgREST**
```bash
curl "$VITE_SUPABASE_URL/rest/v1/products?select=*&is_active=eq.true&limit=10" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_JWT"
```

**Réponse succès (200)**
```json
[{"id":"uuid","name":"Huile d'olive","price":"19.90"}]
```

**Réponse erreur (401/403)**
```json
{"message":"new row violates row-level security policy"}
```

**Codes HTTP usuels** : `200`, `201`, `204`, `400`, `401`, `403`, `409`.

---

## RPC SQL (`/rest/v1/rpc/*`)

### POST `/rest/v1/rpc/match_products`
- **Description** : recherche vectorielle de produits similaires.
- **Auth requise** : oui (session requise côté app).

| Nom | Type | Requis | Description |
|---|---|---|---|
| `query_embedding` | number[] | Oui | Embedding de requête |
| `match_threshold` | number | Oui | Seuil de similarité |
| `match_count` | number | Oui | Nombre max de résultats |

### POST `/rest/v1/rpc/increment_promo_uses`
- **Description** : incrémente le compteur d'usage d'un code promo.
- **Auth requise** : oui.

| Nom | Type | Requis | Description |
|---|---|---|---|
| `code_text` | string | Oui | Code promo |

### POST `/rest/v1/rpc/sync_bundle_stock`
- **Description** : recalcule automatiquement le stock d'un bundle.
- **Auth requise** : oui (admin en pratique).

| Nom | Type | Requis | Description |
|---|---|---|---|
| `p_bundle_id` | uuid | Oui | Produit bundle ciblé |

### POST `/rest/v1/rpc/get_product_recommendations`
- **Description** : récupère recommandations manuelles + fallback catégorie.
- **Auth requise** : non/oui selon policy lecture produits.

### POST `/rest/v1/rpc/create_pos_customer`
- **Description** : crée un client depuis POS (auth user + profil).
- **Auth requise** : oui (admin strict).

### POST `/rest/v1/rpc/admin_get_user_email`
- **Description** : récupère l'email d'un utilisateur depuis admin.
- **Auth requise** : oui (admin strict).

**Exemple RPC**
```bash
curl -X POST "$VITE_SUPABASE_URL/rest/v1/rpc/match_products" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"query_embedding":[0.01,0.02],"match_threshold":0.65,"match_count":6}'
```

**Réponse succès (200)**
```json
[{"id":"uuid","name":"Produit A","similarity":0.82}]
```

**Réponse erreur (400/403)**
```json
{"code":"PGRST301","message":"Unauthorized"}
```

---

## Storage (Supabase)

### POST `/storage/v1/object/product-images/<filename>`
- **Description** : upload image produit (`supabase.storage.from('product-images').upload`).
- **Auth requise** : oui (admin policy).

### GET `/storage/v1/object/public/product-images/<filename>`
- **Description** : URL publique image produit.
- **Auth requise** : non.

---

## Services externes non-Supabase

### POST `https://openrouter.ai/api/v1/chat/completions`
- **Description** : génération de réponse assistant / génération marketing IA.
- **Auth requise** : clé API OpenRouter (`Authorization: Bearer`).

### POST `https://openrouter.ai/api/v1/embeddings`
- **Description** : embeddings texte pour recherche sémantique.
- **Auth requise** : clé API OpenRouter.

### Gemini Live API (WebSocket)
- **Description** : conversation vocale temps réel (`useGeminiLiveVoice`).
- **Auth requise** : clé API Gemini.

> ⚠️ À compléter : la documentation Viva Wallet ne peut pas être détaillée ici car les appels backend de paiement sont commentés dans `Checkout.tsx`.
