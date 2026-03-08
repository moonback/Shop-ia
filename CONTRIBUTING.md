# Guide de Contribution

Merci de vouloir améliorer Shop-ia ! 

## 🛠 Prérequis de Contribution
- Lire la documentation technique (Architecture).
- Configurer un environnement local de DB via les scripts.

## 📝 Standards de Code
- **Typage Strict** : Utiliser TypeScript systématiquement. Les `any` sont prohibés en production.
- **Component Design** : 
  - 1 fichier = 1 Composant majeur + ses sous-composants privés.
  - Toujours extraire les fonctions complexes dans `src/lib/`.
- **CSS** : Exclusivement des classes `Tailwind CSS`. Pas de CSS externe sauf pour les resets globaux dans `index.css`.

## 🌿 Workflow Git
1. Créez une branche depuis `main` suivant la convention de nommage : `feature/nom-tâche` ou `fix/nom-bug`.
2. Faites de petits commits. Le format de messages **Conventional Commits** est obligatoire :
   - `feat: ajoute la wishlist`
   - `fix: crash du bouton d'achat`
   - `style: révision header`
3. Ouvrez une Pull Request et associez l'issue GitHub pertinente.

## 🔍 Processus de Review
- Le code sera linté automatiquement (exécuter `npm run lint` en local).
- Un relecteur backend s'assurera qu'aucune faille RLS (Row Level Security) n'a été introduite si le PR concerne un fetch de base de données.

## 🤝 Code de conduite
- Soyez respectueux et constructif dans vos commentaires de PR.
- Documentez les fonctions complexes que vous ajoutez.
