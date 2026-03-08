# Architecture Système — Shop-ia

## 🗺 Vue d'ensemble (Data Flow)

```text
[ Client (Navigateur UI) ]
   │
   ├──▶ (Zustand Stores) ──▶ État Local (Cart, Auth, Settings)
   │
   ├──▶ (API Supabase JS) ──▶ Authentification & Database PostgreSQL
   │
   ├──▶ (OpenRouter/GenAI) ──▶ Assistant LLM & Embeddings Vectoriels
   │
   └──▶ (Viva Wallet) ──▶ Passerelle de paiement (Checkout)
```

## 🖥 Frontend (React 19 + Vite)
- **Routage** : Géré via `react-router-dom`. Les routes protégées (Admin) sont encapsulées dans des Higher-Order Components.
- **Gestion de l'État** : `Zustand` est utilisé pour la gestion découplée de l'état (pas de prop-drilling).
- **Styling** : Tailwind CSS v4, utilisation massive du système '@apply' pour les glassmorphisms tactiles et classes utilitaires.
- **Composants clés** : L'application est divisée entre `Layout` global, `Pages` modulaires et widgets persistants (`ShopiaAssistant`).

## ⚙️ Backend (Supabase BaaS)
- **Couche Applicative** : Aucune application Node/Express classique. Les requêtes partent directement du navigateur vers l'API PostgREST de Supabase.
- **Sécurité** : Les politiques (RLS - Row Level Security) sont configurées au niveau PostgreSQL pour restreindre l'accès en lecture/écriture en fonction de l'UUID de l'utilisateur (`auth.uid()`).
- **Fonctions Edge (RPC)** : Utilisées côté base de données pour les algorithmes lourds, notamment la recherche sémantique avec la fonction `match_products`.

## 🤖 Services Externes & IA
- **OpenRouter / OpenAI** : Convertit les requêtes (text query) de l'utilisateur en un tenseur vectoriel (`768 dimensions`) envoyé à Supabase (pgvector).
- **Google Gemini** : Moteur derrière l'assistant vocal et textuel. Communication souvent en temps réel/WebSocket.
- **Viva Wallet** : Gestion de l'iFrame de paiement.

## 💡 Décisions d'Architecture
1. **BaaS Supabase** : Choisie pour accélérer la mise en marché et bénéficier de la DB "Realtime" + "pgvector" nativement.
2. **Recherche Vectorielle** : Solution moderne d'e-commerce évitant les limites des simples recherches par mots-clés SQL `ILIKE`.
3. **Zustand au lieu de Redux** : Moins de boilerplate, stores plus légers avec un footprint en mémoire minimal pour le navigateur physique (POS).
