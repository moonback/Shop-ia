# Référence API / RPC (Remote Procedure Calls)

L'application communique directement avec Supabase PostgREST. Ce document détaille les méthodes backend principales (`RPC`) spécifiques au projet inscrites dans la BDD.

## 📂 Domaine : Recherche Sémantique

### `POST /rpc/match_products`
Recherche de produits similaires à l'aide de vecteurs d'encodage textuel.

- **Authentification** : Non requise (public)
- **Paramètres Body (JSON)** :

| Paramètre | Type | Requis | Description |
| --- | --- | --- | --- |
| `query_embedding` | `Array<Float>` | OUI | Vecteur d'embedding du texte recherché (ex: 768 dimensions) |
| `match_threshold` | `Float` | NON | Seuil de similarité minimale (ex: 0.1) |
| `match_count` | `Integer` | NON | Nombre de résultats maximum (défaut: 10) |

- **Exemple d'appel JS (Supabase Client)** :
```javascript
const { data, error } = await supabase.rpc('match_products', {
  query_embedding: [0.012, -0.043, 0.089, ...],
  match_threshold: 0.1,
  match_count: 5
});
```

- **Exemple de réponse** :
```json
// HTTP 200 OK
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Produit Premium",
    "price": 29.99,
    "similarity_score": 0.85
  }
]
```

---

> ⚠️ À compléter : Ajouter ici d'autres RPC si présentes dans l'infrastructure de la base de données finalisée (ex: attribution des points de fidélité via triggers au lieu de l'API standard `UPDATE /products`).
