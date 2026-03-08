import { motion, useMotionValue, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  ShieldCheck,
  Leaf,
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
  Microscope,
  Info
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
    { value: "Artisanal", label: "Produits sélectionnés", icon: <Leaf className="w-4 h-4" /> },
    { value: "24h", label: "Livraison Paris", icon: <Truck className="w-4 h-4" /> },
    { value: "Circuits Courts", label: "Producteurs locaux", icon: <ShieldCheck className="w-4 h-4" /> },
    { value: "100% Naturel", label: "Sans additifs", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Shop-ia",
      "url": "https://shop-ia.fr",
      "logo": "https://shop-ia.fr/logo.png",
      "sameAs": ["https://shop-ia.fr/catalogue", "https://shop-ia.fr/guides"]
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Épicerie Fine Shop-ia : qualité, traçabilité et saveurs authentiques",
      "about": ["Épicerie fine", "Alimentation", "Circuits courts", "Artisanal", "Bio"],
      "author": {
        "@type": "Organization",
        "name": "Équipe éditoriale Shop-ia"
      },
      "reviewedBy": {
        "@type": "Person",
        "name": "Conseiller culinaire Shop-ia"
      },
      "dateModified": "2026-03-08",
      "datePublished": "2026-03-08",
      "mainEntityOfPage": "https://shop-ia.fr/"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu’est-ce que Shop-ia ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Shop-ia est une épicerie fine en ligne proposant des produits alimentaires de qualité : épicerie salée et sucrée, boissons artisanales, conserves et condiments. Nous sélectionnons rigoureusement des producteurs locaux et artisanaux en France et en Europe."
          }
        },
        {
          "@type": "Question",
          "name": "D’où viennent vos produits ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nos produits proviennent majoritairement de France et d’Europe, sélectionnés directement auprès de producteurs artisanaux. Nous privilégions les circuits courts, les méthodes traditionnelles et la transparence sur les origines."
          }
        },
        {
          "@type": "Question",
          "name": "Quels types de produits trouvez-vous sur Shop-ia ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Shop-ia propose trois gammes principales : l’épicerie salée (pâtes artisanales, huiles, condiments), l’épicerie sucrée (confitures, miels, chocolats, biscuits) et les boissons (thés, cafés, jus de fruits et sirops artisanaux)."
          }
        },
        {
          "@type": "Question",
          "name": "Comment est assurée la qualité des produits ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Chaque produit est sélectionné selon des critères stricts : méthodes de production artisanales, ingrédients naturels sans additifs, traçabilité complète de la source au consommateur et contrôles qualité réguliers."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://shop-ia.fr/" },
        { "@type": "ListItem", "position": 2, "name": "Catalogue", "item": "https://shop-ia.fr/catalogue" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Miel de Lavande de Provence",
      "brand": { "@type": "Brand", "name": "Shop-ia" },
      "description": "Miel de lavande pure récolté en Provence, goût floral délicat et texture crémeuse. Produit artisanal sans additifs.",
      "review": {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Client vérifié" },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Saveur exceptionnelle, parfum de lavande authentique. Un vrai produit artisanal comme on n’en trouve plus."
      }
    }
  ];

  const categories = [
    { name: "Épicerie Salée", slug: "epicerie-salee", img: "/images/hero-bg.png", count: "Pâtes, huiles, condiments" },
    { name: "Épicerie Sucrée", slug: "epicerie-sucree", img: "/images/hero-bg.png", count: "Confitures, miels, chocolats" },
    { name: "Boissons", slug: "boissons", img: "/images/hero-bg.png", count: "Thés, cafés, jus" },
    { name: "Paniers Gourmands", slug: "bundles", img: "/images/hero-bg.png", count: "Coffrets cadeaux" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <SEO
        title="Shop-ia | Épicerie Fine & Produits Alimentaires Artisanaux"
        description="Découvrez Shop-ia, votre épicerie fine en ligne. Produits alimentaires artisanaux, circuits courts, épicerie salée et sucrée, boissons sélectionnées avec soin."
        keywords="épicerie fine, produits artisanaux, alimentation naturelle, circuits courts, épicerie en ligne, shop-ia"
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
            src="/images/hero-bg.png"
            className="w-full h-full object-cover opacity-100 scale-105"
            alt="Shop-ia Épicerie Fine"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto text-center px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full border border-green-neon/30 bg-green-neon/10 text-green-neon text-[11px] font-bold tracking-[0.4em] mb-8 uppercase backdrop-blur-sm">
              Épicerie Fine Artisanale
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter leading-none mb-10">
              SAVEURS PURES, <br />
              <span className="text-green-neon italic glow-green filter hue-rotate-[15deg] brightness-125">QUALITÉ AUTHENTIQUE.</span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Découvrez une sélection rigoureuse de produits alimentaires artisanaux, issus de producteurs locaux et de circuits courts.
              <span className="text-white font-semibold block mt-4 text-2xl">Épicerie salée, sucrée, boissons — le meilleur de la gastronomie française livrée chez vous.</span>
            </p>

            <div className="flex flex-col items-center gap-10 justify-center mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-left border border-white/10 bg-black/20 p-6 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Producteurs artisanaux sélectionnés</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Traçabilité origine garantie</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Livraison rapide 24/48h</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Sans additifs ni conservateurs</span>
                </div>
              </div>

              <Link
                to="/catalogue"
                className="group relative px-12 py-5 bg-green-neon text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] active:scale-95"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  Découvrir nos produits <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-green-neon 
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

      {/* ────────── Pourquoi Shop-ia ────────── */}
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
                src="/images/hero-bg.png"
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                alt="Sélection artisanale Shop-ia"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-xl group-hover:border-green-neon/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-neon/20 rounded-2xl flex items-center justify-center text-green-neon">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Qualité</p>
                  <p className="text-white font-bold text-lg">Certifiée Artisanal</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-green-neon font-bold tracking-[0.3em] text-[11px] uppercase">L'excellence alimentaire</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white">
                Pourquoi choisir <br />
                <span className="text-green-neon italic">Shop-ia ?</span>
              </h2>
              <p className="text-zinc-400 text-lg font-light leading-relaxed mt-4 mb-2">
                Shop-ia sélectionne rigoureusement chaque produit auprès de producteurs artisanaux et de circuits courts. Nos critères : méthodes traditionnelles, ingrédients naturels et traçabilité complète de la source au consommateur.
              </p>
            </div>

            <div className="space-y-8 mt-6">
              {[
                {
                  t: "Produits artisanaux sélectionnés",
                  d: "Chaque produit est choisi directement auprès de producteurs locaux ou régionaux, garantissant authenticité et savoir-faire traditionnel."
                },
                {
                  t: "Circuits courts & traçabilité",
                  d: "Nous travaillons en direct avec les producteurs pour une transparence totale sur les origines et les méthodes de fabrication."
                },
                {
                  t: "Sans additifs ni conservateurs",
                  d: "Nos produits sont naturels, sans additifs chimiques. La qualité des ingrédients est notre priorité absolue."
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
                      <Leaf className="w-6 h-6" />
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
                Nos catégories <span className="text-green-neon italic">gourmandes</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
                Explorez notre sélection complète de produits alimentaires : épicerie fine salée et sucrée, boissons artisanales et paniers cadeaux.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-6 text-zinc-300">
                <div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-green-neon" /> Épicerie salée – pâtes, huiles, condiments</div>
                <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-neon" /> Épicerie sucrée – confitures, miels, chocolats</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-neon" /> Boissons – thés, cafés, jus artisanaux</div>
                <div className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-green-neon" /> Paniers gourmands – coffrets cadeaux</div>
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
              <span className="text-green-neon font-bold tracking-[0.3em] text-[11px] uppercase">L'art de bien manger</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
                Saveurs authentiques <br />
                <span className="text-green-neon italic font-light">au quotidien.</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
                Bien manger est essentiel. Les produits artisanaux et naturels offrent une alternative savoureuse aux produits industriels. Redécouvrez le goût des vraies saveurs avec Shop-ia.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  title: "Saveurs authentiques",
                  desc: "Des produits fabriqués selon des recettes traditionnelles, sans compromis sur la qualité des ingrédients."
                },
                {
                  title: "Producteurs engagés",
                  desc: "Nous soutenons des artisans et producteurs locaux qui perpétuent des savoir-faire ancestraux."
                },
                {
                  title: "Qualité à prix juste",
                  desc: "Accédez à des produits d'exception sans intermédiaires, directement des producteurs à votre table."
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
              src="/images/hero-bg.png"
              alt="Épicerie fine Shop-ia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-neon/20 to-transparent mix-blend-overlay" />
          </motion.div>
        </div>
      </section>

      {/* ────────── Assistant Culinaire CTA : Conseil sur-mesure ────────── */}
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
                  Vous ne savez pas quoi choisir ? Notre assistant culinaire vous accompagne pour trouver les produits les plus adaptés à vos envies : recettes, accords mets, découvertes gastronomiques. Obtenez des recommandations personnalisées.
                </p>
                <div className="pt-4 flex flex-wrap gap-5 justify-center lg:justify-start">
                  <button
                    onClick={() => {
                      const btn = document.querySelector('[aria-label="Toggle BudTender"]') as HTMLButtonElement;
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
                <img src="/images/hero-bg.png" alt="Nouveau produit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-1 space-y-6">
                <span className="inline-block px-4 py-1.5 bg-green-neon text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Nouveau</span>
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-white">Le Café d'Éthiopie Single Origin</h3>
                <p className="text-xl text-zinc-400 font-light">Découvrez notre dernière sélection pour un éveil des sens optimal au quotidien.</p>
                <div className="pt-4 flex items-center gap-3 text-green-neon font-bold uppercase tracking-[0.2em] text-xs">
                  Explorer la sélection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ────────── Ultra SEO Content ────────── */}
      <section id="guide-epicerie-fine" className="hidden md:block py-24 md:py-32 px-5">
        <article className="max-w-5xl mx-auto">
          <header className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 md:p-12 mb-10">
            <p className="text-green-neon uppercase tracking-[0.2em] text-xs font-bold mb-4">Guide épicerie fine</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">L’excellence de l’épicerie fine artisanale</h2>
            <p className="text-zinc-200 leading-relaxed text-lg">
              <strong className="text-white">Notre mission :</strong> Shop-ia sélectionne rigoureusement des produits alimentaires artisanaux issus de producteurs locaux et de circuits courts.
              Chaque produit est choisi pour ses qualités gustatives, sa traçabilité et ses méthodes de fabrication respectueuses.
            </p>
          </header>

          <aside className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8 mb-10">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">En un coup d’œil</h3>
            <ul className="space-y-2 text-zinc-300 list-disc pl-5">
              <li>Produits artisanaux sélectionnés directement auprès de producteurs locaux.</li>
              <li>Traçabilité complète de la source au consommateur, pour chaque produit.</li>
              <li>Trois catégories : épicerie salée, épicerie sucrée et boissons artisanales.</li>
              <li>Livraison rapide 24/48h en France métropolitaine.</li>
            </ul>
          </aside>

          <div className="space-y-10 text-zinc-300 leading-relaxed">
            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Shop-ia : une épicerie fine différente</h3>
              <p>
                Shop-ia est née d’une conviction simple : les meilleurs produits alimentaires viennent de producteurs passionnés qui perpétuent des savoir-faire ancestraux. Notre sélection couvre l’épicerie salée, sucrée et les boissons artisanales.
              </p>
              <p>Nos clients apprécient la qualité des saveurs, l’authenticité des recettes et la transparence sur les origines de chaque produit.</p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Notre processus de sélection</h3>
              <p>
                Tous les produits ne se valent pas. Notre sélection repose sur des critères stricts : méthodes de production artisanales, ingrédients naturels sans additifs, goût et saveurs, et traçabilité complète.
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-zinc-200">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Produits issus de producteurs artisanaux vérifiés</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Méthodes traditionnelles de fabrication</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Ingrédients naturels, sans additifs chimiques</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Traçabilité complète de la source à la livraison</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Nos catégories alimentaires</h3>
              <p>
                Notre catalogue est organisé en trois gammes complémentaires, pour couvrir tous vos besoins alimentaires de qualité.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Épicerie Salée</h4>
                  <p>Pâtes artisanales, huiles d’olive, condiments, sel de mer et spécialités salées de France et d’Europe.</p>
                </div>
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Épicerie Sucrée</h4>
                  <p>Confitures artisanales, miels de terroir, chocolats fins, biscuits et douceurs régionales.</p>
                </div>
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Boissons</h4>
                  <p>Thés premium, cafés single origin, jus de fruits artisanaux et sirops naturels.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Comment choisir vos produits</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong className="text-white">Pour un repas :</strong> explorez notre épicerie salée avec pâtes artisanales et huiles sélectionnées.</li>
                <li><strong className="text-white">Pour un cadeau gourmand :</strong> nos paniers gourmands combinent les meilleures spécialités.</li>
                <li><strong className="text-white">Pour le petit-déjeuner :</strong> miels, confitures et boissons artisanales pour bien commencer la journée.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Comparatif de nos gammes</h3>
              <div className="overflow-x-auto border border-white/10 rounded-2xl">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-zinc-900 text-white">
                    <tr>
                      <th className="text-left p-4">Catégorie</th>
                      <th className="text-left p-4">Usage principal</th>
                      <th className="text-left p-4">Idéal pour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-zinc-300">
                    <tr><td className="p-4">Épicerie Salée</td><td className="p-4">Cuisine du quotidien</td><td className="p-4">Repas en famille</td></tr>
                    <tr><td className="p-4">Épicerie Sucrée</td><td className="p-4">Petit-déjeuner & desserts</td><td className="p-4">Cadeaux gourmands</td></tr>
                    <tr><td className="p-4">Boissons</td><td className="p-4">Moments de détente</td><td className="p-4">Tous les moments</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Guide : bien choisir ses produits artisanaux</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>Identifier votre besoin : quotidien, cadeau, découverte ou repas spécial.</li>
                <li>Consulter les fiches produits pour les détails d’origine et de fabrication.</li>
                <li>Découvrir les accords de saveurs suggérés par notre assistant culinaire.</li>
                <li>Profiter de nos paniers gourmands pour combiner plusieurs spécialités.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Ressources et guides culinaires</h3>
              <p>
                Découvrez nos guides culinaires pour maîtriser l’art de l’épicerie fine : accords mets, conseils de conservation, recettes et idées de présentation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/guides" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Guides culinaires</Link>
                <Link to="/catalogue?category=epicerie-salee" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Épicerie salée</Link>
                <Link to="/catalogue?category=epicerie-sucree" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Épicerie sucrée</Link>
                <Link to="/catalogue?category=boissons" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Boissons</Link>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Qualité, traçabilité, satisfaction garantie</h3>
              <p>
                La transparence est au cœur de notre démarche. Chaque fiche produit détaille l’origine, le producteur, les ingrédients et les méthodes de fabrication. Nous travaillons en direct avec les producteurs pour garantir la fraîcheur et l’authenticité.
              </p>
              <p>
                Shop-ia se distingue par trois piliers : sélection rigoureuse, traçabilité totale et satisfaction client. Vous bénéficiez d’un service réactif, d’une livraison rapide et d’une sélection soigneusement actualisée selon les saisons.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">FAQ épicerie fine</h3>
              <div className="space-y-3">
                <p><strong className="text-white">Qu’est-ce que Shop-ia ?</strong> Shop-ia est une épicerie fine en ligne proposant des produits alimentaires artisanaux sélectionnés auprès de producteurs locaux. Épicerie salée, sucrée, boissons et paniers gourmands — tout est choisi pour sa qualité et son authenticité.</p>
                <p><strong className="text-white">D’où viennent vos produits ?</strong> Nos produits viennent principalement de France et d’Europe. Nous travaillons directement avec des artisans et producteurs qui perpétuent des savoir-faire traditionnels. La traçabilité est assurée de la source à la livraison.</p>
                <p><strong className="text-white">Comment sont sélectionnés les produits ?</strong> Chaque produit est évalué selon des critères stricts : méthodes artisanales, ingrédients naturels, goût, présentation et traçabilité. Seuls les meilleurs rejoignent notre catalogue.</p>
                <p><strong className="text-white">Livrez-vous en France entière ?</strong> Oui, Shop-ia livre en France métropolitaine. La livraison est offerte dès 50€ d’achat. Nous utilisons des emballages adaptés pour préserver la qualité des produits pendant le transport.</p>
              </div>
            </section>

            <section className="space-y-4 border border-white/10 rounded-3xl p-6 md:p-8 bg-zinc-900/40">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Crédibilité éditoriale</h3>
              <p><strong className="text-white">Rédigé par :</strong> Équipe éditoriale Shop-ia</p>
              <p><strong className="text-white">Relu par :</strong> Conseiller culinaire et expert épicerie fine</p>
              <p><strong className="text-white">Dernière mise à jour :</strong> 08 mars 2026</p>
              <h4 className="text-lg font-semibold text-white pt-2">Références</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cahier des charges producteurs et artisans partenaires.</li>
                <li>Certifications bio et labels qualité applicables aux produits alimentaires.</li>
                <li>Documentation interne qualité, traçabilité et sélection produits.</li>
              </ul>
            </section>

            <section className="space-y-4 border border-green-neon/20 rounded-3xl p-6 md:p-8 bg-green-neon/[0.03]">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Goûtez la différence de l’artisanal</h3>
              <p>
                Le plaisir commence par des produits de qualité. Que vous recherchiez de nouvelles saveurs, des ingrédients d’exception ou des cadeaux gourmands, notre sélection alimentaire vous accompagne avec des produits fiables, authentiques et choisis avec soin.
              </p>
              <p className="text-zinc-200">✔ Qualité artisanale • ✔ Circuits courts • ✔ Traçabilité garantie • ✔ Livraison rapide</p>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-green-neon text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Découvrir nos produits
                <ArrowRight className="w-5 h-5" />
              </Link>
            </section>
          </div>
        </article>
      </section>

      {/* ────────── FAQ ────────── */}
      <FAQ />

      {/* ────────── Final CTA ────────── */}
      <section className="py-32 md:py-48 text-center px-5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-green-neon/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-green-neon/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-neon/10 blur-[160px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 space-y-12"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tighter leading-none uppercase mb-6">
            GOÛTEZ LA DIFFÉRENCE <br />
            <span className="text-green-neon italic glow-green">DE L'ARTISANAL.</span>
          </h2>
          <p className="text-zinc-300 text-xl md:text-2xl max-w-2xl mx-auto font-light mb-12">
            Des produits alimentaires authentiques, sélectionnés avec soin pour votre plaisir.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-4 px-12 py-6 bg-green-neon text-black font-bold rounded-full text-xl hover:shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            Accédez à la boutique
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>
      </main>

    </div>
  );
}
