import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, ArrowUp, Flame, Tag, List, Star, Clock,
  ChevronDown, SlidersHorizontal, Grid2X2, LayoutList,
  ShoppingBag,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({
  id, title, isOpen, onToggle, children,
}: {
  id: string; title: string; isOpen: boolean; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full py-3 text-left group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 group-hover:text-white transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [selectedAroma, setSelectedAroma] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [subscribableOnly, setSubscribableOnly] = useState(false);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isNewOnly, setIsNewOnly] = useState(false);

  // UI
  const [displayDensity, setDisplayDensity] = useState<'cozy' | 'compact' | 'list'>('cozy');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['price', 'availability']));

  const PRODUCTS_PER_PAGE = 24;

  // ─── Data loading ──────────────────────────────────────────────────────────

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
      setCategories(categoryList.filter(c => nonemptyCategoryIds.has(c.id)));

      if (productList.length > 0) {
        const { data: ratingsData } = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', productList.map(p => p.id))
          .eq('is_published', true);

        const ratingMap = new Map<string, { sum: number; count: number }>();
        (ratingsData ?? []).forEach((r: { product_id: string; rating: number }) => {
          const cur = ratingMap.get(r.product_id) ?? { sum: 0, count: 0 };
          ratingMap.set(r.product_id, { sum: cur.sum + r.rating, count: cur.count + 1 });
        });

        setProducts(productList.map(p => {
          const r = ratingMap.get(p.id);
          return r ? { ...p, avg_rating: r.sum / r.count, review_count: r.count } : p;
        }));
      } else {
        setProducts(productList);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const allBenefits = useMemo(
    () => Array.from(new Set(products.flatMap(p => p.attributes?.benefits || []))),
    [products]
  );
  const allAromas = useMemo(
    () => Array.from(new Set(products.flatMap(p => p.attributes?.aromas || []))),
    [products]
  );
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map(p => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const categoryProductCount = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1));
    return map;
  }, [products]);

  // ─── URL Sync ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (products.length === 0) return;
    const minParam = searchParams.get('minPrice');
    const maxParam = searchParams.get('maxPrice');
    setSelectedBenefit(searchParams.get('benefit'));
    setSelectedAroma(searchParams.get('aroma'));
    setSortBy((searchParams.get('sort') as typeof sortBy) || 'featured');
    setInStockOnly(searchParams.get('stock') === '1');
    setFeaturedOnly(searchParams.get('featured') === '1');
    setSubscribableOnly(searchParams.get('subscribable') === '1');
    setIsNewOnly(searchParams.get('new') === '1');
    setMinRating(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
    setDisplayDensity((searchParams.get('density') as any) || 'cozy');
    const minValue = minParam ? Number(minParam) : priceBounds.min;
    const maxValue = maxParam ? Number(maxParam) : priceBounds.max;
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

  // ─── Filtering & Sorting ───────────────────────────────────────────────────

  const filtered = useMemo(() => products.filter(p => {
    const matchCat = !selectedCategory || p.category_id === selectedCategory || p.category?.slug === selectedCategory;
    const matchBenefit = !selectedBenefit || (p.attributes?.benefits || []).includes(selectedBenefit);
    const matchAroma = !selectedAroma || (p.attributes?.aromas || []).includes(selectedAroma);
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStock = !inStockOnly || (p.is_available && p.stock_quantity > 0);
    const matchFeatured = !featuredOnly || p.is_featured;
    const matchSubscribable = !subscribableOnly || p.is_subscribable;
    const matchPrice = priceMin === null || priceMax === null ? true : p.price >= priceMin && p.price <= priceMax;
    const matchRating = minRating === null || (p.avg_rating ?? 0) >= minRating;
    const isNewRecord = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 3600 * 24) <= 30;
    return matchCat && matchBenefit && matchAroma && matchSearch && matchStock && matchFeatured && matchSubscribable && matchPrice && matchRating && (!isNewOnly || isNewRecord);
  }), [products, selectedCategory, selectedBenefit, selectedAroma, searchQuery, inStockOnly, featuredOnly, subscribableOnly, priceMin, priceMax, minRating, isNewOnly]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'rating': return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
  }), [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sorted.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  // ─── Side effects ──────────────────────────────────────────────────────────

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedBenefit, selectedAroma, searchQuery, sortBy, inStockOnly, featuredOnly, subscribableOnly, minRating, isNewOnly, priceMin, priceMax]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Active Filters ────────────────────────────────────────────────────────

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (inStockOnly) activeFilters.push({ label: 'En stock', onRemove: () => setInStockOnly(false) });
  if (featuredOnly) activeFilters.push({ label: 'Produits Elite', onRemove: () => setFeaturedOnly(false) });
  if (subscribableOnly) activeFilters.push({ label: 'Abonnement', onRemove: () => setSubscribableOnly(false) });
  if (isNewOnly) activeFilters.push({ label: 'Nouveautés', onRemove: () => setIsNewOnly(false) });
  if (minRating) activeFilters.push({ label: `${minRating}★ & +`, onRemove: () => setMinRating(null) });
  if (selectedBenefit) activeFilters.push({ label: selectedBenefit, onRemove: () => setSelectedBenefit(null) });
  if (selectedAroma) activeFilters.push({ label: selectedAroma, onRemove: () => setSelectedAroma(null) });
  if (priceMin !== null && priceMin > priceBounds.min) activeFilters.push({ label: `Min ${priceMin}€`, onRemove: () => setPriceMin(priceBounds.min) });
  if (priceMax !== null && priceMax < priceBounds.max) activeFilters.push({ label: `Max ${priceMax}€`, onRemove: () => setPriceMax(priceBounds.max) });

  const activeFilterCount = activeFilters.length;

  function clearAllFilters() {
    setSelectedCategory(null);
    setSelectedBenefit(null);
    setSelectedAroma(null);
    setSearchQuery('');
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSubscribableOnly(false);
    setIsNewOnly(false);
    setMinRating(null);
    setPriceMin(priceBounds.min);
    setPriceMax(priceBounds.max);
  }

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ─── Sidebar content (reused in both desktop & bottom sheet) ──────────────

  function SidebarContent() {
    return (
      <div className="space-y-0">

        {/* Price */}
        <AccordionSection id="price" title="Prix (€)" isOpen={openSections.has('price')} onToggle={toggleSection}>
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
              <span className="bg-zinc-800 px-2 py-1 rounded-md">{priceMin ?? priceBounds.min}€</span>
              <span className="bg-zinc-800 px-2 py-1 rounded-md">{priceMax ?? priceBounds.max}€</span>
            </div>
            <div className="space-y-2 px-1">
              <input
                type="range" min={priceBounds.min} max={priceBounds.max}
                value={priceMin ?? priceBounds.min}
                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax ?? priceBounds.max))}
                className="w-full accent-green-neon"
              />
              <input
                type="range" min={priceBounds.min} max={priceBounds.max}
                value={priceMax ?? priceBounds.max}
                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin ?? priceBounds.min))}
                className="w-full accent-green-neon"
              />
            </div>
          </div>
        </AccordionSection>

        {/* Availability */}
        <AccordionSection id="availability" title="Disponibilité" isOpen={openSections.has('availability')} onToggle={toggleSection}>
          <div className="space-y-2 pt-1">
            {[
              { label: 'En stock uniquement', value: inStockOnly, set: setInStockOnly },
              { label: 'Produits Elite', value: featuredOnly, set: setFeaturedOnly },
              { label: 'Abonnement possible', value: subscribableOnly, set: setSubscribableOnly },
              { label: 'Nouveauté (<30j)', value: isNewOnly, set: setIsNewOnly },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => set(!value)}
                  className={`w-4 h-4 rounded border transition-all flex-shrink-0 cursor-pointer ${value ? 'bg-green-neon border-green-neon' : 'border-zinc-600 bg-zinc-800'}`}
                >
                  {value && <svg className="w-full h-full text-black p-0.5" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className={`text-sm transition-colors ${value ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>

        {/* Ratings */}
        <AccordionSection id="ratings" title="Avis Clients" isOpen={openSections.has('ratings')} onToggle={toggleSection}>
          <div className="space-y-1.5 pt-1">
            {[4, 3, 2].map(rating => (
              <button
                key={rating}
                onClick={() => setMinRating(minRating === rating ? null : rating)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg transition-all ${minRating === rating ? 'bg-green-neon/10 text-green-neon' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`} />
                  ))}
                </div>
                <span className="text-xs">& plus</span>
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* Benefits */}
        {allBenefits.length > 0 && (
          <AccordionSection id="benefits" title="Effets Recherchés" isOpen={openSections.has('benefits')} onToggle={toggleSection}>
            <div className="space-y-2 pt-1">
              {allBenefits.map(benefit => (
                <label key={benefit} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setSelectedBenefit(selectedBenefit === benefit ? null : benefit)}
                    className={`w-4 h-4 rounded border transition-all flex-shrink-0 cursor-pointer ${selectedBenefit === benefit ? 'bg-green-neon border-green-neon' : 'border-zinc-600 bg-zinc-800'}`}
                  >
                    {selectedBenefit === benefit && <svg className="w-full h-full text-black p-0.5" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`text-sm transition-colors ${selectedBenefit === benefit ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{benefit}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Aromas */}
        {allAromas.length > 0 && (
          <AccordionSection id="aromas" title="Notes Aromatiques" isOpen={openSections.has('aromas')} onToggle={toggleSection}>
            <div className="space-y-2 pt-1">
              {allAromas.map(aroma => (
                <label key={aroma} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setSelectedAroma(selectedAroma === aroma ? null : aroma)}
                    className={`w-4 h-4 rounded border transition-all flex-shrink-0 cursor-pointer ${selectedAroma === aroma ? 'bg-green-neon border-green-neon' : 'border-zinc-600 bg-zinc-800'}`}
                  >
                    {selectedAroma === aroma && <svg className="w-full h-full text-black p-0.5" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`text-sm transition-colors ${selectedAroma === aroma ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{aroma}</span>
                </label>
              ))}
            </div>
          </AccordionSection>
        )}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 pt-2">
      <SEO
        title="CATALOGUE | Shop-ia"
        description="Découvrez tous nos produits premium, naviguez par catégorie et filtrez selon vos besoins."
      />

      {/* ── Category Tabs (sticky) ────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-3">

            {/* All products tab */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all duration-200 group ${
                !selectedCategory
                  ? 'bg-green-neon/10 border border-green-neon/40'
                  : 'border border-transparent hover:bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                !selectedCategory
                  ? 'bg-green-neon/20 border-green-neon/50'
                  : 'bg-zinc-800 border-zinc-700 group-hover:border-zinc-600'
              }`}>
                <ShoppingBag className={`w-5 h-5 ${!selectedCategory ? 'text-green-neon' : 'text-zinc-400'}`} />
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${!selectedCategory ? 'text-green-neon' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                Tout
              </span>
              <span className={`text-[9px] font-bold tabular-nums ${!selectedCategory ? 'text-green-neon/70' : 'text-zinc-600'}`}>
                {products.length}
              </span>
            </button>

            {/* Separator */}
            <div className="w-px h-10 bg-white/10 flex-shrink-0" />

            {/* Category tabs */}
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id || selectedCategory === cat.slug;
              const count = categoryProductCount.get(cat.id) ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-green-neon/10 border border-green-neon/40'
                      : 'border border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full overflow-hidden border transition-all ${
                    isActive
                      ? 'border-green-neon/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-lg ${isActive ? 'bg-green-neon/20' : 'bg-zinc-800'}`}>
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold whitespace-nowrap max-w-[80px] truncate ${isActive ? 'text-green-neon' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {cat.name}
                  </span>
                  <span className={`text-[9px] font-bold tabular-nums ${isActive ? 'text-green-neon/70' : 'text-zinc-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-5">
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight flex items-baseline gap-3">
              Catalogue
              {!isLoading && (
                <span className="text-sm font-sans font-normal text-zinc-500">
                  {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </h1>
            {selectedCategory && (
              <p className="text-sm text-zinc-500 mt-0.5">
                {categories.find(c => c.id === selectedCategory)?.name}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-neon/50 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setShowFilters(true)}
            className="lg:hidden relative flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-medium text-white hover:border-zinc-600 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-neon text-black text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-3 mb-1">
          {[
            { icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, label: 'Meilleures Ventes', action: () => { setSortBy('featured'); setFeaturedOnly(true); } },
            { icon: <Clock className="w-3.5 h-3.5 text-blue-400" />, label: 'Nouveautés', action: () => { setSortBy('newest'); setIsNewOnly(true); } },
            { icon: <Star className="w-3.5 h-3.5 text-yellow-400" />, label: 'Mieux Notés', action: () => { setSortBy('rating'); setMinRating(4); } },
            { icon: <Tag className="w-3.5 h-3.5 text-purple-400" />, label: 'Abonnements', action: () => setSubscribableOnly(true) },
          ].map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-all whitespace-nowrap"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap py-2 mb-3">
                {activeFilters.map(f => (
                  <button
                    key={f.label}
                    onClick={f.onRemove}
                    className="flex items-center gap-1.5 px-3 py-1 bg-green-neon/10 border border-green-neon/30 rounded-full text-xs font-medium text-green-neon hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all group"
                  >
                    {f.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors ml-1 underline"
                >
                  Tout effacer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div className="flex gap-8">

          {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[90px] bg-zinc-900/40 rounded-2xl border border-white/5 overflow-hidden">

              {/* Sidebar header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                  Filtres
                </span>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-[10px] text-red-400 hover:text-red-300 font-medium uppercase tracking-widest transition-colors">
                    Effacer ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Sidebar content */}
              <div className="px-4 py-2">
                <SidebarContent />
              </div>
            </div>
          </aside>

          {/* ── Products Area ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Sort & display bar */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="text-sm text-zinc-500">
                <strong className="text-white font-semibold">{filtered.length}</strong> résultat{filtered.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="inline-flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
                  {([
                    { key: 'cozy', icon: <Grid2X2 className="w-4 h-4" />, label: 'Grille' },
                    { key: 'compact', icon: <LayoutList className="w-4 h-4" />, label: 'Compact' },
                    { key: 'list', icon: <List className="w-4 h-4" />, label: 'Liste' },
                  ] as const).map(({ key, icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setDisplayDensity(key)}
                      aria-label={label}
                      className={`p-2 rounded-md transition-all ${displayDensity === key ? 'bg-zinc-700 text-green-neon' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Sort select */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider hidden sm:block">Trier :</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="featured" className="bg-zinc-900">Populaires</option>
                    <option value="price_asc" className="bg-zinc-900">Prix croissant</option>
                    <option value="price_desc" className="bg-zinc-900">Prix décroissant</option>
                    <option value="rating" className="bg-zinc-900">Mieux notés</option>
                    <option value="newest" className="bg-zinc-900">Nouveautés</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {isLoading ? (
              <div className={`grid ${
                displayDensity === 'list' ? 'grid-cols-1 gap-4' :
                displayDensity === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3' :
                'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`animate-pulse ${displayDensity === 'list' ? 'flex gap-4' : ''}`}>
                    <div className={`bg-zinc-900 rounded-2xl ${displayDensity === 'list' ? 'w-44 h-44 flex-shrink-0' : 'aspect-square mb-3'}`} />
                    {displayDensity !== 'list' && (
                      <div className="space-y-2 px-1">
                        <div className="h-3 bg-zinc-900 rounded w-1/3" />
                        <div className="h-4 bg-zinc-900 rounded w-3/4" />
                        <div className="h-8 bg-zinc-900 rounded-lg w-full mt-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-24 space-y-5 bg-zinc-900/20 border border-zinc-800/40 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-white mb-2">Aucun résultat</h2>
                  <p className="text-zinc-500 text-sm">Élargissez votre recherche ou modifiez les filtres.</p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-all"
                >
                  Effacer tous les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className={`grid ${
                  displayDensity === 'list' ? 'grid-cols-1 gap-4' :
                  displayDensity === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3' :
                  'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
                }`}>
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map(product => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        layout
                      >
                        <ProductCard product={product} layout={displayDensity === 'list' ? 'list' : 'grid'} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Smart Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-8 border-t border-zinc-800/40">
                    <button
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      ← Préc.
                    </button>

                    {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-9 text-center text-zinc-600 text-sm">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            page === currentPage
                              ? 'bg-green-neon text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      Suiv. →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobile Bottom Sheet ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl border-t border-white/10 max-h-[85vh] flex flex-col shadow-2xl"
            >
              {/* Handle */}
              <div className="flex flex-col items-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <span className="font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                  Filtres
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-green-neon text-black text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <button onClick={() => setShowFilters(false)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <SidebarContent />
              </div>

              {/* Sheet footer */}
              <div className="px-5 py-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-all"
                >
                  Effacer
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-green-neon text-black text-sm font-bold hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
                >
                  Voir {filtered.length} résultats
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Scroll to top FAB ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-6 z-50 w-11 h-11 bg-zinc-800 border border-zinc-700 shadow-xl rounded-full text-white hover:bg-zinc-700 hover:text-green-neon transition-all flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
