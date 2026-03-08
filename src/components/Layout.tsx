import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  ShoppingCart,
  User,
  LogOut,
  ShieldCheck,
  Search,
  Sparkles,
  QrCode,
  Utensils,
  ChevronDown,
  Star,
  Mail,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import CartSidebar from "./CartSidebar";
import ShopiaAssistant from "./ShopiaAssistant";
import LoyaltyCard from "./LoyaltyCard";
import ToastContainer from "./Toast";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/settingsStore";
import { supabase } from "../lib/supabase";
import { Product, Category } from "../lib/types";
import StarRating from "./StarRating";
import { generateEmbedding } from "../lib/embeddings";

function BannerTicker({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="relative h-4 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: Product[]; categories: Category[] }>({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  const itemCount = useCartStore((s) => s.itemCount());
  const openSidebar = useCartStore((s) => s.openSidebar);
  const { user, profile, signOut } = useAuthStore();
  const settings = useSettingsStore((s) => s.settings);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change and scroll to top
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsSearchOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Predictive search logic
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ products: [], categories: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const text = searchQuery.trim();
        console.log('[Search] Début de recherche pour:', text);

        // 1. Recherche classique (Mots-clés & Catégories) - RAPIDE & FIABLE
        const [kwRes, catRes] = await Promise.all([
          supabase.from("products").select("*, category:categories(*)").ilike("name", `%${text}%`).eq("is_active", true).limit(10),
          supabase.from("categories").select("*").ilike("name", `%${text}%`).eq("is_active", true).limit(3)
        ]);

        const keywordProducts = kwRes.data || [];
        const searchCategories = catRes.data || [];

        // Affichage immédiat des résultats par mots-clés
        setSearchResults({ products: keywordProducts, categories: searchCategories });

        // 2. Recherche Vectorielle (IA) - EN OPTION
        try {
          const embedding = await generateEmbedding(text).catch((e) => {
            console.warn('[Search] Erreur embedding (ignorée):', e);
            return null;
          });

          if (embedding) {
            const { data: vectorProducts } = await supabase.rpc('match_products', {
              query_embedding: embedding,
              match_threshold: 0.1,
              match_count: 10
            });

            if (vectorProducts && vectorProducts.length > 0) {
              const mergedMap = new Map<string, Product>();
              keywordProducts.forEach(p => mergedMap.set(p.id, p));
              (vectorProducts as Product[]).forEach(pv => {
                if (!mergedMap.has(pv.id)) mergedMap.set(pv.id, pv);
              });

              const mergedProducts = Array.from(mergedMap.values()).slice(0, 10);

              // 3. Récupération des notes pour les produits fusionnés
              const { data: ratingsData } = await supabase
                .from("reviews")
                .select("product_id, rating")
                .in("product_id", mergedProducts.map(p => p.id))
                .eq("is_published", true);

              const ratingMap = new Map<string, { sum: number; count: number }>();
              (ratingsData || []).forEach((r) => {
                const cur = ratingMap.get(r.product_id) ?? { sum: 0, count: 0 };
                ratingMap.set(r.product_id, { sum: cur.sum + r.rating, count: cur.count + 1 });
              });

              const finalProducts = mergedProducts.map((p) => {
                const r = ratingMap.get(p.id);
                return r ? { ...p, avg_rating: r.sum / r.count, review_count: r.count } : p;
              });

              setSearchResults({ products: finalProducts, categories: searchCategories });
            }
          }
        } catch (vErr) {
          console.warn('[Search] Erreur recherche vectorielle (douce):', vErr);
        }
      } catch (error) {
        console.error("[Search] Erreur fatale:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close search on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const baseNavLinks = [
    { name: "Accueil", path: "/" },
    { name: "La Boutique", path: "/boutique" },
    { name: "Catalogue", path: "/catalogue" },
    { name: "Nos Services", path: "/boutique" },
    { name: "Qualité & Fraîcheur", path: "/qualite" },
    { name: "Contact", path: "/contact" },
  ];

  const navLinks = baseNavLinks;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans">
      {/* Cart Sidebar */}
      <CartSidebar />

      {/* Shopia Assistant IA Widget */}
      {/* Shopia Assistant IA Widget - Visible for all, respects toggles if they exist */}
      {((!settings) || (settings.assistant_chat_enabled !== false) || (settings.assistant_voice_enabled !== false)) && <ShopiaAssistant />}

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Promotional Banner */}
      <AnimatePresence>
        {isBannerVisible && settings.banner_enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-green-neon text-black relative flex items-center justify-center overflow-hidden z-[60]"
          >
            <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-center w-full max-w-7xl mx-auto pr-10">
              <BannerTicker messages={[
                settings.banner_text,
                ...(settings.ticker_messages || [])
              ].filter(Boolean)} />
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="absolute right-4 p-1.5 hover:bg-black/10 rounded-full transition-colors group"
              aria-label="Fermer la bannière"
            >
              <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-[999] w-full"
      >
        {/* ── Top Info Bar ── */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-zinc-900/60 backdrop-blur-md border-b border-white/[0.04]"
            >
              <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-9 text-[10px] text-zinc-500 font-semibold tracking-wide">
                  <div className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-green-neon/70" />
                      {settings?.store_address?.split(",")[0] ?? ""}
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-green-neon/70" />
                      {settings?.store_phone ?? ""}
                    </span>
                    <span className="hidden md:flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-green-neon/70" />
                      <a href={`mailto:${settings?.store_email ?? ""}`} className="hover:text-white transition-colors">
                        {settings?.store_email ?? ""}
                      </a>
                    </span>
                    <span className="hidden lg:flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-green-neon/70" />
                      {settings?.store_hours ?? ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-1 text-green-neon/80">
                      <Star className="h-3 w-3 fill-green-neon text-green-neon" />
                      Livraison gratuite dès {settings?.delivery_free_threshold ?? 60}€
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <a href={settings?.social_instagram} target="_blank" rel="noopener noreferrer"
                        className="text-zinc-600 hover:text-white transition-colors">
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                      <a href={settings?.social_facebook} target="_blank" rel="noopener noreferrer"
                        className="text-zinc-600 hover:text-white transition-colors">
                        <Facebook className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Header Bar ── */}
        <div className={`relative transition-all duration-300 ${isScrolled
          ? "bg-zinc-950/90 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] border-b border-white/[0.05]"
          : "bg-zinc-950/70 backdrop-blur-2xl border-b border-white/[0.03]"
          }`}>
          {/* Ambient glow line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-green-neon/30 to-transparent" />

          <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className={`flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? "h-16" : "h-20 md:h-24"
              }`}>

              {/* ── Left: Mobile Menu + Logo ── */}
              <div className="flex items-center gap-3 md:gap-4 flex-none">
                {/* Mobile Menu Button */}
                <div className="lg:hidden flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    className="p-2.5 text-zinc-400 hover:text-white bg-white/[0.04] rounded-xl border border-white/[0.08] transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isMenuOpen ? "close" : "open"}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>

                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center group relative z-[1000]" aria-label="Shop-ia — Accueil">
                    <div className="absolute -inset-6 bg-amber-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <motion.img
                      src="/logo.png"
                      alt="Shop-ia"
                      animate={{ height: isScrolled ? "2.8rem" : "3.8rem" }}
                      transition={{ duration: 0.3 }}
                      className="w-auto object-contain group-hover:glow-logo origin-left max-w-[140px]"
                    />
                  </Link>

                </div>
              </div>

              {/* ── Center: Desktop Navigation ── */}
              <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5 xl:gap-1 relative z-[1001]">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path ||
                    (link.path !== "/" && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={`${link.path}-${link.name}`}
                      to={link.path}
                      className={`relative px-3.5 py-2 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-lg group whitespace-nowrap ${isActive
                        ? "text-green-neon"
                        : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
                        }`}
                    >
                      <span className="relative z-10">{link.name}</span>
                      {isActive && (
                        <>
                          <motion.span
                            layoutId="nav-active-pill"
                            className="absolute inset-0 bg-green-neon/[0.07] rounded-lg border border-green-neon/20"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                          <motion.span
                            layoutId="nav-active-dot"
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-neon rounded-full"
                          />
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* ── Right: Actions ── */}
              <div className="flex-none flex justify-end items-center gap-1.5 md:gap-2 relative z-[1000]">

                {/* Search Button */}
                {settings.search_enabled && (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 text-zinc-500 hover:text-white transition-all duration-200 hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/[0.08]"
                    aria-label="Rechercher"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </motion.button>
                )}

                {/* Cart */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={openSidebar}
                  className="group relative p-2.5 text-zinc-500 hover:text-green-neon transition-all duration-200 hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/[0.08]"
                  aria-label="Ouvrir le panier"
                >
                  <ShoppingCart className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-green-neon text-black text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                      >
                        {itemCount > 99 ? "99+" : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Loyalty Points (Desktop) */}
                {user && profile && (
                  <Link
                    to="/compte"
                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-400/[0.07] border border-amber-400/20 rounded-full hover:border-amber-400/40 hover:bg-amber-400/10 transition-all duration-300 group"
                  >
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[7px] text-amber-400/60 uppercase font-black tracking-tighter">Points</span>
                      <span className="text-[11px] font-black text-amber-300">{profile.loyalty_points ?? 0}</span>
                    </div>
                  </Link>
                )}

                {/* Account Button */}
                {user ? (
                  <div className="relative hidden md:block">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isAccountMenuOpen
                        ? "bg-green-neon border-green-neon text-black"
                        : "bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:border-green-neon/30 hover:text-white"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] transition-colors ${isAccountMenuOpen ? "bg-black/20" : "bg-white/[0.1]"
                        }`}>
                        {profile?.full_name?.[0]?.toUpperCase() ?? <User className="h-3 w-3" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">
                        {profile?.full_name?.split(" ")[0] ?? "Profil"}
                      </span>
                      <ChevronDown className={`h-3 w-3 hidden lg:block transition-transform duration-200 ${isAccountMenuOpen ? "rotate-180" : ""
                        }`} />
                    </motion.button>

                    <AnimatePresence>
                      {isAccountMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-3 w-60 bg-zinc-900/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[1002]"
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Connecté en tant que</p>
                            <p className="text-sm font-bold text-white mt-0.5 truncate">{profile?.full_name ?? "Client"}</p>
                          </div>
                          <div className="p-2">
                            <Link to="/compte"
                              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-white/[0.05] hover:text-white rounded-xl transition-all">
                              <User className="h-4 w-4" /> Tableau de bord
                            </Link>
                            <Link to="/compte/commandes"
                              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-white/[0.05] hover:text-white rounded-xl transition-all">
                              <Clock className="h-4 w-4" /> Historique
                            </Link>
                            <button
                              onClick={() => { setIsLoyaltyModalOpen(true); setIsAccountMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-white/[0.05] hover:text-white rounded-xl transition-all"
                            >
                              <QrCode className="h-4 w-4 text-amber-400" /> Ma Carte Fidélité
                            </button>
                            {profile?.is_admin && (
                              <Link to="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-green-neon hover:bg-green-neon/10 rounded-xl transition-all">
                                <ShieldCheck className="h-4 w-4" /> Administration
                              </Link>
                            )}
                            <div className="h-px bg-white/[0.06] my-1.5 mx-2" />
                            <button
                              onClick={signOut}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                              <LogOut className="h-4 w-4" /> Déconnexion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to="/connexion"
                    className="hidden md:flex items-center gap-2.5 px-5 py-2 bg-green-neon/10 border border-green-neon/25 hover:bg-green-neon hover:text-black text-green-neon rounded-full transition-all duration-300 group font-bold text-[10px] uppercase tracking-widest"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Connexion</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-[99] bg-black/70 backdrop-blur-sm lg:hidden"
              />
              {/* Drawer */}
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 z-[100] w-[85vw] max-w-sm lg:hidden bg-zinc-950 flex flex-col overflow-hidden border-l border-white/[0.05]"
              >
                {/* Ambient glows */}
                <div className="absolute top-0 right-0 w-3/4 h-1/3 bg-green-neon/5 blur-[100px] rounded-full -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/4 bg-amber-400/5 blur-[80px] rounded-full" />

                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.05] relative z-10">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <img src="/logo.png" alt="Shop-ia" className="h-12 w-auto object-contain" />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 text-zinc-400 hover:text-white rounded-xl bg-white/[0.05] border border-white/[0.08] transition-all"
                  >
                    <X className="w-4.5 h-4.5" />
                  </motion.button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 relative z-10 space-y-1">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-black mb-4 px-3">Navigation</p>
                  {navLinks.map((link, i) => {
                    const isActive = location.pathname === link.path ||
                      (link.path !== "/" && location.pathname.startsWith(link.path));
                    return (
                      <motion.div
                        key={`${link.path}-${link.name}`}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.04, duration: 0.3 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive
                            ? "bg-green-neon/10 text-green-neon border border-green-neon/20"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                          <span className="text-base font-bold tracking-tight">{link.name}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-neon" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="px-4 pb-8 pt-4 border-t border-white/[0.05] relative z-20 space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-xl bg-green-neon/10 flex items-center justify-center text-green-neon font-black text-sm">
                          {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Bonjour</p>
                          <p className="text-sm font-bold text-white leading-tight">{profile?.full_name ?? "Client"}</p>
                        </div>
                        {profile && (
                          <div className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black text-amber-300">{profile.loyalty_points ?? 0}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Link to="/compte" onClick={() => setIsMenuOpen(false)}
                          className="flex flex-col items-center gap-1.5 p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] transition-all">
                          <User className="h-4 w-4 text-green-neon" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Profil</span>
                        </Link>
                        <button
                          onClick={() => { setIsLoyaltyModalOpen(true); setIsMenuOpen(false); }}
                          className="flex flex-col items-center gap-1.5 p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] transition-all">
                          <QrCode className="h-4 w-4 text-amber-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Carte</span>
                        </button>
                        <button
                          onClick={() => { signOut(); setIsMenuOpen(false); }}
                          className="flex flex-col items-center gap-1.5 p-3 bg-red-400/[0.04] border border-red-400/10 rounded-2xl hover:bg-red-400/10 transition-all group">
                          <LogOut className="h-4 w-4 text-red-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-red-300">Sortie</span>
                        </button>
                      </div>
                      {profile?.is_admin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-center gap-2 py-3 bg-green-neon text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                          <ShieldCheck className="h-4 w-4" /> Administration
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link to="/connexion" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-3 py-4 bg-green-neon text-black rounded-2xl text-sm font-black uppercase tracking-[0.2em] active:scale-95 transition-all">
                      <User className="h-4 w-4" /> Connexion
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Loyalty Card Modal */}
      <AnimatePresence>
        {isLoyaltyModalOpen && user && profile && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoyaltyModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md z-10"
            >
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setIsLoyaltyModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] mb-6">VOTRE CARTE FIDÉLITÉ</p>
                <LoyaltyCard
                  userId={user.id}
                  fullName={profile.full_name || 'Client'}
                  points={profile.loyalty_points}
                  referralCode={profile.referral_code}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/[0.06] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center group" aria-label="Shop-ia">
                <img
                  src="/logo.jpeg"
                  alt="Shop-ia"
                  className="h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:glow-logo"
                />
              </Link>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Votre Épicerie Intelligente. Produits frais, traçabilité garantie
                et sélection rigoureuse pour votre quotidien.
              </p>
              <div className="flex gap-3 pt-1">
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-green-neon hover:bg-white/[0.04] rounded-lg transition-all" aria-label="Instagram">
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-green-neon hover:bg-white/[0.04] rounded-lg transition-all" aria-label="Facebook">
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-serif text-base font-semibold mb-4 text-zinc-200">Navigation</h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={`${link.path}-${link.name}`}>
                    <Link
                      to={link.path}
                      className="text-zinc-500 hover:text-green-neon transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-serif text-base font-semibold mb-4 text-zinc-200">Contact</h3>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-green-neon shrink-0 mt-0.5" />
                  <span>
                    {settings.store_address.split(',')[0]}
                    <br />
                    {settings.store_address.split(',').slice(1).join(',').trim()}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-neon shrink-0" />
                  <span>{settings.store_phone}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-neon shrink-0" />
                  <a href={`mailto:${settings?.store_email ?? ""}`} className="hover:text-green-neon transition-colors">
                    {settings?.store_email ?? ""}
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-serif text-base font-semibold mb-4 text-zinc-200">Horaires</h3>
              <ul className="space-y-2.5 text-sm text-zinc-500">
                <li className="flex justify-between">
                  <span>Lundi - Samedi</span>
                  <span className="text-zinc-400">{settings.store_hours.split(' ').slice(1).join(' ')}</span>
                </li>
                <li className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-zinc-400">Fermé</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
            <p>
              &copy; {new Date().getFullYear()} Shop-ia. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="hover:text-zinc-400 transition-colors">
                Mentions Légales
              </Link>
              <Link to="/mentions-legales" className="hover:text-zinc-400 transition-colors">
                CGU
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Predictive Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xl flex items-start justify-center pt-20 px-4"
            onClick={(e) => e.target === e.currentTarget && setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-zinc-900/80 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden glassmorphism"
            >
              <div className="p-8 space-y-8">
                <div className="relative">
                  <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${isSearching ? "text-green-neon animate-pulse" : "text-zinc-500"}`} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que cherchez-vous ?"
                    className="w-full bg-white/[0.04] border border-white/5 rounded-2xl pl-16 pr-20 py-5 text-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-neon/30 transition-all font-serif italic"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Results Area */}
                <div className="min-h-[100px] max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {searchQuery.length >= 2 ? (
                    <div className="space-y-10">
                      {/* Categories */}
                      {searchResults.categories.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-white/10" />
                            Collections
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {searchResults.categories.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/catalogue?category=${cat.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="group p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-green-neon/[0.03] hover:border-green-neon/20 transition-all"
                              >
                                <p className="text-sm font-bold text-white group-hover:text-green-neon transition-colors truncate">{cat.name}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products */}
                      {searchResults.products.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-white/10" />
                            Produits Premium
                          </h3>
                          <div className="space-y-3">
                            {searchResults.products.map((prod) => (
                              <Link
                                key={prod.id}
                                to={`/catalogue/${prod.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 bg-zinc-800">
                                    <img src={prod.image_url || ""} alt={prod.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white group-hover:text-green-neon transition-colors">{prod.name}</p>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{prod.category?.name}</p>
                                        {prod.avg_rating && prod.avg_rating > 0 && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <StarRating rating={prod.avg_rating} size="sm" showCount={false} />
                                          </>
                                        )}
                                      </div>

                                      {/* Attributes: Aromas & Benefits */}
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {prod.attributes?.aromas?.slice(0, 2).map((aroma: string, i: number) => (
                                          <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">
                                            <Utensils className="w-2 h-2 text-amber-400/50 shrink-0" />
                                            <span className="truncate max-w-[60px]">{aroma}</span>
                                          </div>
                                        ))}
                                        {prod.attributes?.benefits?.slice(0, 2).map((benefit: string, i: number) => (
                                          <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-neon/[0.03] border border-green-neon/10 text-[8px] text-green-neon font-bold uppercase tracking-tighter">
                                            <Sparkles className="w-2 h-2 shrink-0" />
                                            <span className="truncate max-w-[60px]">{benefit}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-black text-white">{prod.price.toFixed(2)}€</p>
                                  {prod.original_value && prod.original_value > prod.price ? (
                                    <p className="text-[10px] text-zinc-500 line-through">{prod.original_value.toFixed(2)}€</p>
                                  ) : (
                                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Voir détail</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        !isSearching && (
                          <div className="text-center py-10">
                            <p className="text-zinc-500 text-sm italic">Aucun produit trouvé pour "{searchQuery}"</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="text-center py-10">
                      <p className="text-zinc-500 text-sm">Tapez au moins 2 caractères...</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-6">
                      <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] font-bold">Suggestions Populaires</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {["Fruits de saison", "Légumes Frais", "Épicerie Fine", "Bio", "Local"].map((term) => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:border-green-neon/30 transition-all"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-black/50 border-t border-white/5 p-4 text-[10px] text-center text-zinc-600 font-bold uppercase tracking-[0.3em]">
                Appuyez sur <span className="text-zinc-400">ESC</span> pour fermer
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}