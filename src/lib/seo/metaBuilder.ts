import { Product } from '../types';

export const SEO_SITE = {
  name: 'Shop-ia',
  url: 'https://shop-ia.fr',
  locale: 'fr_FR',
  language: 'fr',
  defaultImage: 'https://shop-ia.fr/logo.png',
  twitterHandle: '@shopia',
  author: 'Shop-ia',
  geo: {
    region: 'FR-IDF',
    placename: 'Paris, France',
    position: '48.8566;2.3522',
    icbm: '48.8566, 2.3522',
  },
};

export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[] | string;
  robots?: string;
  author?: string;
  language?: string;
  topic?: string;
  semanticKeywords?: string[] | string;
  aiSummary?: string;
  aiEntity?: string;
  og: {
    title: string;
    description: string;
    image: string;
    type: 'website' | 'article' | 'product';
    url: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image: string;
  };
}

export function withSiteUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${SEO_SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildSEO(data: Partial<SEOData> & Pick<SEOData, 'title' | 'description'>): SEOData {
  const canonical = withSiteUrl(data.canonical ?? '/');
  const ogImage = data.og?.image ?? SEO_SITE.defaultImage;

  return {
    title: data.title,
    description: data.description,
    canonical,
    keywords: Array.isArray(data.keywords) ? data.keywords : data.keywords ? [data.keywords] : undefined,
    robots: data.robots ?? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    author: data.author ?? SEO_SITE.author,
    language: data.language ?? SEO_SITE.language,
    topic: data.topic,
    semanticKeywords: Array.isArray(data.semanticKeywords) ? data.semanticKeywords : data.semanticKeywords ? [data.semanticKeywords] : undefined,
    aiSummary: data.aiSummary ?? data.description,
    aiEntity: data.aiEntity ?? 'Épicerie, Alimentation, Shop-ia',
    og: {
      title: data.og?.title ?? data.title,
      description: data.og?.description ?? data.description,
      image: withSiteUrl(ogImage),
      type: data.og?.type ?? 'website',
      url: canonical,
    },
    twitter: {
      card: data.twitter?.card ?? 'summary_large_image',
      title: data.twitter?.title ?? data.title,
      description: data.twitter?.description ?? data.description,
      image: withSiteUrl(data.twitter?.image ?? ogImage),
    },
  };
}

export function buildProductSEO(product: Product): SEOData {
  const baseTitle = `${product.name} | Shop-ia`;
  const description = product.description ?? `Découvrez ${product.name}, un produit de qualité disponible sur Shop-ia.`;

  return buildSEO({
    title: baseTitle,
    description,
    canonical: `/catalogue/${product.slug}`,
    keywords: [
      'épicerie',
      product.name,
      product.category?.name ?? 'alimentation',
      'course en ligne',
      'shop-ia',
    ],
    topic: `Produit: ${product.name}`,
    semanticKeywords: [
      'alimentation saine',
      'produits frais',
      'épicerie fine',
      'qualité premium',
    ],
    aiEntity: `Product:${product.name};Brand:Shop-ia;Category:${product.category?.name ?? 'Alimentation'}`,
    og: {
      title: baseTitle,
      description,
      image: product.image_url ?? SEO_SITE.defaultImage,
      type: 'product',
      url: withSiteUrl(`/catalogue/${product.slug}`),
    },
  });
}
