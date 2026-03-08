import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, LayoutGrid, ChevronLeft, ChevronRight, Star, Clock, ArrowUp, Flame, Tag, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuthStore } from '../store/authStore';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [selectedAroma, setSelectedAroma] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [subscribableOnly, setSubscribableOnly] = useState(false);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isNewOnly, setIsNewOnly] = useState(false);
  const [displayDensity, setDisplayDensity] = useState<'cozy' | 'compact' | 'list'>('cozy');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 24;

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('name'),
      ]);
      const categoryList = (cats as Category[]) ?? [];
      const productList = (prods as Product[]) ?? [];

      const nonemptyCategoryIds = new Set(productList.map(p => p.category_id));
      const filteredCategories = categoryList.filter(c => nonemptyCategoryIds.has(c.id));

      setCategories(filteredCategories);

      if (productList.length > 0) {
        const productIds = productList.map((p) => p.id);
        const { data: ratingsData } = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', productIds)
          .eq('is_published', true);

        const ratingMap = new Map<string, { sum: number; count: number }>();
        (ratingsData ?? []).forEach((r: { product_id: string; rating: number }) => {
          const cur = ratingMap.get(r.product_id) ?? { sum: 0, count: 0 };
          ratingMap.set(r.product_id, { sum: cur.sum + r.rating, count: cur.count + 1 });
        });

        const withRatings = productList.map((p) => {
          const r = ratingMap.get(p.id);
          return r ? { ...p, avg_rating: r.sum / r.count, review_count: r.count } : p;
        });
        setProducts(withRatings);
      } else {
        setProducts(productList);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const allBenefits = Array.from(new Set(products.flatMap(p => p.attributes?.benefits || [])));
  const allAromas = Array.from(new Set(products.flatMap(p => p.attributes?.aromas || [])));
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  useEffect(() => {
    if (products.length === 0) return;
    const minParam = searchParams.get('minPrice');
    const maxParam = searchParams.get('maxPrice');
    const minValue = minParam ? Number(minParam) : priceBounds.min;
    const maxValue = maxParam ? Number(maxParam) : priceBounds.max;

    setSelectedBenefit(searchParams.get('benefit'));
    setSelectedAroma(searchParams.get('aroma'));
    setSortBy((searchParams.get('sort') as typeof sortBy) || 'featured');
    setInStockOnly(searchParams.get('stock') === '1');
    setFeaturedOnly(searchParams.get('featured') === '1');
    setSubscribableOnly(searchParams.get('subscribable') === '1');
    setIsNewOnly(searchParams.get('new') === '1');
    setMinRating(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
    setDisplayDensity((searchParams.get('density') as any) || 'cozy');
    setPriceMin(Number.isFinite(minValue) ? Math.max(priceBounds.min, minValue) : priceBounds.min);
    setPriceMax(Number.isFinite(maxValue) ? Math.min(priceBounds.max, maxValue) : priceBounds.max);
  }, [products, priceBounds.max, priceBounds.min, searchParams]);

  useEffect(() => {
    if (priceMin === null || priceMax === null) return;
    const nextParams = new URLSearchParams();
    if (selectedCategory) nextParams.set('category', selectedCategory);
    if (searchQuery) nextParams.set('search', searchQuery);
    if (selectedBenefit) nextParams.set('benefit', selectedBenefit);
    if (selectedAroma) nextParams.set('aroma', selectedAroma);
    if (sortBy !== 'featured') nextParams.set('sort', sortBy);
    if (inStockOnly) nextParams.set('stock', '1');
    if (featuredOnly) nextParams.set('featured', '1');
    if (subscribableOnly) nextParams.set('subscribable', '1');
    if (isNewOnly) nextParams.set('new', '1');
    if (minRating) nextParams.set('rating', String(minRating));
    if (displayDensity !== 'cozy') nextParams.set('density', displayDensity);
    if (priceMin > priceBounds.min) nextParams.set('minPrice', String(priceMin));
    if (priceMax < priceBounds.max) nextParams.set('maxPrice', String(priceMax));
    setSearchParams(nextParams, { replace: true });
  }, [selectedCategory, searchQuery, selectedBenefit, selectedAroma, sortBy, inStockOnly, featuredOnly, subscribableOnly, isNewOnly, minRating, displayDensity, priceMin, priceMax, setSearchParams, priceBounds.min, priceBounds.max]);

  const filtered = products.filter((p) => {
    const matchCat = !selectedCategory || p.category_id === selectedCategory || p.category?.slug === selectedCategory;
    const matchBenefit = !selectedBenefit || (p.attributes?.benefits || []).includes(selectedBenefit);
    const matchAroma = !selectedAroma || (p.attributes?.aromas || []).includes(selectedAroma);
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStock = !inStockOnly || (p.is_available && p.stock_quantity > 0);
    const matchFeatured = !featuredOnly || p.is_featured;
    const matchSubscribable = !subscribableOnly || p.is_subscribable;
    const matchPrice = priceMin === null || priceMax === null ? true : p.price >= priceMin && p.price <= priceMax;
    const matchRating = minRating === null || (p.avg_rating ?? 0) >= minRating;
    const isNewRecord = (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 3600 * 24) <= 30; // 30 days
    const matchNew = !isNewOnly || isNewRecord;

    return matchCat && matchBenefit && matchAroma && matchSearch && matchStock && matchFeatured && matchSubscribable && matchPrice && matchRating && matchNew;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'rating': return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  });

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sorted.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedBenefit, selectedAroma, searchQuery, sortBy, inStockOnly, featuredOnly, subscribableOnly, minRating, isNewOnly, priceMin, priceMax]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-2 overflow-hidden">
      <SEO
        title="CATALOGUE | Shop-ia"
        description="Découvrez tous nos produits premium, naviguez par catégorie et filtrez selon vos besoins."
      />

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none" />

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

        {/* Top Header & Search similar to Amazon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 mb-4 border-b border-white/10">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
            Catalogue
          </h1>
          <div className="relative w-full md:max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:outline-none focus:border-green-neon transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 rounded-xl border border-white/10 text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtrer & Trier
          </button>
        </div>

        {/* Amazon-like Quick Links Menu */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 mb-4 custom-scrollbar whitespace-nowrap hide-scrollbar">
          <button onClick={() => { setSortBy('featured'); setFeaturedOnly(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-white hover:border-green-neon hover:text-green-neon transition-colors">
            <Flame className="w-4 h-4 text-orange-500" /> Meilleures Ventes
          </button>
          <button onClick={() => { setSortBy('newest'); setIsNewOnly(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-white hover:border-green-neon hover:text-green-neon transition-colors">
            <Clock className="w-4 h-4 text-blue-400" /> Dernières Nouveautés
          </button>
          <button onClick={() => { setSortBy('rating'); setMinRating(4); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-white hover:border-green-neon hover:text-green-neon transition-colors">
            <Star className="w-4 h-4 text-yellow-500" /> Les Mieux Notés
          </button>
          <button onClick={() => { setSubscribableOnly(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-white hover:border-green-neon hover:text-green-neon transition-colors">
            <Tag className="w-4 h-4 text-purple-400" /> Abonnements
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar (Amazon-like) */}
          <aside className={`lg:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-8 overflow-y-auto max-h-[85vh] pr-4 custom-scrollbar">

              {/* Reset ALL */}
              {(selectedCategory || selectedBenefit || selectedAroma || searchQuery || inStockOnly || featuredOnly || subscribableOnly || isNewOnly || minRating || priceMin !== priceBounds.min || priceMax !== priceBounds.max) && (
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedBenefit(null); setSelectedAroma(null); setSearchQuery(''); setInStockOnly(false); setFeaturedOnly(false); setSubscribableOnly(false); setIsNewOnly(false); setMinRating(null); setPriceMin(priceBounds.min); setPriceMax(priceBounds.max); }}
                  className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mb-4"
                >
                  <X className="w-4 h-4" /> Effacer les filtres
                </button>
              )}

              {/* Categories Navigation */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Rayons</h3>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`text-sm transition-colors text-left w-full ${!selectedCategory ? 'text-green-neon font-bold' : 'text-zinc-300 hover:text-green-neon'}`}
                    >
                      Tous les produits
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-sm transition-colors text-left w-full ${selectedCategory === cat.id ? 'text-green-neon font-bold' : 'text-zinc-300 hover:text-green-neon'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Options/Availability */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Disponibilité</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">En stock uniquement</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={featuredOnly} onChange={() => setFeaturedOnly(!featuredOnly)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">Produits Elite</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={subscribableOnly} onChange={() => setSubscribableOnly(!subscribableOnly)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon" />
                    <span className="text-sm text-zinc-300 group-hover:text-white">Abonnement possible</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={isNewOnly} onChange={() => setIsNewOnly(!isNewOnly)} className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon" />
                    <span className="text-sm flex items-center gap-2 text-zinc-300 group-hover:text-white">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Nouveauté ({'<'}30j)
                    </span>
                  </label>
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Avis Clients</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? null : rating)}
                      className={`flex items-center gap-2 w-full text-left transition-colors ${minRating === rating ? 'text-green-neon font-medium' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current text-yellow-500' : 'text-zinc-700'} ${minRating === rating && i < rating ? 'text-green-neon' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm">& plus</span>
                    </button>
                  ))}
                  {minRating && (
                    <button onClick={() => setMinRating(null)} className="text-xs text-zinc-500 hover:text-white pt-2">&times; Effacer le filtre avis</button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Prix (€)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{priceMin ?? priceBounds.min}€</span>
                    <span>{priceMax ?? priceBounds.max}€</span>
                  </div>
                  <div className="space-y-2">
                    <input type="range" min={priceBounds.min} max={priceBounds.max} value={priceMin ?? priceBounds.min} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax ?? priceBounds.max))} className="w-full accent-green-neon" />
                    <input type="range" min={priceBounds.min} max={priceBounds.max} value={priceMax ?? priceBounds.max} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin ?? priceBounds.min))} className="w-full accent-green-neon" />
                  </div>
                </div>
              </div>

              {/* Benefits (Effets) */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Effets Recherchés</h3>
                <div className="space-y-2">
                  {allBenefits.map((benefit) => (
                    <label key={benefit} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBenefit === benefit}
                        onChange={() => setSelectedBenefit(selectedBenefit === benefit ? null : benefit)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon"
                      />
                      <span className={`text-sm ${selectedBenefit === benefit ? 'text-green-neon font-medium' : 'text-zinc-300 group-hover:text-white'}`}>
                        {benefit}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Aromas */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Notes Aromatiques</h3>
                <div className="space-y-2">
                  {allAromas.map((aroma) => (
                    <label key={aroma} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedAroma === aroma}
                        onChange={() => setSelectedAroma(selectedAroma === aroma ? null : aroma)}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-neon focus:ring-green-neon"
                      />
                      <span className={`text-sm ${selectedAroma === aroma ? 'text-green-neon font-medium' : 'text-zinc-300 group-hover:text-white'}`}>
                        {aroma}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Right Area: Products Grid */}
          <div className="flex-1">

            {/* Sort & Stats Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 gap-4">
              <div className="text-sm text-zinc-400 font-medium px-2">
                <strong className="text-white">{filtered.length}</strong> produits trouvés
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-1">
                  <button onClick={() => setDisplayDensity('cozy')} className={`p-1.5 rounded-md transition-colors ${displayDensity === 'cozy' ? 'bg-zinc-800 text-green-neon' : 'text-zinc-500'}`} aria-label="Grille spacieuse"><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setDisplayDensity('compact')} className={`p-1.5 rounded-md transition-colors ${displayDensity === 'compact' ? 'bg-zinc-800 text-green-neon' : 'text-zinc-500'}`} aria-label="Grille compacte"><LayoutGrid className="w-4 h-4 opacity-50" /></button>
                  <button onClick={() => setDisplayDensity('list')} className={`p-1.5 rounded-md transition-colors ${displayDensity === 'list' ? 'bg-zinc-800 text-green-neon' : 'text-zinc-500'}`} aria-label="Vue Liste"><List className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2 cursor-default">Trier par:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer hover:text-green-neon transition-colors"
                  >
                    <option value="featured" className="bg-zinc-900">Populaires</option>
                    <option value="price_asc" className="bg-zinc-900">Prix: croissant</option>
                    <option value="price_desc" className="bg-zinc-900">Prix: décroissant</option>
                    <option value="rating" className="bg-zinc-900">Mieux notés</option>
                    <option value="newest" className="bg-zinc-900">Nouveautés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className={`grid ${displayDensity === 'list' ? 'grid-cols-1 gap-4' : displayDensity === 'compact' ? 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`animate-pulse ${displayDensity === 'list' ? 'flex flex-row gap-4' : ''}`}>
                    <div className={`bg-white/[0.03] rounded-3xl ${displayDensity === 'list' ? 'w-48 aspect-square' : 'aspect-[3/4] mb-4'}`} />
                    <div className={`space-y-2 px-2 flex-1 ${displayDensity === 'list' ? 'py-4' : ''}`}>
                      <div className="h-4 bg-white/[0.03] rounded-md w-1/3" />
                      <div className="h-5 bg-white/[0.03] rounded-md w-3/4" />
                      <div className="h-8 bg-white/[0.03] rounded-lg w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-32 space-y-6 bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem]">
                <Search className="w-12 h-12 text-zinc-600 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-white">Aucun résultat</h2>
                  <p className="text-zinc-500">Veuillez élargir votre recherche ou modifier vos filtres.</p>
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedBenefit(null); setSelectedAroma(null); setInStockOnly(false); setFeaturedOnly(false); setSubscribableOnly(false); setIsNewOnly(false); setMinRating(null); setPriceMin(priceBounds.min); setPriceMax(priceBounds.max); }}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                >
                  Effacer tous les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className={`grid ${displayDensity === 'list' ? 'grid-cols-1 gap-4' : displayDensity === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'}`}>
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        layout
                      >
                        <ProductCard product={product} layout={displayDensity === 'list' ? 'list' : 'grid'} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10 border-t border-zinc-800/50">
                    <button
                      onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === currentPage
                          ? 'bg-zinc-100 text-black'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 p-3 bg-zinc-800 border border-zinc-700 shadow-xl rounded-full text-white hover:bg-zinc-700 hover:text-green-neon transition-all"
            aria-label="Retour en haut"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
