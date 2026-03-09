import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Package,
  BarChart3,
  Users,
  Settings,
  RefreshCw,
  Award,
  MessageSquare,
  LineChart,
  Coins,
  TrendingUp,
  Leaf,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Home,
  Megaphone,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category, Order, StockMovement, Profile } from '../lib/types';
import { useSettingsStore } from '../store/settingsStore';
import SEO from '../components/SEO';

// ─── Imports statiques (onglets fréquents) ───────────────────────────────────
import AdminDashboardV2 from '../components/admin/AdminDashboardV2';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminStockTab from '../components/admin/AdminStockTab';
import AdminCustomersTab from '../components/admin/AdminCustomersTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminDashboardTab, { DashboardStats } from '../components/admin/AdminDashboardTab';

// ─── Lazy-loaded (onglets moins fréquents / lourds) ──────────────────────────
const AdminAnalyticsTab = lazy(() => import('../components/admin/AdminAnalyticsTab'));
const AdminReferralsTab = lazy(() => import('../components/admin/AdminReferralsTab'));
const AdminSubscriptionsTab = lazy(() => import('../components/admin/AdminSubscriptionsTab'));
const AdminReviewsTab = lazy(() => import('../components/admin/AdminReviewsTab'));
const AdminPromoCodesTab = lazy(() => import('../components/admin/AdminPromoCodesTab'));
const AdminRecommendationsTab = lazy(() => import('../components/admin/AdminRecommendationsTab'));
const AdminAssistantTab = lazy(() => import('../components/admin/AdminAssistantTab'));
const AdminPOSTab = lazy(() => import('../components/admin/AdminPOSTab'));
const AdminMarketingTab = lazy(() => import('../components/admin/AdminMarketingTab'));

// ─── Skeleton de chargement ───────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-zinc-800 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-zinc-800 rounded-2xl" />
      <div className="h-48 bg-zinc-800 rounded-2xl" />
    </div>
  );
}

// ─── Map prefetch pour les lazy tabs ─────────────────────────────────────────
const PREFETCH_MAP: Partial<Record<string, () => Promise<any>>> = {
  analytics: () => import('../components/admin/AdminAnalyticsTab'),
  referrals: () => import('../components/admin/AdminReferralsTab'),
  subscriptions: () => import('../components/admin/AdminSubscriptionsTab'),
  reviews: () => import('../components/admin/AdminReviewsTab'),
  promo_codes: () => import('../components/admin/AdminPromoCodesTab'),
  recommendations: () => import('../components/admin/AdminRecommendationsTab'),
  assistant: () => import('../components/admin/AdminAssistantTab'),
  pos: () => import('../components/admin/AdminPOSTab'),
  marketing: () => import('../components/admin/AdminMarketingTab'),
};

type Tab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'stock'
  | 'customers'
  | 'settings'
  | 'subscriptions'
  | 'reviews'
  | 'analytics'
  | 'promo_codes'
  | 'recommendations'
  | 'assistant'
  | 'referrals'
  | 'pos'
  | 'marketing';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { fetchSettings, settings } = useSettingsStore();

  // ─── Swipe gesture ─────────────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const tabKeys = [
    'dashboard', 'products', 'categories', 'orders', 'stock', 'customers',
    'referrals', 'subscriptions', 'reviews', 'promo_codes', 'recommendations',
    'assistant', 'analytics', 'pos', 'marketing', 'settings',
  ] as Tab[];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal movement is dominant and significant
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const currentIndex = tabKeys.indexOf(tab);
      if (dx < 0 && currentIndex < tabKeys.length - 1) {
        setTab(tabKeys[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        setTab(tabKeys[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [tab, tabKeys]);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadDashboard = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const [
      { data: allOrders },
      { data: todayOrders },
      { data: pendingOrders },
      { data: lowStock },
      { data: outOfStock },
      { data: profileCount },
      { data: recentOrders },
      { data: monthOrders },
    ] = await Promise.all([
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
      supabase.from('orders').select('id').gte('created_at', startOfToday),
      supabase.from('orders').select('id').in('status', ['pending', 'paid', 'processing']),
      supabase.from('products').select('id').gt('stock_quantity', 0).lte('stock_quantity', 5),
      supabase.from('products').select('id').eq('stock_quantity', 0),
      supabase.from('profiles').select('id'),
      supabase.from('orders').select('*, order_items(*), profile:profiles(*, addresses(*)), address:addresses(*)').order('created_at', { ascending: false }).limit(8),
      supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', startOfMonth),
    ]);
    setStats({
      totalRevenue: (allOrders ?? []).reduce((s, o) => s + Number(o.total), 0),
      revenueThisMonth: (monthOrders ?? []).reduce((s, o) => s + Number(o.total), 0),
      ordersTotal: allOrders?.length ?? 0,
      ordersToday: todayOrders?.length ?? 0,
      ordersPending: pendingOrders?.length ?? 0,
      productsLowStock: lowStock?.length ?? 0,
      productsOutOfStock: outOfStock?.length ?? 0,
      totalCustomers: profileCount?.length ?? 0,
      recentOrders: (recentOrders as Order[]) ?? [],
    });
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, embedding, category:categories(*)')
      .order('name');
    setProducts((data as Product[]) ?? []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*, products(count)').order('sort_order');
    setCategories((data as Category[]) ?? []);
  };

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*), profile:profiles(*, addresses(*)), address:addresses(*)')
      .order('created_at', { ascending: false })
      .limit(200);
    setOrders((data as Order[]) ?? []);
  };

  const loadStock = async () => {
    const [{ data: prods }, { data: movs }] = await Promise.all([
      supabase.from('products').select('id, name, stock_quantity, is_available').order('name'),
      supabase
        .from('stock_movements')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    setProducts((prods as Product[]) ?? []);
    setMovements((movs as StockMovement[]) ?? []);
  };

  const loadCustomers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setCustomers((data as Profile[]) ?? []);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    switch (tab) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'products':
        await Promise.all([loadProducts(), loadCategories()]);
        break;
      case 'categories':
        await loadCategories();
        break;
      case 'orders':
        await loadOrders();
        break;
      case 'stock':
        await loadStock();
        break;
      case 'customers':
        await loadCustomers();
        break;
      case 'marketing':
        await Promise.all([loadCustomers(), loadProducts()]);
        break;
    }
    setIsLoading(false);
  }, [tab]);

  useEffect(() => {
    loadData();
    fetchSettings();
  }, [loadData, fetchSettings]);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Produits', icon: ShoppingBag },
    { key: 'categories', label: 'Catégories', icon: Tag },
    { key: 'orders', label: 'Commandes', icon: Package },
    { key: 'stock', label: 'Stock', icon: BarChart3 },
    { key: 'customers', label: 'Clients', icon: Users },
    { key: 'referrals', label: 'Parrainages', icon: Award },
    { key: 'subscriptions', label: 'Abonnements', icon: RefreshCw },
    { key: 'reviews', label: 'Avis', icon: MessageSquare },
    { key: 'promo_codes', label: 'Codes Promo', icon: Coins },
    { key: 'recommendations', label: 'Recommandations', icon: TrendingUp },
    { key: 'assistant', label: 'Assistant IA', icon: Leaf },
    { key: 'analytics', label: 'Analytique', icon: LineChart },
    { key: 'pos', label: 'Caisse (POS)', icon: ShoppingCart },
    { key: 'marketing', label: 'Marketing IA', icon: Megaphone },
    { key: 'settings', label: 'Paramètres', icon: Settings },
  ] as const;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex overflow-hidden">
      <SEO title="Administration | Shop-ia" description="Panel d'administration pour gérer la boutique Shop-ia." />

      {/* Sidebar Desktop */}
      {tab !== 'pos' && (
        <aside
          className={`hidden md:flex flex-col border-r transition-all duration-500 relative z-30 ${isSidebarOpen ? 'w-72' : 'w-24'
            } ${isSidebarOpen ? 'bg-zinc-900/40 backdrop-blur-2xl border-white/5' : 'bg-zinc-900 border-zinc-800'}`}
        >
          {/* Subtle Glow on Sidebar */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-neon/5 via-transparent to-transparent pointer-events-none" />

          <div className="p-8 flex items-center justify-between relative z-10">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-neon to-emerald-600 flex items-center justify-center shadow-lg shadow-green-neon/20">
                  <Leaf className="w-6 h-6 text-black" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-white uppercase leading-none">Management</span>
                  <span className="text-[10px] font-bold text-green-neon/60 uppercase tracking-[0.2em]">Shop-ia</span>
                </div>
              </motion.div>
            )}
            {!isSidebarOpen && (
              <div className="w-10 h-10 rounded-2xl bg-green-neon/10 border border-green-neon/20 flex items-center justify-center mx-auto">
                <Leaf className="w-5 h-5 text-green-neon" />
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar relative z-10">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                onMouseEnter={() => PREFETCH_MAP[t.key]?.()}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${tab === t.key
                  ? 'bg-white/5 border border-white/10 text-white shadow-xl'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
              >
                {tab === t.key && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-green-neon/20 via-green-neon/5 to-transparent rounded-2xl -z-10"
                  />
                )}
                {tab === t.key && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-neon rounded-r-full shadow-[0_0_10px_rgba(57,255,20,0.8)]"
                  />
                )}
                <t.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${tab === t.key ? 'text-green-neon' : ''}`} />
                {isSidebarOpen && <span className="text-sm font-black uppercase tracking-widest text-[11px]">{t.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5 space-y-3 relative z-10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-white/5"
            >
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <a
              href="/"
              className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-green-neon hover:bg-green-neon/5 rounded-2xl transition-all border border-transparent hover:border-green-neon/10"
            >
              <Home className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest">Voir le site</span>}
              {isSidebarOpen && <ExternalLink className="w-3 h-3 ml-auto opacity-30" />}
            </a>
            <button className="w-full flex items-center gap-4 px-4 py-3 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all border border-transparent hover:border-red-500/10">
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Top Nav */}
      {tab !== 'pos' && (
        <div className="md:hidden fixed top-0 inset-x-0 h-20 bg-zinc-900/60 backdrop-blur-3xl border-b border-white/5 px-6 flex items-center justify-between z-[60]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-neon to-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter text-white">GM Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[70] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-80 bg-zinc-950 z-[80] md:hidden flex flex-col pt-24"
            >
              <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTab(t.key);
                      setIsMobileMenuOpen(false);
                    }}
                    onTouchStart={() => PREFETCH_MAP[t.key]?.()}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${tab === t.key
                      ? 'bg-green-neon text-black font-black uppercase text-[11px] tracking-widest shadow-lg shadow-green-neon/20'
                      : 'text-zinc-500 hover:text-white'
                      }`}
                  >
                    <t.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-3">
                <a
                  href="/"
                  className="w-full flex items-center gap-4 px-4 py-4 text-zinc-500 hover:text-green-neon bg-white/5 rounded-2xl transition-all"
                >
                  <Home className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Voir le site</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main
        className={`flex-1 bg-zinc-950 relative overflow-hidden ${tab === 'pos' ? 'h-screen' : 'overflow-y-auto pt-20 md:pt-0'}`}
        onTouchStart={tab !== 'pos' ? handleTouchStart : undefined}
        onTouchEnd={tab !== 'pos' ? handleTouchEnd : undefined}
      >
        {/* Dynamic Background Accents */}
        {tab !== 'pos' && (
          <>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-neon/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />
          </>
        )}

        <div className={tab === 'pos' ? 'h-full p-2' : 'max-w-[1600px] mx-auto p-6 md:p-12 relative z-10'}>
          {tab !== 'pos' && (
            <header className="mb-12 relative">
              <div className="flex flex-col gap-2">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-neon bg-green-neon/5 px-2 py-1 rounded border border-green-neon/10">Administration</span>
                  <div className="h-[1px] w-12 bg-white/10" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                  {tabs.find((t) => t.key === tab)?.label}
                </h1>
                <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl">
                  Pilotez votre écosystème Shop-ia avec une précision absolue.
                </p>
              </div>
            </header>
          )}

          <Suspense fallback={<TabSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={tab === 'pos' ? undefined : { opacity: 0, y: 10 }}
                animate={tab === 'pos' ? undefined : { opacity: 1, y: 0 }}
                exit={tab === 'pos' ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={tab === 'pos' ? 'h-full' : ''}
              >
                {tab === 'dashboard' && stats && (
                  <AdminDashboardV2
                    stats={stats}
                    onViewOrders={() => setTab('orders')}
                    onViewStock={() => setTab('stock')}
                  />
                )}
                {tab === 'products' && (
                  <AdminProductsTab
                    products={products}
                    categories={categories}
                    onRefresh={loadProducts}
                  />
                )}
                {tab === 'categories' && (
                  <AdminCategoriesTab categories={categories} onRefresh={loadCategories} />
                )}
                {tab === 'orders' && (
                  <AdminOrdersTab
                    orders={orders}
                    onRefresh={loadOrders}
                    storeName={settings.store_name}
                    storeAddress={settings.store_address}
                  />
                )}
                {tab === 'stock' && (
                  <AdminStockTab products={products} movements={movements} onRefresh={loadStock} />
                )}
                {tab === 'customers' && (
                  <AdminCustomersTab customers={customers} onRefresh={loadCustomers} />
                )}
                {tab === 'referrals' && <AdminReferralsTab />}
                {tab === 'subscriptions' && <AdminSubscriptionsTab />}
                {tab === 'reviews' && <AdminReviewsTab />}
                {tab === 'analytics' && <AdminAnalyticsTab />}
                {tab === 'promo_codes' && <AdminPromoCodesTab />}
                {tab === 'recommendations' && <AdminRecommendationsTab />}
                {tab === 'assistant' && <AdminAssistantTab />}
                {tab === 'pos' && <AdminPOSTab onExit={() => setTab('dashboard')} />}
                {tab === 'marketing' && (
                  <AdminMarketingTab
                    customers={customers}
                    products={products}
                    onRefresh={() => {
                      loadCustomers();
                      loadProducts();
                    }}
                  />
                )}
                {tab === 'settings' && <AdminSettingsTab />}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
