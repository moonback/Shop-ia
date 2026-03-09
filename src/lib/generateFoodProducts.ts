import { supabase } from './supabase';
import { slugify } from './utils';
import { v4 as uuidv4 } from 'uuid';

// ─── Seed categories ──────────────────────────────────────────────────────────
// These are upserted automatically before product insertion.
// If a category with the same slug already exists, it is left unchanged.

export const FOOD_CATEGORIES = [
  { slug: 'boulangerie-cereales',    name: 'Boulangerie & Céréales',     sort_order: 10 },
  { slug: 'fromages-cremerie',       name: 'Fromages & Crèmerie',         sort_order: 20 },
  { slug: 'miels-confitures',        name: 'Miels & Confitures',          sort_order: 30 },
  { slug: 'huiles-condiments',       name: 'Huiles & Condiments',         sort_order: 40 },
  { slug: 'charcuterie-poissons',    name: 'Charcuterie & Poissons',      sort_order: 50 },
  { slug: 'epicerie-fine',           name: 'Épicerie Fine',               sort_order: 60 },
  { slug: 'boissons-jus',            name: 'Boissons & Jus',              sort_order: 70 },
] as const;

type CategorySlug = typeof FOOD_CATEGORIES[number]['slug'];

// ─── Template type ────────────────────────────────────────────────────────────

interface FoodTemplate {
  name: string;
  description: string;
  product_type: 'food' | 'beverage';
  brand: string;
  sku: string;
  nutriscore: 'A' | 'B' | 'C' | 'D' | 'E';
  weight_info: string;
  weight_grams: number;
  unit_label: string;
  price: number;
  original_value: number;
  stock_quantity: number;
  is_featured: boolean;
  is_available: boolean;
  is_subscribable: boolean;
  image_url: string;
  benefits: string[];
  aromas: string[];
  /** Must match a slug from FOOD_CATEGORIES above */
  categorySlug: CategorySlug;
}

// ─── Catalogue ────────────────────────────────────────────────────────────────

export const FOOD_PRODUCTS: FoodTemplate[] = [

  // ── Boulangerie & Céréales ──────────────────────────────────────────────────
  {
    name: 'Pain au Levain Tradition',
    description: 'Pain au levain naturel façon tradition française, cuit au four à bois. Mie alvéolée, croûte dorée et croustillante. Longue fermentation 18h pour une meilleure digestibilité. 500g.',
    product_type: 'food',
    brand: 'Boulangerie du Moulin',
    sku: 'BOU-001',
    nutriscore: 'A',
    weight_info: '500g',
    weight_grams: 500,
    unit_label: 'unit',
    price: 3.20,
    original_value: 4.20,
    stock_quantity: 25,
    is_featured: true,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    benefits: ['Sans additifs', 'Fermentation longue', 'Digestion facilitée'],
    aromas: ['Blé', 'Pain frais', 'Légèrement acidulé'],
    categorySlug: 'boulangerie-cereales',
  },
  {
    name: 'Granola Artisan Miel & Amandes',
    description: "Granola croustillant façonné à la main : flocons d'avoine, miel de fleurs, amandes et noisettes grillées. Sans huile de palme, sans sirop de glucose. 400g.",
    product_type: 'food',
    brand: 'Nature & Grains',
    sku: 'GRA-001',
    nutriscore: 'B',
    weight_info: '400g',
    weight_grams: 400,
    unit_label: 'unit',
    price: 6.40,
    original_value: 8.50,
    stock_quantity: 30,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=600',
    benefits: ['Fibres', 'Protéines végétales', 'Énergie durable'],
    aromas: ['Miel', 'Amande grillée', 'Vanille douce'],
    categorySlug: 'boulangerie-cereales',
  },

  // ── Fromages & Crèmerie ─────────────────────────────────────────────────────
  {
    name: 'Comté AOP Affiné 24 Mois',
    description: 'Comté AOP affiné 24 mois en cave de Pontarlier. Pâte dure légèrement granuleuse, cristaux de tyrosine. Notes complexes de noisette, fruits secs et champignon des bois. 200g préemballé.',
    product_type: 'food',
    brand: 'Fromageries de Pontarlier',
    sku: 'FRO-001',
    nutriscore: 'B',
    weight_info: '200g',
    weight_grams: 200,
    unit_label: 'unit',
    price: 6.80,
    original_value: 8.90,
    stock_quantity: 16,
    is_featured: true,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1585237557448-4db48a8b21b1?auto=format&fit=crop&q=80&w=600',
    benefits: ['Calcium élevé', 'Protéines', 'AOP — 24 mois'],
    aromas: ['Noisette', 'Fruit sec', 'Champignon'],
    categorySlug: 'fromages-cremerie',
  },
  {
    name: 'Chèvre Frais Lait Cru du Poitou',
    description: 'Fromage de chèvre frais au lait cru, production fermière du Poitou-Charentes. Texture crémeuse fondante, saveur douce avec une légère acidité. 150g.',
    product_type: 'food',
    brand: 'Ferme Sainte-Claire',
    sku: 'FRO-002',
    nutriscore: 'B',
    weight_info: '150g',
    weight_grams: 150,
    unit_label: 'unit',
    price: 4.50,
    original_value: 5.90,
    stock_quantity: 18,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1585036341725-3d33cab8778c?auto=format&fit=crop&q=80&w=600',
    benefits: ['Lait cru', 'Probiotiques naturels', 'Artisanal'],
    aromas: ['Frais', 'Lacté délicat', 'Légèrement acidulé'],
    categorySlug: 'fromages-cremerie',
  },
  {
    name: 'Yaourt Brassé Fermier Entier',
    description: 'Yaourt brassé au lait entier de vaches Montbéliardes de montagne. Fermentation lactique 12h, texture onctueuse et veloutée. 4×125g.',
    product_type: 'food',
    brand: 'Ferme des Alpages',
    sku: 'LAI-001',
    nutriscore: 'A',
    weight_info: '4×125g',
    weight_grams: 500,
    unit_label: 'unit',
    price: 2.90,
    original_value: 3.90,
    stock_quantity: 28,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
    benefits: ['Probiotiques', 'Calcium biodisponible', 'Sans colorants'],
    aromas: ['Lait frais', 'Crémeux', 'Naturel'],
    categorySlug: 'fromages-cremerie',
  },

  // ── Miels & Confitures ──────────────────────────────────────────────────────
  {
    name: 'Miel de Lavande AOP Provence',
    description: 'Miel monofloral de lavande des Alpes de Haute-Provence, AOP certifié. Récolte manuelle juillet-août. Cristallisation naturelle fine, saveur florale intense. 250g.',
    product_type: 'food',
    brand: 'Ruchers de Provence',
    sku: 'MIE-001',
    nutriscore: 'A',
    weight_info: '250g',
    weight_grams: 250,
    unit_label: 'unit',
    price: 8.90,
    original_value: 11.90,
    stock_quantity: 30,
    is_featured: true,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
    benefits: ['Antibactérien naturel', 'Digestion', 'AOP Provence'],
    aromas: ['Lavande intense', 'Floral', 'Délicat sucré'],
    categorySlug: 'miels-confitures',
  },
  {
    name: 'Confiture Extra Fraises Gariguette',
    description: 'Confiture artisanale de fraises Gariguette du Périgord. 75% de fruits, cuisson courte pour préserver la fraîcheur. Sans pectine ajoutée, sans conservateurs. 370g.',
    product_type: 'food',
    brand: 'Conserverie du Terroir',
    sku: 'CON-001',
    nutriscore: 'B',
    weight_info: '370g',
    weight_grams: 370,
    unit_label: 'unit',
    price: 5.40,
    original_value: 7.20,
    stock_quantity: 35,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1528236238844-9117b77b49be?auto=format&fit=crop&q=80&w=600',
    benefits: ['75% fruits', 'Sans conservateurs', 'Cuisson courte'],
    aromas: ['Fraise fraîche', 'Fruité vif', 'Légèrement acidulé'],
    categorySlug: 'miels-confitures',
  },

  // ── Huiles & Condiments ─────────────────────────────────────────────────────
  {
    name: "Huile d'Olive Extra Vierge AOP Nyons",
    description: "Huile d'olive AOP Nyons, première pression à froid sur olives Tanche. Récolte précoce pour maximiser les polyphénols. Saveur fruitée verte, herbacée et légèrement poivrée en fin de bouche. 500ml.",
    product_type: 'food',
    brand: 'Moulin de la Balme',
    sku: 'HUI-001',
    nutriscore: 'A',
    weight_info: '500ml',
    weight_grams: 500,
    unit_label: 'unit',
    price: 12.90,
    original_value: 16.90,
    stock_quantity: 22,
    is_featured: true,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
    benefits: ['Polyphénols élevés', 'Oméga-9', 'AOP Nyons'],
    aromas: ['Fruité vert', 'Herbes fraîches', 'Légèrement poivré'],
    categorySlug: 'huiles-condiments',
  },
  {
    name: 'Vinaigre de Cidre Bio avec la Mère',
    description: "Vinaigre de cidre biologique non filtré, non pasteurisé. La « mère » visible est signe de qualité et de richesse en enzymes. Acidité naturelle de 5°. 500ml.",
    product_type: 'food',
    brand: 'Cidrerie du Val',
    sku: 'VIN-001',
    nutriscore: 'A',
    weight_info: '500ml',
    weight_grams: 500,
    unit_label: 'unit',
    price: 4.20,
    original_value: 5.60,
    stock_quantity: 28,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&q=80&w=600',
    benefits: ['Prébiotique', 'Non filtré', 'Bio certifié AB'],
    aromas: ['Pomme acidulée', 'Fermenté', 'Légèrement fruité'],
    categorySlug: 'huiles-condiments',
  },
  {
    name: 'Purée de Tomates San Marzano DOP',
    description: "Passata de tomates San Marzano DOP, cultivées en Campanie sur sol volcanique du Vésuve. Cuisson douce, sans additifs. Idéale pour pizzas et sauces. 500g.",
    product_type: 'food',
    brand: "Sapori d'Italia",
    sku: 'TOM-001',
    nutriscore: 'A',
    weight_info: '500g',
    weight_grams: 500,
    unit_label: 'unit',
    price: 3.40,
    original_value: 4.50,
    stock_quantity: 40,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1592924357228-1a92b2c99e6e?auto=format&fit=crop&q=80&w=600',
    benefits: ['Lycopène', 'Vitamines C', 'DOP Italie'],
    aromas: ['Tomate mûre', 'Légèrement sucré', 'Umami'],
    categorySlug: 'huiles-condiments',
  },

  // ── Charcuterie & Poissons ──────────────────────────────────────────────────
  {
    name: 'Jambon de Bayonne AOP 12 Mois',
    description: "Jambon de Bayonne AOP, salé au sel de Salies-de-Béarn, séché et affiné 12 mois minimum en séchoir naturel. Tranché finement à la main. Chair rosée, fondante. 150g.",
    product_type: 'food',
    brand: 'Charcuterie Oteiza',
    sku: 'CHA-001',
    nutriscore: 'B',
    weight_info: '150g',
    weight_grams: 150,
    unit_label: 'unit',
    price: 5.90,
    original_value: 7.90,
    stock_quantity: 22,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=600',
    benefits: ['Protéines complètes', 'AOP Bayonne', 'Affinage 12 mois'],
    aromas: ['Salé délicat', 'Légèrement boisé', 'Sèche parfumé'],
    categorySlug: 'charcuterie-poissons',
  },
  {
    name: 'Saumon Fumé Atlantique Label Rouge',
    description: "Saumon Atlantique élevé en mer d'Écosse, fumé au bois de hêtre breton selon méthode traditionnelle. Tranché main. Label Rouge France. Chair ferme, fondante. 200g.",
    product_type: 'food',
    brand: 'Fumaisons de Bretagne',
    sku: 'POI-001',
    nutriscore: 'B',
    weight_info: '200g',
    weight_grams: 200,
    unit_label: 'unit',
    price: 8.90,
    original_value: 11.90,
    stock_quantity: 15,
    is_featured: true,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f1a4273d087?auto=format&fit=crop&q=80&w=600',
    benefits: ['Oméga-3 EPA+DHA', 'Protéines complètes', 'Label Rouge'],
    aromas: ['Fumé délicat hêtre', 'Marin iodé', 'Beurré'],
    categorySlug: 'charcuterie-poissons',
  },

  // ── Épicerie Fine ───────────────────────────────────────────────────────────
  {
    name: 'Linguine de Gragnano IGP',
    description: "Linguine IGP de Gragnano, semoule de blé dur 100% italienne, coulage bronze artisanal. Séchage lent à basse température 48h. Tient la cuisson al dente. 500g.",
    product_type: 'food',
    brand: 'Pastificio Campano',
    sku: 'PAT-001',
    nutriscore: 'B',
    weight_info: '500g',
    weight_grams: 500,
    unit_label: 'unit',
    price: 3.80,
    original_value: 5.20,
    stock_quantity: 45,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1586238397499-142fd8426356?auto=format&fit=crop&q=80&w=600',
    benefits: ['IGP Gragnano', 'Coulage bronze', 'Séchage lent 48h'],
    aromas: ['Blé dur', 'Neutre', 'Légèrement beurré à la cuisson'],
    categorySlug: 'epicerie-fine',
  },
  {
    name: 'Chocolat Noir 72% Single Origin Pérou',
    description: "Tablette de chocolat noir bean-to-bar, fèves Criollo du Pérou, 72% cacao. Fabrication artisanale en France. Bio et équitable Max Havelaar. Notes de fruits rouges et tabac doux. 100g.",
    product_type: 'food',
    brand: 'Alter Éco',
    sku: 'CHO-001',
    nutriscore: 'C',
    weight_info: '100g',
    weight_grams: 100,
    unit_label: 'unit',
    price: 3.90,
    original_value: 5.20,
    stock_quantity: 50,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=600',
    benefits: ['Antioxydants ORAC', 'Magnésium', 'Commerce équitable'],
    aromas: ['Cacao intense', 'Fruits rouges', 'Tabac doux'],
    categorySlug: 'epicerie-fine',
  },
  {
    name: 'Olives Kalamata IGP Marinées',
    description: "Olives noires Kalamata IGP, Messénie (Grèce), marinées à l'huile d'olive vierge, thym et origan sauvage de Crète. Chair ferme et goûteuse. 200g.",
    product_type: 'food',
    brand: 'Agros Grec',
    sku: 'OLI-001',
    nutriscore: 'A',
    weight_info: '200g',
    weight_grams: 200,
    unit_label: 'unit',
    price: 4.20,
    original_value: 5.60,
    stock_quantity: 40,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    benefits: ['Polyphénols', 'Bons lipides', 'IGP Grèce'],
    aromas: ['Olive mûre', 'Herbes méditerranéennes', 'Légèrement poivré'],
    categorySlug: 'epicerie-fine',
  },
  {
    name: 'Noix du Périgord AOP Corne',
    description: "Noix fraîches du Périgord AOP, variété Corne, récoltées manuellement à maturité optimale. Séchage naturel 3 semaines. Croquantes, saveur beurré. 250g.",
    product_type: 'food',
    brand: 'Fruits du Périgord',
    sku: 'NOI-001',
    nutriscore: 'A',
    weight_info: '250g',
    weight_grams: 250,
    unit_label: 'unit',
    price: 6.20,
    original_value: 8.20,
    stock_quantity: 20,
    is_featured: false,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&q=80&w=600',
    benefits: ['Oméga-3 ALA', 'Antioxydants', 'AOP Périgord'],
    aromas: ['Noisette fraîche', 'Beurré', 'Légèrement amer'],
    categorySlug: 'epicerie-fine',
  },
  {
    name: 'Farine de Blé Complet T150 Pierre',
    description: "Farine de blé complet type T150 moulue sur meule de pierre de granit. Agriculture raisonnée, terroir alsacien. Conserve le son, le germe et les enzymes. 1kg.",
    product_type: 'food',
    brand: "Moulins de l'Alsace",
    sku: 'FAR-001',
    nutriscore: 'A',
    weight_info: '1kg',
    weight_grams: 1000,
    unit_label: 'unit',
    price: 2.80,
    original_value: 3.70,
    stock_quantity: 45,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=600',
    benefits: ['Fibres intactes', 'Vitamines B', 'Germe conservé'],
    aromas: ['Blé complet', 'Céréales', 'Naturel'],
    categorySlug: 'epicerie-fine',
  },
  {
    name: "Sirop d'Érable Ambré Grade A Québec",
    description: "Sirop d'érable du Québec, grade A ambré goût riche, récolte printemps. 100% pur érable, sans additifs. Concentré à 66° Brix. Idéal pancakes, pâtisseries et vinaigrettes. 250ml.",
    product_type: 'food',
    brand: 'Érablière Beausoleil',
    sku: 'SIR-001',
    nutriscore: 'B',
    weight_info: '250ml',
    weight_grams: 300,
    unit_label: 'unit',
    price: 8.40,
    original_value: 11.20,
    stock_quantity: 18,
    is_featured: true,
    is_available: true,
    is_subscribable: false,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=600',
    benefits: ['Minéraux naturels', 'Index glycémique modéré', 'Grade A Québec'],
    aromas: ['Érable caramélisé', 'Vanillé', 'Boisé'],
    categorySlug: 'epicerie-fine',
  },

  // ── Boissons & Jus ──────────────────────────────────────────────────────────
  {
    name: 'Jus de Pomme Cloudy Bio Pressé Froid',
    description: "Jus de pomme trouble (cloudy) pressé à froid, non filtré, non pasteurisé. Pommes Gala et Braeburn certifiées AB. Conserve vitamines et enzymes. Sans sucre ajouté. 1L.",
    product_type: 'beverage',
    brand: 'Cidrerie du Val',
    sku: 'BOI-001',
    nutriscore: 'A',
    weight_info: '1L',
    weight_grams: 1050,
    unit_label: 'unit',
    price: 4.20,
    original_value: 5.50,
    stock_quantity: 40,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1621263760928-aea9b5414381?auto=format&fit=crop&q=80&w=600',
    benefits: ['Vitamines C', 'Polyphénols', 'Pressé à froid'],
    aromas: ['Pomme fraîche', 'Légèrement acidulé', 'Fruité naturel'],
    categorySlug: 'boissons-jus',
  },
  {
    name: 'Thé Vert Sencha Uji Première Récolte',
    description: "Thé vert Sencha Ichibancha (première récolte), Uji, Kyoto. Cueillette manuelle début mai. Infusion recommandée : 70°C, 90 secondes. Riche en L-Théanine, saveur végétale umami profonde. 80g.",
    product_type: 'beverage',
    brand: 'Maison du Thé Japonais',
    sku: 'THE-001',
    nutriscore: 'A',
    weight_info: '80g',
    weight_grams: 80,
    unit_label: 'unit',
    price: 9.90,
    original_value: 13.20,
    stock_quantity: 32,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1576092768244-dec231e797a9?auto=format&fit=crop&q=80&w=600',
    benefits: ['Catéchines EGCG', 'L-Théanine calme', 'Première récolte'],
    aromas: ['Végétal iodé', 'Herbe fraîche', 'Umami profond'],
    categorySlug: 'boissons-jus',
  },
  {
    name: 'Kombucha Gingembre & Citron Vert',
    description: "Kombucha artisanal brassé 21 jours avec des souches SCOBY sélectionnées. Gingembre frais pressé et zeste de citron vert bio. Légèrement pétillant, naturellement fermenté. 330ml.",
    product_type: 'beverage',
    brand: 'Kombu&Co',
    sku: 'KOM-001',
    nutriscore: 'A',
    weight_info: '330ml',
    weight_grams: 350,
    unit_label: 'unit',
    price: 3.80,
    original_value: 5.00,
    stock_quantity: 35,
    is_featured: true,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=600',
    benefits: ['Probiotiques vivants', 'Digestion', 'Peu sucré (<4g)'],
    aromas: ['Gingembre vif', 'Citron vert', 'Légèrement vinaigré'],
    categorySlug: 'boissons-jus',
  },
  {
    name: 'Lait de Coco Bio Entier Première Pression',
    description: "Lait de coco biologique première pression, 22% de matières grasses naturelles. Sans carraghénanes, sans émulsifiants. Convient aux préparations salées et sucrées. 400ml.",
    product_type: 'beverage',
    brand: 'Tropics Bio',
    sku: 'LAI-002',
    nutriscore: 'A',
    weight_info: '400ml',
    weight_grams: 420,
    unit_label: 'unit',
    price: 2.40,
    original_value: 3.20,
    stock_quantity: 55,
    is_featured: false,
    is_available: true,
    is_subscribable: true,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    benefits: ['Triglycérides MCT', 'Sans lactose', 'Bio certifié AB'],
    aromas: ['Coco crémeux', 'Exotique', 'Doux naturel'],
    categorySlug: 'boissons-jus',
  },
];

// ─── Generation function ──────────────────────────────────────────────────────

export async function generateFoodProducts(
  onProgress: (done: number, total: number) => void,
): Promise<{ success: number; failed: number; categoriesCreated: number }> {
  const total = FOOD_PRODUCTS.length;
  let success = 0;
  let failed = 0;

  // ── Step 1: Upsert all required categories ──────────────────────────────────
  // onConflict: 'slug' ensures existing categories are not overwritten.
  const { data: upsertedCats, error: catError } = await supabase
    .from('categories')
    .upsert(
      FOOD_CATEGORIES.map(c => ({
        slug: c.slug,
        name: c.name,
        sort_order: c.sort_order,
        is_active: true,
      })),
      { onConflict: 'slug', ignoreDuplicates: false },
    )
    .select('id, slug');

  if (catError) {
    console.error('[generateFood] Category upsert failed:', catError.message);
    return { success: 0, failed: total, categoriesCreated: 0 };
  }

  // ── Step 2: Build slug → id map ─────────────────────────────────────────────
  // Re-fetch to include both newly created and pre-existing categories.
  const { data: allCats } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', FOOD_CATEGORIES.map(c => c.slug));

  const catMap = new Map<string, string>(
    (allCats ?? []).map(c => [c.slug, c.id]),
  );

  const categoriesCreated = upsertedCats?.length ?? 0;

  // ── Step 3: Upsert products ─────────────────────────────────────────────────
  for (let i = 0; i < FOOD_PRODUCTS.length; i++) {
    const tpl = FOOD_PRODUCTS[i];
    const categoryId = catMap.get(tpl.categorySlug);

    if (!categoryId) {
      // Should never happen since we just upserted all categories
      console.error(`[generateFood] Missing category "${tpl.categorySlug}" for "${tpl.name}"`);
      failed++;
      onProgress(i + 1, total);
      continue;
    }

    const row = {
      id: uuidv4(),
      category_id: categoryId,
      slug: slugify(tpl.name),
      name: tpl.name,
      product_type: tpl.product_type,
      brand: tpl.brand,
      sku: tpl.sku,
      description: tpl.description,
      nutriscore: tpl.nutriscore,
      weight_info: tpl.weight_info,
      weight_grams: tpl.weight_grams,
      unit_label: tpl.unit_label,
      price: tpl.price,
      original_value: tpl.original_value,
      image_url: tpl.image_url,
      stock_quantity: tpl.stock_quantity,
      is_available: tpl.is_available,
      is_featured: tpl.is_featured,
      is_active: true,
      is_bundle: false,
      is_subscribable: tpl.is_subscribable,
      min_order_quantity: 1,
      max_order_quantity: null,
      attributes: {
        benefits: tpl.benefits,
        aromas: tpl.aromas,
      },
    };

    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' });

    if (error) {
      console.error(`[generateFood] "${tpl.name}":`, error.message);
      failed++;
    } else {
      success++;
    }

    onProgress(i + 1, total);
    await new Promise(r => setTimeout(r, 150));
  }

  return { success, failed, categoriesCreated };
}
