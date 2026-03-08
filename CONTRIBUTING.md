# Guide de Contribution — Shop-ia

> Merci de votre intérêt pour contribuer à Shop-ia ! Ce document détaille le workflow, les standards et les bonnes pratiques.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Workflow Git](#workflow-git)
- [Standards de code](#standards-de-code)
- [Tests](#tests)
- [Processus de review](#processus-de-review)
- [Code de conduite](#code-de-conduite)

---

## Prérequis

Avant de contribuer, assurez-vous d'avoir :

- [ ] Lu le [README.md](./README.md) et [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Configuré votre environnement local (voir README → Installation)
- [ ] Initialisé la base de données Supabase locale ou de test
- [ ] Vérifié que votre contribution répond à un besoin documenté (issue ou roadmap)

### Environnement de développement recommandé

```bash
# Node.js version
node --version  # >= 18.0

# IDE recommandé
VS Code avec extensions :
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
```

---

## Workflow Git

### Branches

Nous utilisons un workflow Git Flow simplifié :

| Branche | Usage |
|---------|-------|
| `main` | Production stable, protégée |
| `develop` | Intégration des features (optionnel) |
| `feature/xxx` | Nouvelles fonctionnalités |
| `fix/xxx` | Corrections de bugs |
| `hotfix/xxx` | Corrections urgentes en prod |
| `docs/xxx` | Documentation |

### Créer une branche

```bash
# Depuis main à jour
git checkout main
git pull origin main

# Créer et switch sur la nouvelle branche
git checkout -b feature/nom-de-la-feature

# Convention de nommage :
# - feature/ajouter-filtres-catalogue
# - fix/panier-vide-erreur
# - docs/api-endpoints
```

### Conventional Commits

Tous les commits doivent suivre la spécification [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types de commit

| Type | Description | Exemple |
|------|-------------|---------|
| `feat:` | Nouvelle fonctionnalité | `feat: ajoute le quiz de préférences IA` |
| `fix:` | Correction de bug | `fix: corrige le calcul du total panier` |
| `docs:` | Documentation | `docs: ajoute guide embeddings` |
| `style:` | Formatage (pas de changement de code) | `style: reformate composants admin` |
| `refactor:` | Refactoring | `refactor: extrait hook useCartCalculations` |
| `perf:` | Performance | `perf: optimise rendu liste produits` |
| `test:` | Tests | `test: ajoute tests panierStore` |
| `chore:` | Maintenance | `chore: met à jour dépendances` |
| `ci:` | CI/CD | `ci: ajoute action GitHub` |
| `rls:` | Row Level Security | `rls: ajoute policy manquante sur orders` |

#### Exemples de commits

```bash
# Simple
git commit -m "feat: ajoute la wishlist persistante"

# Avec scope
git commit -m "feat(admin): ajoute filtre par date sur commandes"

# Avec body
git commit -m "fix: corrige sync bundle stock" -m "Le trigger ne se déclenchait pas sur update de stock. Ajout d'un AFTER UPDATE trigger." -m "Closes #123"
```

### Pull Requests

#### Avant de créer une PR

```bash
# 1. Mettre à jour sa branche
git checkout main
git pull origin main
git checkout feature/ma-feature
git rebase main

# 2. Vérifier le linting
npm run lint

# 3. Vérifier les types TypeScript
npx tsc --noEmit
```

#### Template de PR

```markdown
## 🎯 Objectif
Description claire de ce que fait cette PR.

## 📝 Changements
- [x] Ajout de X
- [x] Modification de Y
- [ ] Tests à venir

## 🔗 Issues liées
Closes #123
Relates to #456

## 📸 Screenshots (si UI)
[Ajouter screenshots avant/après]

## 🧪 Tests effectués
- [ ] Test manuel du parcours complet
- [ ] Test sur mobile
- [ ] Test avec données vides
```

#### Process de merge

1. **Review requise** : Au moins 1 approbation obligatoire
2. **CI passing** : Tous les checks doivent être verts
3. **RLS Check** : Si modification DB, vérifier les policies
4. **Squash & Merge** : Maintenir un historique clean

---

## Standards de code

### TypeScript

#### Typage strict

```typescript
// ✅ Bien
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

interface Product {
  id: string;
  name: string;
  price: number;
  category?: Category; // Optionnel explicite
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ À éviter
function calculateTotal(items: any): any { ... }
```

#### Types globaux

Placer les types partagés dans `src/lib/types.ts` :

```typescript
// src/lib/types.ts
export interface Database {
  public: {
    Tables: { ... }
    Functions: { ... }
  }
}
```

### React & Composants

#### Structure d'un composant

```typescript
// src/components/MonComposant.tsx
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';

// Types privés
interface MonComposantProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

// Sous-composants privés (même fichier si petit)
const ProductBadge = ({ inStock }: { inStock: boolean }) => (
  <span className={inStock ? 'text-green-500' : 'text-red-500'}>
    {inStock ? 'En stock' : 'Rupture'}
  </span>
);

// Composant principal
export default function MonComposant({ product, onAddToCart }: MonComposantProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setIsLoading(false);
    }
  }, [product.id, onAddToCart]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold">{product.name}</h3>
      <ProductBadge inStock={product.stock_quantity > 0} />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        {isLoading ? 'Chargement...' : 'Ajouter'}
      </button>
    </div>
  );
}
```

#### Règles React

- **Hooks** : Toujours en haut du composant, jamais dans des conditions
- **useEffect** : Dépendances explicites, cleanup si nécessaire
- **Callbacks** : `useCallback` pour les fonctions passées aux enfants
- **Memo** : `useMemo` pour les calculs coûteux
- **Événements** : Préfixer par `handle` (ex: `handleClick`, `handleSubmit`)

### Styling (TailwindCSS)

#### Conventions de classe

```tsx
// ✅ Ordre recommandé : Layout > Box Model > Visual > Typography > Misc
<div className="
  flex items-center gap-4           /* Layout */
  p-4 bg-white rounded-lg shadow-md   /* Box Model + Visual */
  text-sm font-medium text-gray-900   /* Typography */
  hover:bg-gray-50 transition-colors  /* Misc */
"/>
```

#### Couleurs du projet

```css
/* Variables disponibles dans index.css */
--green-primary: #22c55e;
--green-neon: #4ade80;
--green-dark: #166534;
/* Utiliser ces variables pour la cohérence */
```

#### Composants UI réutilisables

Pour les éléments récurrents, créer des variants Tailwind :

```typescript
// src/components/ui/Button.tsx
const variants = {
  primary: 'bg-green-600 text-white hover:bg-green-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};
```

### Supabase & RLS

#### Patterns de requête

```typescript
// ✅ Toujours utiliser le client Supabase typé
import { supabase } from '../lib/supabase';

// ✅ Select avec jointures explicites
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*, product(*)), address(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// ✅ RPC pour fonctions complexes
const { data } = await supabase.rpc('match_products', {
  query_embedding: embedding,
  match_threshold: 0.7,
  match_count: 10,
});
```

#### RLS Policies

Toute nouvelle table doit avoir des policies RLS :

```sql
-- Template RLS
ALTER TABLE ma_table ENABLE ROW LEVEL SECURITY;

-- Lecture par propriétaire
CREATE POLICY "ma_table_owner_read" ON ma_table
FOR SELECT USING (user_id = auth.uid());

-- Modification par propriétaire
CREATE POLICY "ma_table_owner_write" ON ma_table
FOR ALL USING (user_id = auth.uid());

-- Accès admin (si applicable)
CREATE POLICY "ma_table_admin_all" ON ma_table
FOR ALL USING (public.is_admin());
```

---

## Tests

### Tests manuels requis

Avant toute PR, vérifier :

| Scénario | Check |
|----------|-------|
| **Parcours achat** | Ajout panier → Checkout → Paiement test → Confirmation |
| **Responsive** | Desktop, tablet, mobile (320px-1920px) |
| **Auth** | Connexion, déconnexion, session persistante |
| **RLS** | Accès non autorisé bloqué (tester avec autre user) |
| **POS** | Caisse, customer display, rapports |
| **Assistant IA** | Chat, quiz, recommandations |

### Tests automatisés (à implémenter)

```bash
# Tests unitaires (à venir)
npm run test:unit

# Tests E2E avec Playwright (à venir)
npm run test:e2e

# Linting
npm run lint
```

---

## Processus de review

### Checklist du reviewer

- [ ] Code comprend sans contexte externe
- [ ] Pas de `any` TypeScript non justifié
- [ ] Pas de console.log en production
- [ ] Pas de fuites mémoire (useEffect cleanup)
- [ ] RLS policies si nouvelle table
- [ ] Performance OK (pas de re-render inutile)
- [ ] Accessible (ARIA labels, contrastes)
- [ ] Mobile-first responsive

### Commentaires de review

Soit constructif et spécifique :

```
❌ "Ce code est mauvais"
✅ "Ici, on pourrait utiliser useMemo pour éviter le recalc à chaque render"

❌ "Pas compris"
✅ "Peux-tu ajouter un commentaire expliquant pourquoi on utilise <=> plutôt que < ?"
```

---

## Code de conduite

### Notre engagement

Nous nous engageons à faire de la participation à notre projet une expérience sans harcèlement pour tout le monde, quel que soit :
- L'âge, le corps, le handicap, l'origine ethnique
- Le niveau d'expérience, l'éducation, le statut socio-économique
- La nationalité, l'apparence personnelle, la race, la religion
- L'identité et l'orientation sexuelles

### Standards de comportement

Exemples de comportements qui contribuent à créer un environnement positif :
- Utiliser un langage accueillant et inclusif
- Être respectueux des points de vue et expériences différents
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est meilleur pour la communauté
- Montrer de l'empathie envers les autres membres

Exemples de comportements inacceptables :
- Troll, commentaires insultants/dérogatoires, attaques personnelles
- Harcèlement public ou privé
- Publication d'informations privées sans permission
- Autre conduite pouvant raisonnablement être considérée inappropriée

### Application

Les maintainer du projet ont le droit et la responsabilité de supprimer, modifier ou rejeter contributions, issues et PRs non alignées avec ce code de conduite.

---

## Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Best Practices](https://react.dev/learn)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## Questions ?

- 💬 Ouvrir une [Discussion](https://github.com/moonback/Shop-ia/discussions)
- 🐛 Signaler un bug via [Issues](https://github.com/moonback/Shop-ia/issues)
- 📧 Contact : [À compléter]

---

<p align="center">
  Merci de contribuer à Shop-ia ! 🌿
</p>
