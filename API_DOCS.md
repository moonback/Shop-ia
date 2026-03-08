# Référence API — Shop-ia

> Documentation complète des endpoints, fonctions RPC et intégrations externes.

---

## 📋 Table des matières

- [Architecture API](#architecture-api)
- [Authentification](#authentification)
- [Catalogue (Produits & Catégories)](#catalogue-produits--catégories)
- [Recherche Sémantique (Vector Search)](#recherche-sémantique-vector-search)
- [Panier & Commandes](#panier--commandes)
- [Utilisateurs & Profils](#utilisateurs--profils)
- [Fidélité & Parrainage](#fidélité--parrainage)
- [Paiement (Viva Wallet)](#paiement-viva-wallet)
- [Administration](#administration)
- [Fonctions RPC PostgreSQL](#fonctions-rpc-postgresql)
- [Codes HTTP](#codes-http)

---

## Architecture API

Shop-ia utilise une architecture **Backend-as-a-Service** via Supabase :

| Couche | Technologie | Endpoint |
|--------|-------------|----------|
| **Auth** | Supabase Auth | `https://[project].supabase.co/auth/v1/` |
| **Database** | PostgREST | `https://[project].supabase.co/rest/v1/` |
| **Realtime** | Supabase Realtime | `wss://[project].supabase.co/realtime/v1/` |
| **RPC** | PostgreSQL Functions | `/rest/v1/rpc/[function_name]` |
| **AI/ML** | OpenRouter API | `https://openrouter.ai/api/v1/` |
| **Voice** | Google Gemini | `wss://generativelanguage.googleapis.com/` |
| **Payment** | Viva Wallet | `https://demo.vivapayments.com/` |

---

## Authentification

### Supabase Auth (JWT)

Toutes les requêtes authentifiées incluent le header :

```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
```

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/auth/v1/signup` | POST | ❌ | Inscription email/mot de passe |
| `/auth/v1/token?grant_type=password` | POST | ❌ | Connexion |
| `/auth/v1/logout` | POST | ✅ | Déconnexion |
| `/auth/v1/user` | GET | ✅ | Profil utilisateur courant |
| `/auth/v1/recover` | POST | ❌ | Réinitialisation mot de passe |

### Exemple - Connexion

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'client@example.com',
  password: '********'
});

// Response
{
  user: { id: "uuid", email: "..." },
  session: { access_token: "jwt", refresh_token: "..." }
}
```

---

## Catalogue (Produits & Catégories)

### GET `/rest/v1/categories`

Récupère les catégories actives.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `select` | string | ❌ | Colonnes à récupérer (`*, products(count)`) |
| `is_active` | eq | ❌ | Filtre `eq.true` |
| `order` | string | ❌ | Tri (`sort_order.asc`) |

**Exemple**:
```typescript
const { data } = await supabase
  .from('categories')
  .select('*, products:products(count)')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });
```

**Réponse** (200 OK):
```json
[
  {
    "id": "uuid",
    "slug": "fleurs-cbd",
    "name": "Fleurs CBD",
    "description": "...",
    "icon_name": "flower",
    "image_url": "https://...",
    "sort_order": 1,
    "is_active": true,
    "products": [{ "count": 15 }]
  }
]
```

---

### GET `/rest/v1/products`

Récupère les produits avec filtres.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `select` | string | ❌ | Colonnes + joins (`*, category(*), bundle_items(*, product(*))`) |
| `category_id` | eq | ❌ | Filtre par catégorie |
| `is_active` | eq | ❌ | Filtre actif |
| `is_featured` | eq | ❌ | Produits mis en avant |
| `price` | gte/lte | ❌ | Fourchette de prix |
| `embedding` | not.is | ❌ | Produits avec vecteurs (`not.is.null`) |

**Exemple**:
```typescript
const { data } = await supabase
  .from('products')
  .select('*, category(*), bundle_items(*, product(*))')
  .eq('is_active', true)
  .eq('is_available', true)
  .order('created_at', { ascending: false });
```

---

### GET `/rest/v1/products`

Recherche full-text (alternative à vector search).

| Paramètre | Type | Description |
|-----------|------|-------------|
| `name` | ilike | Recherche insensible à la casse `%term%` |
| `description` | ilike | Recherche dans la description |

**Exemple**:
```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', '%%${searchTerm}%%')
  .limit(20);
```

---

## Recherche Sémantique (Vector Search)

### POST `/rest/v1/rpc/match_products`

Recherche de produits par similarité vectorielle (embedding).

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `query_embedding` | `number[]` | ✅ | Vecteur de la requête (3072 dimensions) |
| `match_threshold` | float | ✅ | Seuil de similarité (0.0-1.0, recommandé: 0.7) |
| `match_count` | integer | ✅ | Nombre de résultats max |

**Authentification**: ❌ Public

**Exemple**:
```typescript
// 1. Générer l'embedding via OpenRouter
const embedding = await generateEmbedding("produit pour dormir");

// 2. Rechercher
const { data, error } = await supabase.rpc('match_products', {
  query_embedding: embedding,
  match_threshold: 0.7,
  match_count: 8
});
```

**Réponse** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "Amnesia CBD",
    "slug": "amnesia-cbd",
    "price": 12.90,
    "category_id": "uuid",
    "stock_quantity": 50,
    "attributes": { "benefits": ["relaxation"], "aromas": ["citron"] },
    "similarity": 0.89
  }
]
```

---

### POST `/rest/v1/rpc/get_product_recommendations`

Récupère les recommandations pour un produit (cross-sell).

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `p_product_id` | uuid | ✅ | ID du produit source |
| `p_limit` | integer | ❌ | Nombre de recommandations (défaut: 4) |

**Authentification**: ❌ Public

---

## Panier & Commandes

### GET `/rest/v1/orders`

Récupère les commandes de l'utilisateur connecté (RLS).

| Paramètre | Type | Description |
|-----------|------|-------------|
| `select` | string | `*, order_items(*, product(*)), address(*)` |
| `status` | eq | Filtre par statut |
| `order` | string | `created_at.desc` |

**RLS**: `user_id = auth.uid()` ou `is_admin()`

---

### POST `/rest/v1/orders`

Crée une nouvelle commande.

**Body**:
```json
{
  "user_id": "uuid",
  "status": "pending",
  "delivery_type": "click_collect",
  "address_id": "uuid",
  "subtotal": 49.90,
  "delivery_fee": 0,
  "total": 49.90,
  "loyalty_points_earned": 50,
  "notes": "..."
}
```

**RLS**: `auth.uid() IS NOT NULL`

---

### POST `/rest/v1/order_items`

Ajoute des items à une commande.

**Body**:
```json
{
  "order_id": "uuid",
  "product_id": "uuid",
  "product_name": "Amnesia CBD",
  "unit_price": 12.90,
  "quantity": 2,
  "total_price": 25.80
}
```

---

## Utilisateurs & Profils

### GET `/rest/v1/profiles`

Récupère le profil utilisateur.

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | eq | `eq.auth.uid()` |

**RLS**: `id = auth.uid()` ou `is_admin()`

**Réponse**:
```json
{
  "id": "uuid",
  "full_name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "loyalty_points": 150,
  "referral_code": "GRN-A1B2C3",
  "referred_by_id": null,
  "is_admin": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### PATCH `/rest/v1/profiles`

Met à jour le profil.

**RLS**: `id = auth.uid()`

**Body**:
```json
{
  "full_name": "Nouveau Nom",
  "phone": "+33687654321"
}
```

---

### GET `/rest/v1/addresses`

Récupère les adresses de l'utilisateur.

**RLS**: `user_id = auth.uid()`

---

### POST `/rest/v1/addresses`

Ajoute une adresse.

**Body**:
```json
{
  "user_id": "uuid",
  "label": "Domicile",
  "street": "123 Rue de Paris",
  "city": "Paris",
  "postal_code": "75001",
  "country": "France",
  "is_default": true
}
```

---

## Fidélité & Parrainage

### GET `/rest/v1/loyalty_transactions`

Récupère l'historique des points.

**RLS**: `user_id = auth.uid()`

**Réponse**:
```json
[
  {
    "id": "uuid",
    "type": "earned",
    "points": 50,
    "balance_after": 150,
    "note": "Commande #1234",
    "order": { "id": "uuid", "total": 49.90 },
    "created_at": "2024-03-08T14:30:00Z"
  }
]
```

---

### GET `/rest/v1/referrals`

Récupère les filleuls et statut du parrainage.

**RLS**: `referrer_id = auth.uid()`

---

## Paiement (Viva Wallet)

### Créer une commande Viva

**Endpoint**: `https://demo.vivapayments.com/checkout/v2/orders`

**Méthode**: POST

**Headers**:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body**:
```json
{
  "amount": 4990,
  "customerTrns": "Commande #1234 - Shop-ia",
  "customer": {
    "email": "client@example.com",
    "fullName": "Jean Dupont",
    "phone": "+33612345678"
  },
  "paymentTimeout": 1800,
  "preauth": false,
  "allowRecurring": false,
  "maxInstallments": 0,
  "paymentNotification": true,
  "disableCash": false,
  "disableWallet": false,
  "sourceCode": "default",
  "tags": ["shop-ia", "order-1234"]
}
```

**Réponse** (200 OK):
```json
{
  "orderCode": 1234567890123456
}
```

---

### Redirection paiement

Rediriger l'utilisateur vers :

```
https://demo.vivapayments.com/web/checkout?ref={orderCode}
```

---

### Webhook (Confirmation)

Viva Wallet envoie un POST au webhook configuré :

```json
{
  "EventTypeId": 1796,
  "OrderCode": 1234567890123456,
  "StatusId": "F",
  "TransactionId": "uuid",
  "Amount": 49.90
}
```

---

## Administration

### Admin - Liste des clients

**Endpoint**: `GET /rest/v1/profiles`

**RLS**: `is_admin()` uniquement

**Paramètres**:
| Paramètre | Description |
|-----------|-------------|
| `select` | `*, orders(count)` |
| `order` | `created_at.desc` |

---

### Admin - Modifier un client

**Endpoint**: `PATCH /rest/v1/profiles`

**RLS**: Admin uniquement via `profiles_admin_all` policy

**Body**:
```json
{
  "id": "uuid",
  "loyalty_points": 200,
  "is_admin": false
}
```

---

### Admin - Statistiques (RPC)

| Fonction | Description |
|----------|-------------|
| `admin_get_user_email(p_user_id)` | Récupère l'email d'un client |
| `create_pos_customer(name, phone, email)` | Crée un client depuis le POS |

---

## Fonctions RPC PostgreSQL

### Catalogue

| Fonction | Paramètres | Description |
|----------|------------|-------------|
| `match_products` | `query_embedding`, `match_threshold`, `match_count` | Recherche vectorielle |
| `get_product_recommendations` | `p_product_id`, `p_limit` | Recommandations cross-sell |
| `sync_bundle_stock` | `p_bundle_id` | Synchronise stock bundle |

### Stock

| Fonction | Paramètres | Description |
|----------|------------|-------------|
| `trigger_sync_bundles_on_stock_change` | Trigger | Auto-sync bundles on stock update |

### Utilisateurs

| Fonction | Paramètres | Description |
|----------|------------|-------------|
| `generate_referral_code` | - | Génère code unique GRN-XXXX |
| `tr_generate_referral_code` | Trigger | Auto-gen on profile insert |
| `handle_new_user` | Trigger | Crée profil on auth.users insert |
| `create_pos_customer` | `p_full_name`, `p_phone`, `p_email` | Crée client POS |

### Admin

| Fonction | Paramètres | Description |
|----------|------------|-------------|
| `is_admin` | - | Check si user courant est admin |
| `admin_get_user_email` | `p_user_id` | Get email d'un utilisateur |
| `increment_promo_uses` | `code_text` | Incrémente compteur code promo |

---

## Codes HTTP

| Code | Signification | Contexte |
|------|---------------|----------|
| `200 OK` | Succès | GET, PATCH, RPC |
| `201 Created` | Créé | POST |
| `204 No Content` | Supprimé | DELETE |
| `400 Bad Request` | Requête invalide | Body mal formé |
| `401 Unauthorized` | Non authentifié | JWT manquant/invalid |
| `403 Forbidden` | Non autorisé | RLS policy violée |
| `404 Not Found` | Ressource inexistante | ID invalide |
| `409 Conflict` | Conflit | Duplicate key |
| `422 Unprocessable` | Validation échouée | Contraintes SQL |
| `500 Internal Error` | Erreur serveur | Exception PostgreSQL |
| `503 Service Unavailable` | Service indisponible | Rate limit |

---

## Rate Limits

| Service | Limite |
|---------|--------|
| **Supabase** | 1000 requêtes/min (anon), illimité (service_role) |
| **OpenRouter** | Dépend du tier (gratuit: 20 req/min) |
| **Viva Wallet** | 1000 requêtes/min |
| **Gemini** | 60 requêtes/min (free tier) |

---

<p align="center">
  API Documentation | Shop-ia v0.0.0 | Mars 2026
</p>
