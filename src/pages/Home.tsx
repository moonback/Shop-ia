import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  ShieldCheck,
  ShoppingBag,
  HeartHandshake,
  ArrowRight,
  Star,
  Package,
  Clock,
  Truck,
  Sparkles,
  Search,
  MessageCircle,
  CheckCircle2,
  Zap,
  Utensils,
  Info,
  Apple,
  Cookie,
  Coffee,
  Egg
} from "lucide-react";
import FAQ from "../components/FAQ";
import SEO from "../components/SEO";
import ReviewCarousel from "../components/ReviewCarousel";
import BestSellers from "../components/BestSellers";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const settings = useSettingsStore((s) => s.settings);
  const { user } = useAuthStore();

  // Mouse follow effect for Hero glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const stats = [
    { value: "Direct", label: "Producteurs locaux", icon: <ShoppingBag className="w-4 h-4" /> },
    { value: "24h", label: "Livraison Fraîcheur", icon: <Truck className="w-4 h-4" /> },
    { value: "Sélect", label: "Qualité Goût", icon: <Utensils className="w-4 h-4" /> },
    { value: "100% Frais", label: "Produits de saison", icon: <Apple className="w-4 h-4" /> },
  ];

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Shop-ia",
      "url": "https://shop-ia.fr",
      "logo": "https://shop-ia.fr/logo.png",
      "sameAs": ["https://shop-ia.fr/catalogue", "https://shop-ia.fr/services"]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment fonctionne la livraison Shop-ia ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nous livrons vos produits frais en moins de 24h à Paris et en région parisienne, en respectant scrupuleusement la chaîne du froid."
          }
        },
        {
          "@type": "Question",
          "name": "D'où proviennent vos produits ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nous travaillons en direct avec des producteurs locaux et des artisans sélectionnés pour leur savoir-faire et la qualité de leurs produits."
          }
        }
      ]
    }
  ];

  const categories = [
    { name: "Épicerie Salée", slug: "epicerie-salee", img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800", count: "45 produits" },
    { name: "Épicerie Sucrée", slug: "epicerie-sucree", img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800", count: "32 délices" },
    { name: "Boissons", slug: "boissons", img: "https://images.unsplash.com/photo-1510626176961-4b57d4fbadf3?w=800", count: "24 références" },
    { name: "Produits Frais", slug: "produits-frais", img: "https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=800", count: "15 arrivages" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <SEO
        title="Shop-ia | Votre Épicerie Intelligente & Produits Frais"
        description="Découvrez Shop-ia, votre nouvelle destination pour l'alimentation de qualité. Produits frais, épicerie fine et livraison rapide."
        keywords="épicerie, alimentation saine, produits frais, bio, courses en ligne, shop-ia"
        schema={homeSchemas}
      />

      <main>
        {/* ────────── Hero Section ────────── */}
        <section className="relative min-h-[95vh] flex items-center justify-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* Floating Mouse-Following Glow */}
          <motion.div
            style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
            className="absolute z-0 w-[500px] h-[500px] bg-green-neon/10 rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-screen"
          />

          {/* Static Background Glows */}
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-neon/10 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{ y: [0, 20, 0], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-neon/5 rounded-full blur-[120px] pointer-events-none"
          />

          <div className="absolute inset-0 z-0">
            <img
              src="/images/N10.png"
              className="w-full h-full object-cover opacity-100 scale-105"
              alt="N10 Experience"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
          </div>

          <div className="relative z-20 max-w-6xl mx-auto text-center px-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block py-1.5 px-4 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[11px] font-bold tracking-[0.4em] mb-8 uppercase backdrop-blur-sm">
                L'Épicerie du Futur
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter leading-none mb-10 text-white">
                VOTRE PANIER <br />
                <span className="text-amber-400 italic glow-green">INTELLIGENT & FRAIS.</span>
              </h1>
              <p className="text-zinc-300 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-8">
                Découvrez une sélection rigoureuse de produits issus de nos terroirs, livrés directement chez vous.
                <span className="text-white font-semibold block mt-4 text-2xl">La qualité artisanale alliée à la simplicité du numérique.</span>
              </p>

              <div className="flex flex-col items-center gap-10 justify-center mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-left border border-white/10 bg-black/20 p-6 rounded-3xl backdrop-blur-md">
                  <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                    <span>Sourcing local & éthique</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                    <span>Fraîcheur garantie 24h</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                    <span>Qualité nutritive certifiée</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                    <span>Emballages éco-responsables</span>
                  </div>
                </div>

                <Link
                  to="/catalogue"
                  className="group relative px-12 py-5 bg-amber-400 text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] active:scale-95"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2 text-lg">
                    Faire mes courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ────────── Atouts : Trust Bar ────────── */}
        <div className="relative z-30 border-y border-white/[0.05] bg-zinc-950/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">

            <h3 className="text-center text-zinc-500 uppercase tracking-[0.35em] text-[11px] font-semibold mb-14">
              Nos atouts en un coup d'œil
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center text-center gap-4 transition-all duration-300"
                >

                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 
          transition-all duration-300 group-hover:bg-white/[0.08] group-hover:scale-105">
                    {s.icon}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-2xl md:text-3xl font-bold text-white block tracking-tight">
                      {s.value}
                    </span>

                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">
                      {s.label}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ────────── Top Ventes ────────── */}
        {settings.home_best_sellers_enabled && <BestSellers />}

        {/* ────────── N10 Deep Dive : Pourquoi choisir ────────── */}
        <section className="py-24 md:py-32 px-5">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-neon/10 blur-[100px] rounded-full" />
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="/images/solution-hero-bg.png"
                  className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  alt="Technologie N10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-xl group-hover:border-green-neon/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Sélection</p>
                    <p className="text-white font-bold text-lg">Qualité Certifiée</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-amber-400 font-bold tracking-[0.3em] text-[11px] uppercase">L'excellence du goût</span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white">
                  Pourquoi choisir <br />
                  <span className="text-amber-400 italic">Shop-ia ?</span>
                </h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed mt-4 mb-2">
                  Shop-ia redéfinit vos courses quotidiennes en combinant technologie et artisanat. Nous sélectionnons le meilleur de chaque terroir pour vous garantir fraîcheur et saveur.
                </p>
              </div>

              <div className="space-y-8 mt-6">
                {[
                  {
                    t: "Savourer l'authenticité",
                    d: "Des produits sélectionnés pour leur goût véritable, loin des standards industriels, pour une expérience gustative intense."
                  },
                  {
                    t: "Optimiser votre nutrition",
                    d: "Une approche axée sur la qualité nutritionnelle pour soutenir votre vitalité et votre santé au quotidien."
                  },
                  {
                    t: "Soutenir le local",
                    d: "En choisissant Shop-ia, vous participez directement au maintien de l'agriculture de proximité et des savoir-faire artisanaux."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex gap-6 p-6 rounded-3xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-green-neon group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white text-xl font-bold mb-2">{item.t}</h4>
                      <p className="text-zinc-400 leading-relaxed font-light">{item.d}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────── Nos Essentiels ────────── */}
        <section className="py-24 md:py-32 bg-zinc-900/20 px-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                  Les essentiels <span className="text-green-neon italic">du Terroir</span>
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
                  Explorez notre sélection complète de produits d'exception : chaque produit est choisi pour offrir qualité, goût et apports nutritionnels optimaux.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-6 text-zinc-300">
                  <div className="flex items-center gap-2"><Utensils className="w-5 h-5 text-amber-400" /> Produits du terroir</div>
                  <div className="flex items-center gap-2"><Apple className="w-5 h-5 text-amber-400" /> Fruits & Légumes de saison</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Traçabilité garantie</div>
                  <div className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-amber-400" /> Direct producteur</div>
                </div>
              </div>
              <Link to="/catalogue" className="group inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 px-8 py-4 rounded-2xl text-white font-semibold hover:bg-green-neon hover:text-black transition-all">
                Boutique <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/catalogue?category=${cat.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/[0.05] hover:border-green-neon/30 transition-all shadow-2xl"
                  >
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                    <div className="absolute bottom-0 inset-x-0 p-8">
                      <p className="text-green-neon text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{cat.count}</p>
                      <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">{cat.name}</h3>
                    </div>
                    <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0 group-hover:bg-green-neon group-hover:border-green-neon">
                      <ArrowRight className="w-5 h-5 text-white group-hover:text-black" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── Brand Values : Le bien-être ────────── */}
        <section className="py-24 md:py-32 px-5">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 space-y-12">
              <div className="space-y-6">
                <span className="text-green-neon font-bold tracking-[0.3em] text-[11px] uppercase">L'art de vivre N10</span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                  Le bien-être <br />
                  <span className="text-green-neon italic font-light">par l'assiette.</span>
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
                  Prendre soin de soi commence par ce que l'on mange. Les produits naturels et frais offrent une solution durable pour retrouver équilibre et vitalité. Intégrez facilement le meilleur de la nature dans votre quotidien.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    title: "Équilibrer vos repas",
                    desc: "Retrouvez de l'énergie et de la légèreté grâce aux apports nutritionnels de nos produits frais."
                  },
                  {
                    title: "Redécouvrir les saveurs",
                    desc: "Éveillez vos sens avec des produits cueillis à maturité et préparés avec passion."
                  },
                  {
                    title: "Soutenir votre santé",
                    desc: "Soutenez votre système immunitaire et profitez d'une alimentation saine tout au long de l'année."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-neon/10 border border-green-neon/30 flex items-center justify-center shrink-0 group-hover:bg-green-neon transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-neon group-hover:text-black" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-white font-bold text-lg">{item.title}</p>
                      <p className="text-zinc-500 font-light">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <img
                src="/images/lifestyle-relax.png"
                alt="Gastronomie Shop-ia"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-green-neon/20 to-transparent mix-blend-overlay" />
            </motion.div>
          </div>
        </section>

        {/* ────────── Shopia Assistant IA CTA : Conseil sur-mesure ────────── */}
        {user && (
          <section className="py-24 md:py-32 px-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto bg-zinc-900 border border-white/[0.05] rounded-[3rem] p-8 md:p-20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-green-neon/5 blur-[120px] rounded-full translate-x-1/2" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-neon/10 text-green-neon font-bold text-[10px] uppercase tracking-[0.2em]">
                    <Sparkles className="w-4 h-4" />
                    Conseil personnalisé
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                    Besoin de conseils <br />
                    <span className="text-green-neon italic">culinaires ?</span>
                  </h2>
                  <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto lg:mx-0">
                    Vous ne savez pas quel produit choisir ? Notre équipe vous accompagne pour trouver les ingrédients les plus adaptés à vos envies : recettes, équilibre ou gourmandise. Obtenez des recommandations personnalisées.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-5 justify-center lg:justify-start">
                    <button
                      onClick={() => {
                        const btn = document.querySelector('[aria-label="Toggle Shopia Assistant"]') as HTMLButtonElement;
                        if (btn) btn.click();
                      }}
                      className="bg-green-neon text-black px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
                    >
                      Démarrer la consultation
                    </button>
                  </div>
                </div>

                <div className="hidden lg:flex w-64 h-64 relative shrink-0">
                  <div className="absolute inset-0 bg-green-neon opacity-20 blur-[60px] animate-pulse" />
                  <div className="relative w-full h-full bg-zinc-800 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] rounded-full border border-green-neon/20 animate-[spin_15s_linear_infinite]" />
                    <MessageCircle className="absolute w-20 h-20 text-green-neon" />
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ────────── Testimonials & Reviews ────────── */}
        {settings.home_reviews_enabled && <ReviewCarousel />}

        {/* ────────── Latest News ────────── */}
        <section className="py-24 md:py-32 px-5 bg-zinc-900/10 border-y border-white/[0.05]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-px bg-green-neon/40" />
              <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-white">Dernières actualités</h2>
            </div>

            <Link to="/catalogue" className="group block p-8 md:p-12 rounded-[2.5rem] border border-white/5 bg-zinc-900/50 hover:border-green-neon/30 transition-all relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800" alt="Nouveau produit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 space-y-6">
                  <span className="inline-block px-4 py-1.5 bg-green-neon text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Nouveau</span>
                  <h3 className="text-3xl md:text-5xl font-serif font-bold text-white">L'huile d'olive Shop-ia</h3>
                  <p className="text-xl text-zinc-400 font-light">Découvrez notre dernière sélection d'huile extra-vierge pour sublimer vos plats au quotidien.</p>
                  <div className="pt-4 flex items-center gap-3 text-green-neon font-bold uppercase tracking-[0.2em] text-xs">
                    Explorer l'innovation <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ────────── Ultra SEO Content ────────── */}
        <section id="guide-shop-ia" className="hidden md:block py-24 md:py-32 px-5">
          <article className="max-w-5xl mx-auto">
            <header className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 md:p-12 mb-10">
              <p className="text-amber-400 uppercase tracking-[0.2em] text-xs font-bold mb-4">L'excellence alimentaire</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Mieux manger avec Shop-ia</h2>
              <p className="text-zinc-200 leading-relaxed text-lg">
                <strong className="text-white">Notre mission :</strong> Simplifier votre accès à une alimentation de qualité. Nous sélectionnons des produits frais, locaux et artisanaux pour vous offrir le meilleur du goût au quotidien.
              </p>
            </header>

            <div className="space-y-10 text-zinc-300 leading-relaxed">
              <section className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Une sélection rigoureuse pour votre quotidien</h3>
                <p>
                  Chez Shop-ia, nous croyons que la qualité de ce que nous mangeons définit notre bien-être. C'est pourquoi chaque référence de notre catalogue est goûtée et approuvée par nos experts.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Pourquoi nous faire confiance ?</h3>
                <ul className="grid md:grid-cols-2 gap-3 text-zinc-200">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-amber-400" /> Direct producteurs partenaires</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-amber-400" /> Fraîcheur garantie et contrôlée</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-amber-400" /> Traçabilité totale de l'origine</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-amber-400" /> Livraison éco-responsable</li>
                </ul>
              </section>
            </div>
          </article>
        </section>

        {/* ────────── FAQ ────────── */}
        <FAQ />

        {/* ────────── Final CTA ────────── */}
        <section className="py-32 md:py-48 text-center px-5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-400/10 blur-[160px] rounded-full pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 space-y-12"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tighter leading-none uppercase mb-6">
              REDÉCOUVREZ LE GOÛT <br />
              <span className="text-amber-400 italic glow-green">AVEC SHOP-IA.</span>
            </h2>
            <p className="text-zinc-300 text-xl md:text-2xl max-w-2xl mx-auto font-light mb-12">
              Des produits frais, sélectionnés pour vous et livrés à votre porte.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-4 px-12 py-6 bg-amber-400 text-black font-bold rounded-full text-xl hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Accéder à la boutique
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </section>
      </main>

    </div>
  );
}
