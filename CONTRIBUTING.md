# CONTRIBUTING

Merci pour votre contribution à Shop-ia.

## Prérequis
- Node.js >= 20
- npm >= 10
- Projet Supabase disponible pour tester les flux DB/auth
- Fichier `.env` configuré depuis `.env.example`

## Workflow Git

### Branches
- Créez une branche depuis `main` :
```bash
git checkout -b feat/ma-fonctionnalite
```

### Commits
- Utilisez **Conventional Commits**.
- Exemples :
  - `feat: add admin promo validation`
  - `fix: prevent checkout when address missing`
  - `docs: update API docs for rpc endpoints`

### Pull Request
- Ouvrez une PR claire, petite et testable.
- Incluez : contexte, changements, impacts DB/env, captures si UI modifiée.
- Vérifiez qu'aucune clé secrète n'est committée.

## Standards de code
- TypeScript strict, éviter `any`.
- Composants React fonctionnels + hooks.
- Zustand pour l'état global, pas Redux.
- Respecter l'organisation existante :
  - `src/pages` pour vues routées
  - `src/components` pour composants
  - `src/store` pour stores
  - `src/lib` pour clients/utilitaires/types
- Ne pas contourner la sécurité RLS côté DB.

## Lancer les tests et checks

```bash
npm run lint
npm run build
```

> ⚠️ À compléter : il n'existe pas encore de suite automatisée `npm test` dans `package.json`.

## Processus de review
- 1 relecteur minimum.
- Revue centrée sur : sécurité, impacts RLS, robustesse UX, dette technique.
- Toute modification SQL doit inclure une stratégie de migration/rollback documentée.

## Code de conduite
- Soyez respectueux, factuel et constructif.
- Critiquez le code, jamais les personnes.
- Favorisez des PR pédagogiques et documentées.
