import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Flame,
  Tag,
  TrendingUp,
  Heart,
  Package,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import FAQ from "../components/FAQ";
import SEO from "../components/SEO";
import ReviewCarousel from "../components/ReviewCarousel";
import BestSellers from "../components/BestSellers";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { Category } from "../lib/types";

// ─── Hero Slides ────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: "/images/N10.png",
    badge: "Nouveauté",
    headline: "VOTRE PANIER",
    highlight: "INTELLIGENT & FRAIS.",
    sub: "Des produits du terroir livrés directement chez vous.",
    cta: "Faire mes courses",
    ctaLink: "/catalogue",
    accent: "amber",
  },
  {
    image: "/images/quality-hero-bg.png",
    badge: "Sélection Elite",
    headline: "QUALITÉ",
    highlight: "CERTIFIÉE.",
    sub: "Une sélection rigoureuse d'épicerie fine et de saveurs d'exception.",
    cta: "Voir les Elite",
    ctaLink: "/catalogue?featured=1",
    accent: "green",
  },
  {
    image: "/images/lifestyle-relax.png",
    badge: "Abonnements",
    headline: "COMMANDEZ",
    highlight: "& ÉCONOMISEZ.",
    sub: "Abonnez-vous à vos produits préférés et profitez de prix réduits.",
    cta: "Découvrir les abonnements",
    ctaLink: "/catalogue?subscribable=1",
    accent: "purple",
  },
];

// ─── Trust badges ────────────────────────────────────────────────────
const TRUST = [
  { icon: <Truck className="w-5 h-5" />, label: "Livraison 24h", sub: "Paris & région" },
  { icon: <ShieldCheck className="w-5 h-5" />, label: "Qualité Certifiée", sub: "Sélection rigoureuse" },
  { icon: <RefreshCw className="w-5 h-5" />, label: "Abonnements", sub: "Flexibles & économiques" },
  { icon: <Star className="w-5 h-5" />, label: "Top Avis", sub: "4.8/5 clients satisfaits" },
];

// ─── Category Quick Links ─────────────────────────────────────────────
const CAT_LINKS = [
  {
    name: "Épicerie Salée",
    slug: "epicerie-salee",
    img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600",
    emoji: "🧂",
  },
  {
    name: "Épicerie Sucrée",
    slug: "epicerie-sucree",
    img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600",
    emoji: "🍰",
  },
  {
    name: "Boissons",
    slug: "boissons",
    img: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600",
    emoji: "☕",
  },
  {
    name: "Produits Frais",
    slug: "produits-frais",
    img: "https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=600",
    emoji: "🥦",
  },
  {
    name: "Coffrets",
    slug: "coffrets",
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600",
    emoji: "🎁",
  },
  {
    name: "Bio & Nature",
    slug: "bio",
    img: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600",
    emoji: "🌿",
  },
];

// ─── Promo banners ────────────────────────────────────────────────────
const PROMO_BANNERS = [
  {
    tag: "🔥 Offre Limitée",
    title: "Meilleures Ventes",
    desc: "Nos produits les plus populaires sélectionnés pour vous",
    link: "/catalogue?featured=1",
    bg: "from-amber-900/60 to-zinc-900",
    accent: "text-amber-400",
    border: "border-amber-500/20",
  },
  {
    tag: "⭐ Avis 4.8/5",
    title: "Les Mieux Notés",
    desc: "Choix plébiscités par notre communauté de gourmets",
    link: "/catalogue?sort=rating",
    bg: "from-green-900/40 to-zinc-900",
    accent: "text-green-400",
    border: "border-green-500/20",
  },
  {
    tag: "🆕 Nouveautés",
    title: "Arrivages Récents",
    desc: "Les derniers produits ajoutés à notre catalogue",
    link: "/catalogue?sort=newest",
    bg: "from-blue-900/40 to-zinc-900",
    accent: "text-blue-400",
    border: "border-blue-500/20",
  },
];

export default function Home() {
  const settings = useSettingsStore((s) => s.settings);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [heroIndex, setHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance hero slider
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => { if (heroTimer.current) clearInterval(heroTimer.current); };
  }, []);

  // Load real categories
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => { if (data) setDbCategories(data as Category[]); });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const slide = HERO_SLIDES[heroIndex];
  const allCategories = dbCategories.length > 0 ? dbCategories : [];

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Shop-ia",
      url: "https://shop-ia.fr",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <SEO
        title="Shop-ia | Votre Épicerie Intelligente & Produits Frais"
        description="Découvrez Shop-ia, votre épicerie en ligne de qualité. Produits frais, épicerie fine et livraison rapide."
        keywords="épicerie, alimentation saine, produits frais, bio, courses en ligne"
        schema={homeSchemas}
      />

      <main>

        {/* ════════════════════════════════════════
            HERO — style full-width slider
        ════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] md:min-h-[90vh] flex flex-col items-center justify-center pt-16 md:pt-20 overflow-hidden px-4 sm:px-5">
          {/* Background image with crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 z-0"
            >
              <img
                src={slide.image}
                alt={slide.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/60 to-zinc-950" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-20 w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${heroIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-5"
              >
                <span className={`inline-block py-1.5 px-4 md:px-5 rounded-full border text-[10px] md:text-[11px] font-bold tracking-[0.25em] md:tracking-[0.4em] uppercase backdrop-blur-sm
                  ${slide.accent === "amber" ? "border-amber-400/30 bg-amber-400/10 text-amber-400" :
                    slide.accent === "green" ? "border-green-neon/30 bg-green-neon/10 text-green-neon" :
                      "border-purple-400/30 bg-purple-400/10 text-purple-400"}`}
                >
                  {slide.badge}
                </span>

                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight md:tracking-tighter leading-[0.95] text-white">
                  {slide.headline}
                  <br />
                  <span className={`italic ${slide.accent === "amber" ? "text-amber-400" : slide.accent === "green" ? "text-green-neon" : "text-purple-400"}`}>
                    {slide.highlight}
                  </span>
                </h1>

                <p className="text-zinc-300 text-sm sm:text-base md:text-xl max-w-2xl mx-auto font-light px-2 sm:px-0">
                  {slide.sub}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Amazon-style prominent search bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
              <div className="flex flex-col sm:flex-row sm:items-center bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-transparent focus-within:border-amber-400 transition-all">
                <Search className="absolute left-4 top-3.5 sm:left-5 sm:top-1/2 sm:-translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une catégorie…"
                  className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-400 pl-11 sm:pl-14 pr-4 py-3.5 sm:py-4 text-sm sm:text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 sm:px-6 py-3.5 sm:py-4 transition-colors text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-widest whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
                >
                  Rechercher
                </button>
              </div>
            </form>

            {/* Quick category pills */}
            <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
              {["Coffrets", "Huiles & Vinaigres", "Épices", "Cafés & Thés", "Fromages"].map((q) => (
                <button
                  key={q}
                  onClick={() => navigate(`/catalogue?search=${encodeURIComponent(q)}`)}
                  className="px-3.5 sm:px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] sm:text-xs text-white hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* CTA button */}
            <Link
              to={slide.ctaLink}
              className={`group relative px-7 sm:px-10 py-3.5 sm:py-4 font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-widest
                ${slide.accent === "amber"
                  ? "bg-amber-400 text-black hover:shadow-[0_0_40px_rgba(251,191,36,0.6)]"
                  : slide.accent === "green"
                    ? "bg-green-neon text-black hover:shadow-[0_0_40px_rgba(57,255,20,0.5)]"
                    : "bg-purple-500 text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"}`}
            >
              <span className="flex items-center gap-2">
                {slide.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Slider controls */}
          <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-6">
            <button
              onClick={() => setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`rounded-full transition-all ${i === heroIndex ? "w-8 h-2 bg-amber-400" : "w-2 h-2 bg-white/30"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════
            TRUST BAR — Icon strip like Amazon
        ════════════════════════════════════════ */}
        <div className="bg-zinc-900 border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
              {TRUST.map((t, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">{t.label}</p>
                    <p className="text-xs text-zinc-500">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            QUICK LINKS — Amazon departments bar
        ════════════════════════════════════════ */}
        <div className="bg-zinc-950 border-b border-white/[0.05] sticky top-16 z-30 backdrop-blur-xl shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 sm:py-3 hide-scrollbar">
              {[
                { label: "Toute la boutique", link: "/catalogue", icon: <Package className="w-4 h-4" /> },
                { label: "Meilleures ventes", link: "/catalogue?featured=1", icon: <Flame className="w-4 h-4 text-orange-500" /> },
                { label: "Nouveautés", link: "/catalogue?sort=newest", icon: <Clock className="w-4 h-4 text-blue-400" /> },
                { label: "Mieux notés", link: "/catalogue?sort=rating", icon: <Star className="w-4 h-4 text-yellow-500" /> },
                { label: "Abonnements", link: "/catalogue?subscribable=1", icon: <RefreshCw className="w-4 h-4 text-green-400" /> },
                { label: "Promos", link: "/catalogue?sort=price_asc", icon: <Tag className="w-4 h-4 text-purple-400" /> },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.link}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            3-UP PROMO BANNERS
        ════════════════════════════════════════ */}
        <section className="py-8 md:py-10 px-4 sm:px-5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {PROMO_BANNERS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={b.link}
                  className={`group relative flex flex-col gap-2.5 sm:gap-3 p-5 sm:p-6 rounded-2xl border bg-gradient-to-br ${b.bg} ${b.border} overflow-hidden hover:border-white/20 transition-all`}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
                  <span className="text-sm font-bold">{b.tag}</span>
                  <h3 className={`text-xl sm:text-2xl font-serif font-bold text-white ${b.accent}`}>{b.title}</h3>
                  <p className="text-sm text-zinc-400">{b.desc}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest mt-2 ${b.accent}`}>
                    Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SHOP BY CATEGORY — Amazon-style grid
        ════════════════════════════════════════ */}
        <section className="py-10 md:py-12 px-4 sm:px-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Nos Rayons</h2>
                <p className="text-zinc-500 text-sm mt-1">Naviguez par catégorie</p>
              </div>
              <Link to="/catalogue" className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Dynamic from DB, fallback to static */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {(allCategories.length > 0 ? allCategories : CAT_LINKS.slice(0, 6)).map((cat: any, i) => (
                <motion.div
                  key={cat.id || cat.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/catalogue?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/[0.06] bg-zinc-900/40 hover:border-amber-400/30 hover:bg-zinc-900 transition-all"
                  >
                    {cat.image_url ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden">
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center text-2xl sm:text-3xl">
                        {CAT_LINKS.find(c => c.slug === cat.slug)?.emoji || "🛒"}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-300 text-center group-hover:text-white leading-tight">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
              {/* Always show "Tout voir" at end */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                <Link
                  to="/catalogue"
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-dashed border-white/10 bg-transparent hover:border-amber-400/30 transition-all"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500 text-center group-hover:text-amber-400">Tout voir</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            BEST SELLERS — from component
        ════════════════════════════════════════ */}
        {settings.home_best_sellers_enabled && <BestSellers />}

        {/* ════════════════════════════════════════
            FEATURE STRIP — Why Shop-ia (Amazon-style feature boxes)
        ════════════════════════════════════════ */}
        <section className="py-16 px-5 bg-zinc-900/30 border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">Pourquoi choisir Shop-ia ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  title: "Sélection Rigoureuse",
                  desc: "Chaque produit est goûté et approuvé par nos experts avant d'entrer dans notre catalogue.",
                  color: "text-amber-400",
                  bg: "bg-amber-400/10",
                },
                {
                  icon: <Truck className="w-6 h-6" />,
                  title: "Livraison 24h",
                  desc: "Vos produits frais livrés le lendemain, en respectant scrupuleusement la chaîne du froid.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                },
                {
                  icon: <Heart className="w-6 h-6" />,
                  title: "Local & Éthique",
                  desc: "En direct des producteurs de votre région. Connaissez l'origine de chaque produit.",
                  color: "text-green-neon",
                  bg: "bg-green-neon/10",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "IA au service du goût",
                  desc: "Shopia, notre assistant IA, vous guide vers les meilleurs produits selon vos envies.",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col gap-5 p-6 rounded-2xl bg-zinc-900 border border-white/[0.06] hover:border-white/10 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SHOPIA IA CTA (if logged in)
        ════════════════════════════════════════ */}
        {user && (
          <section className="py-16 px-5">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-r from-green-neon/10 via-zinc-900 to-purple-500/10 border border-green-neon/20 rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center gap-8"
              >
                <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

                <div className="hidden md:flex w-24 h-24 rounded-full bg-green-neon/10 border border-green-neon/30 items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-12 h-12 text-green-neon" />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-neon/10 text-green-neon text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> Conseil IA Personnalisé
                  </span>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3">
                    Besoin d'un conseil ?<br />
                    <span className="text-green-neon italic">Shopia est là pour vous.</span>
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base max-w-lg">
                    Notre assistant IA vous recommande les meilleurs produits selon vos envies, votre budget et vos préférences nutritionnelles.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const btn = document.querySelector('[aria-label="Toggle Shopia Assistant"]') as HTMLButtonElement;
                    if (btn) btn.click();
                  }}
                  className="flex-shrink-0 px-8 py-4 bg-green-neon text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-xl text-sm uppercase tracking-widest"
                >
                  Démarrer la consultation
                </button>
              </motion.div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════
            LARGE CATEGORY SHOWCASE (2 feature cards)
        ════════════════════════════════════════ */}
        <section className="py-12 px-5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Épicerie Fine & Terroir",
                desc: "Découvrez nos sélections de spécialités culinaires d'exception.",
                link: "/catalogue?category=epicerie-salee",
                img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=900",
                accent: "amber",
              },
              {
                title: "Coffrets & Cadeaux",
                desc: "Offrez du goût avec nos coffrets thématiques soigneusement composés.",
                link: "/catalogue?featured=1",
                img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900",
                accent: "green",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link
                  to={item.link}
                  className="group relative block overflow-hidden rounded-3xl border border-white/[0.06] aspect-[16/9] hover:border-white/20 transition-all"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-8">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-zinc-300 text-sm mb-4">{item.desc}</p>
                    <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${item.accent === "amber" ? "text-amber-400" : "text-green-neon"}`}>
                      Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            REVIEWS
        ════════════════════════════════════════ */}
        {settings.home_reviews_enabled && <ReviewCarousel />}

        {/* ════════════════════════════════════════
            TRUST CHECKLIST — Simplified guarantees
        ════════════════════════════════════════ */}
        <section className="py-12 md:py-16 px-4 sm:px-5 bg-zinc-900/20 border-y border-white/[0.05]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-6 md:mb-8">Nos garanties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {[
                "Paiement sécurisé 100%",
                "Livraison fraîcheur garantie",
                "Retours simplifiés sous 14j",
                "Support client 7j/7",
              ].map((g, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-neon" />
                  <span className="text-sm text-zinc-300 font-medium text-center">{g}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FAQ
        ════════════════════════════════════════ */}
        <FAQ />

        {/* ════════════════════════════════════════
            FINAL CTA — Simplified
        ════════════════════════════════════════ */}
        <section className="py-16 md:py-32 text-center px-4 sm:px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08)_0%,transparent_70%)] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 space-y-8 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white tracking-tight md:tracking-tighter leading-[0.95] uppercase">
              REDÉCOUVREZ LE GOÛT
              <br />
              <span className="text-amber-400 italic">AVEC SHOP-IA.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-xl font-light">
              Des produits frais, sélectionnés pour vous et livrés à votre porte.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-3 px-7 sm:px-12 py-3.5 sm:py-5 bg-amber-400 text-black font-bold rounded-full text-sm sm:text-lg hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Accéder à la boutique <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
