import { Product } from '../types';

export function buildInternalLinks(product?: Product) {
  const guideLinks = [
    { label: 'Guide des Huiles d\'Exception', to: '/guides/guide-huiles' },
    { label: 'Accords Mets & Vins', to: '/guides/accords-saveurs' },
    { label: 'Secrets de Producteurs', to: '/guides/producteurs-locaux' },
  ];

  const productLinks = product
    ? [
      { label: `Voir la catégorie ${product.category?.name ?? 'Gourmet'}`, to: '/catalogue' },
      { label: 'Produits liés', to: '/produits' },
    ]
    : [];

  return [...productLinks, ...guideLinks];
}
