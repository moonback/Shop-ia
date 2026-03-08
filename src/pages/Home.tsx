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
    { value: "0,05 €/mg", label: "Prix imbattable", icon: <Zap className="w-4 h-4" /> },
    { value: "24h", label: "Livraison Paris", icon: <Truck className="w-4 h-4" /> },
    { value: "Laboratoire", label: "Tests certifiés", icon: <Microscope className="w-4 h-4" /> },
    { value: "100% Bio", label: "Naturel & Organique", icon: <Leaf className="w-4 h-4" /> },
  ];

  const homeSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Green Mood CBD",
      "url": "https://greenmood.fr",
      "logo": "https://greenmood.fr/logo.png",
      "sameAs": ["https://greenmood.fr/catalogue", "https://greenmood.fr/guides"]
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Guide CBN Premium : effets, usages et critères qualité",
      "about": ["CBN", "Cannabinoid", "Hemp", "Sleep support", "Relaxation"],
      "author": {
        "@type": "Organization",
        "name": "Équipe éditoriale Green Mood CBD"
      },
      "reviewedBy": {
        "@type": "Person",
        "name": "Conseiller produit Green Mood"
      },
      "dateModified": "2026-03-08",
      "datePublished": "2026-03-08",
      "mainEntityOfPage": "https://greenmood.fr/"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu’est-ce que le CBN ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le CBN, ou cannabinol, est un cannabinoïde issu du chanvre. Il apparaît naturellement lors de l’oxydation d’autres cannabinoïdes. Il est généralement recherché pour ses effets de relaxation et son usage dans les routines du soir. Les produits commercialisés en Europe doivent respecter les seuils légaux de THC."
          }
        },
        {
          "@type": "Question",
          "name": "Le CBN est-il légal en Europe ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La légalité dépend du pays et de la conformité du produit. En pratique, les produits CBN sont autorisés lorsqu’ils proviennent de chanvre légal, respectent les limites de THC en vigueur et disposent d’une traçabilité claire. Il est recommandé de vérifier les analyses laboratoire et la réglementation locale avant achat."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont les effets du CBN ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les effets les plus souvent recherchés concernent la relaxation, le confort du soir et un meilleur cadre d’endormissement. Les ressentis varient selon la concentration, la forme du produit et la sensibilité individuelle. Le CBN ne remplace pas un avis médical et s’inscrit dans une approche bien-être non thérapeutique."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser l’huile CBN ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L’huile CBN est souvent utilisée en sublingual : quelques gouttes sous la langue pendant 60 à 90 secondes, puis avalées. Cette méthode facilite un dosage progressif. Il est conseillé de commencer bas, d’ajuster graduellement et de privilégier une utilisation régulière le soir pour observer les effets."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://greenmood.fr/" },
        { "@type": "ListItem", "position": 2, "name": "Guide CBN Premium", "item": "https://greenmood.fr/#guide-cbn-premium" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Huile CBN Full Spectrum",
      "brand": { "@type": "Brand", "name": "Green Mood CBD" },
      "description": "Huile CBN premium full spectrum orientée relaxation et routine sommeil, issue de chanvre européen et analysée en laboratoire.",
      "review": {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Client vérifié" },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "Produit conforme à la description, arôme agréable et utilisation simple en routine du soir."
      }
    }
  ];

  const categories = [
    { name: "Fleurs", slug: "fleurs", img: "/images/products-flower.png", count: "18 varietés" },
    { name: "Huiles", slug: "huiles", img: "/images/cbd-oil.png", count: "8 concentrés" },
    { name: "Résines", slug: "resines", img: "/images/products-resin.png", count: "12 textures" },
    { name: "Cosmétiques", slug: "cosmetiques", img: "/images/lifestyle-relax.png", count: "6 produits" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white overflow-hidden">
      <SEO
        title="CBN Premium Naturel | L'expérience ultime par N10"
        description="Découvrez le CBN (cannabinol) de haute qualité. Une solution naturelle pour améliorer le sommeil, réduire le stress et favoriser la détente."
        keywords="CBN, huile CBN, fleur CBN, cannabinoïde naturel, sommeil naturel, relaxation naturelle, bien-être chanvre, CBN premium"
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
            <span className="inline-block py-1.5 px-4 rounded-full border border-green-neon/30 bg-green-neon/10 text-green-neon text-[11px] font-bold tracking-[0.4em] mb-8 uppercase backdrop-blur-sm">
              Révolution Bien-être
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter leading-none mb-10">
              L'EXPÉRIENCE ULTIME <br />
              <span className="text-green-neon italic glow-green filter hue-rotate-[15deg] brightness-125">DU CBN PREMIUM NATUREL.</span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Découvrez le CBN (cannabinol) de haute qualité, extrait de chanvre biologique et testé en laboratoire.
              <span className="text-white font-semibold block mt-4 text-2xl">Une solution naturelle pour améliorer le sommeil, réduire le stress et favoriser la détente.</span>
            </p>

            <div className="flex flex-col items-center gap-10 justify-center mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-left border border-white/10 bg-black/20 p-6 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Extraction naturelle</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Tests en laboratoire certifiés</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Livraison rapide 24/48h</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300 text-lg font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-neon flex-shrink-0" />
                  <span>Qualité premium garantie</span>
                </div>
              </div>

              <Link
                to="/catalogue"
                className="group relative px-12 py-5 bg-green-neon text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(57,255,20,0.6)] active:scale-95"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  Découvrir nos produits CBN <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                <div className="w-12 h-12 bg-green-neon/20 rounded-2xl flex items-center justify-center text-green-neon">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Innovation</p>
                  <p className="text-white font-bold text-lg">Lab-Certified</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-green-neon font-bold tracking-[0.3em] text-[11px] uppercase">L'excellence moléculaire</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white">
                Pourquoi choisir <br />
                <span className="text-green-neon italic">le CBN ?</span>
              </h2>
              <p className="text-zinc-400 text-lg font-light leading-relaxed mt-4 mb-2">
                Le CBN (cannabinol) est un cannabinoïde naturel issu du chanvre reconnu pour ses effets relaxants. Contrairement au THC, il ne provoque aucun effet psychoactif. Nos produits sont fabriqués à partir de chanvre cultivé en Europe et analysés par des laboratoires indépendants.
              </p>
            </div>

            <div className="space-y-8 mt-6">
              {[
                {
                  t: "Favoriser un sommeil réparateur",
                  d: "Le CBN est reconnu pour ses propriétés apaisantes, aidant à trouver le sommeil naturellement et à profiter de nuits plus reposantes."
                },
                {
                  t: "Réduire le stress et l'anxiété",
                  d: "Une solution douce et naturelle pour relâcher la pression quotidienne et retrouver une sensation de calme intérieur."
                },
                {
                  t: "Améliorer la détente musculaire",
                  d: "Particulièrement apprécié après l'effort ou une longue journée pour soulager les tensions et soutenir le bien-être général."
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
                Les essentiels <span className="text-green-neon italic">du CBN</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
                Explorez notre sélection complète de produits à base de CBN : chaque produit est conçu pour offrir qualité, pureté et efficacité optimale.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-6 text-zinc-300">
                <div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-green-neon" /> Fleurs CBN – relaxation naturelle</div>
                <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-neon" /> Huiles CBN full spectrum</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-neon" /> Résines CBN – concentration élevée</div>
                <div className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-green-neon" /> Compléments – soutien quotidien</div>
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
                <span className="text-green-neon italic font-light">naturel au quotidien.</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
                Prendre soin de soi est essentiel. Les cannabinoïdes naturels comme le CBN offrent une alternative douce pour retrouver équilibre et sérénité. Intégrez facilement le CBN dans votre routine.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  title: "Améliorer votre sommeil",
                  desc: "Retrouvez des nuits paisibles et réparatrices grâce aux propriétés relaxantes du CBN."
                },
                {
                  title: "Réduire les tensions",
                  desc: "Soulagez le stress accumulé et favorisez un relâchement musculaire optimal."
                },
                {
                  title: "Favoriser la relaxation",
                  desc: "Soutenez votre équilibre naturel et profitez de moments de calme tout au long de la journée."
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
              alt="Lifestyle CBD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-neon/20 to-transparent mix-blend-overlay" />
          </motion.div>
        </div>
      </section>

      {/* ────────── BudTender CTA : Conseil sur-mesure ────────── */}
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
                  <span className="text-green-neon italic">personnalisés ?</span>
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto lg:mx-0">
                  Vous ne savez pas quel produit choisir ? Notre équipe vous accompagne pour trouver le produit CBN le plus adapté à vos besoins : sommeil, détente ou bien-être quotidien. Obtenez des recommandations personnalisées.
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
                <img src="/images/cbd-oil.png" alt="Nouveau produit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-1 space-y-6">
                <span className="inline-block px-4 py-1.5 bg-green-neon text-black text-[10px] font-bold uppercase tracking-widest rounded-full">Nouveau</span>
                <h3 className="text-3xl md:text-5xl font-serif font-bold text-white">L'huile N10 Full Spectrum</h3>
                <p className="text-xl text-zinc-400 font-light">Découvrez notre dernière innovation pour un bien-être optimal au quotidien.</p>
                <div className="pt-4 flex items-center gap-3 text-green-neon font-bold uppercase tracking-[0.2em] text-xs">
                  Explorer l'innovation <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ────────── Ultra SEO Content ────────── */}
      <section id="guide-cbn-premium" className="hidden md:block py-24 md:py-32 px-5">
        <article className="max-w-5xl mx-auto">
          <header className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 md:p-12 mb-10">
            <p className="text-green-neon uppercase tracking-[0.2em] text-xs font-bold mb-4">Guide CBN premium</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">L’expérience ultime du CBN premium naturel</h2>
            <p className="text-zinc-200 leading-relaxed text-lg">
              <strong className="text-white">Définition :</strong> Le CBN est un cannabinoïde naturel issu du chanvre, souvent utilisé dans les routines bien-être orientées relaxation et sommeil.
              Il ne provoque pas d’effet psychoactif comparable au THC et s’intègre à des formats variés comme les huiles, fleurs ou résines selon le besoin de l’utilisateur.
            </p>
          </header>

          <aside className="rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8 mb-10">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">Key Takeaways</h3>
            <ul className="space-y-2 text-zinc-300 list-disc pl-5">
              <li>Le CBN est principalement recherché pour la relaxation du soir et le soutien d’une routine sommeil.</li>
              <li>La qualité dépend de la culture du chanvre, des analyses laboratoire et de la traçabilité.</li>
              <li>Les formats les plus utilisés sont les huiles CBN, les fleurs CBN et les résines CBN.</li>
              <li>La lisibilité des informations produit améliore la compréhension par Google et les moteurs IA.</li>
            </ul>
          </aside>

          <div className="space-y-10 text-zinc-300 leading-relaxed">
            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Le CBN : un cannabinoïde naturel aux nombreux bienfaits</h3>
              <p>
                Le CBN (cannabinol) est un cannabinoïde naturellement présent dans la plante de chanvre. Il se forme lorsque le THC se dégrade avec le temps et l’exposition à l’oxygène. Aujourd’hui, le CBN
                suscite un intérêt croissant dans le domaine du bien-être naturel.
              </p>
              <p>Les utilisateurs apprécient particulièrement ses propriétés associées à la relaxation, à l’amélioration du sommeil, à la réduction du stress et au soutien du bien-être général.</p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Pourquoi choisir des produits CBN premium</h3>
              <p>
                Tous les produits CBN ne se valent pas. La qualité dépend de nombreux facteurs : culture du chanvre, méthode d’extraction, pureté des cannabinoïdes, stabilité des terpènes et rigueur des tests en
                laboratoire.
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-zinc-200">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Issus de chanvre cultivé en Europe</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Testés en laboratoire indépendant</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Extraction moderne et préservation des profils actifs</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-green-neon" /> Sans pesticides ni solvants nocifs</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Les bienfaits potentiels du CBN pour le bien-être</h3>
              <p>
                Le CBN est souvent associé à une sensation de détente profonde. De nombreux utilisateurs l’intègrent dans leur routine quotidienne pour améliorer leur qualité de vie, en particulier le soir ou lors
                de périodes de stress.
              </p>
              <div className="space-y-3">
                <p><strong className="text-white">Favoriser un sommeil réparateur :</strong> le CBN est populaire pour son lien avec la relaxation et l’endormissement progressif.</p>
                <p><strong className="text-white">Réduire le stress :</strong> les cannabinoïdes comme le CBN sont parfois utilisés pour créer un moment de calme et de décompression.</p>
                <p><strong className="text-white">Soutenir la récupération :</strong> après une journée intense ou une séance de sport, certains profils utilisateurs recherchent ses effets de détente musculaire.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Nos catégories de produits CBN</h3>
              <p>
                Notre collection a été conçue pour s’adapter à tous les profils : utilisateurs débutants, consommateurs expérimentés et personnes à la recherche d’une routine bien-être naturelle basée sur des
                produits premium.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Fleurs CBN</h4>
                  <p>Une expérience naturelle, un profil de terpènes riche et une concentration intéressante en cannabinoïdes.</p>
                </div>
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Huiles CBN</h4>
                  <p>Un usage simple, un dosage précis et une formule full spectrum pour profiter de l’effet d’entourage.</p>
                </div>
                <div className="border border-white/10 rounded-2xl p-5 bg-zinc-900/50">
                  <h4 className="text-xl font-bold text-white mb-2">Résines CBN</h4>
                  <p>Une concentration plus élevée, une texture travaillée et un profil aromatique intense.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Comment choisir le bon produit CBN</h3>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong className="text-white">Pour le sommeil :</strong> privilégiez l’huile CBN en routine du soir pour un dosage maîtrisé.</li>
                <li><strong className="text-white">Pour l’authenticité :</strong> les fleurs CBN offrent une expérience naturelle et aromatique.</li>
                <li><strong className="text-white">Pour une intensité plus élevée :</strong> les résines CBN sont souvent choisies par les profils expérimentés.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Comparatif rapide des formats CBN</h3>
              <div className="overflow-x-auto border border-white/10 rounded-2xl">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-zinc-900 text-white">
                    <tr>
                      <th className="text-left p-4">Format</th>
                      <th className="text-left p-4">Usage principal</th>
                      <th className="text-left p-4">Niveau de contrôle du dosage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-zinc-300">
                    <tr><td className="p-4">Huile CBN</td><td className="p-4">Routine soir / sommeil</td><td className="p-4">Élevé</td></tr>
                    <tr><td className="p-4">Fleurs CBN</td><td className="p-4">Expérience aromatique</td><td className="p-4">Moyen</td></tr>
                    <tr><td className="p-4">Résines CBN</td><td className="p-4">Recherche de concentration</td><td className="p-4">Moyen à élevé</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Guide étape par étape : intégrer le CBN</h3>
              <ol className="space-y-2 list-decimal pl-5">
                <li>Définir l’objectif prioritaire : relaxation, sommeil ou récupération après effort.</li>
                <li>Choisir le format adapté : huile, fleur ou résine selon vos préférences d’usage.</li>
                <li>Commencer par un dosage modéré, puis ajuster progressivement sur plusieurs jours.</li>
                <li>Conserver une routine régulière et suivre vos ressentis pour optimiser la constance.</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Entités clés et ressources internes</h3>
              <p>
                Entités couvertes : <strong className="text-white">CBN</strong>, <strong className="text-white">cannabinoïde</strong>, <strong className="text-white">chanvre</strong>,
                <strong className="text-white"> soutien du sommeil</strong> et <strong className="text-white">relaxation</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/guides/guide-cbd-sommeil" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Guide sommeil</Link>
                <Link to="/guides/guide-dosage-cbd" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Guide dosage</Link>
                <Link to="/guides/guide-cbd-anxiete" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Guide relaxation</Link>
                <Link to="/catalogue?category=huiles" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-green-neon/40">Huiles CBN</Link>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Qualité contrôlée, production responsable, expérience client premium</h3>
              <p>
                La transparence est au cœur de notre approche. Nos analyses en laboratoire vérifient la concentration en cannabinoïdes, l’absence de pesticides et de métaux lourds, ainsi que la conformité légale.
                Notre chanvre est cultivé selon des pratiques responsables afin de préserver la biodiversité et les ressources naturelles.
              </p>
              <p>
                Dans un marché CBN en pleine expansion, notre boutique se distingue par trois piliers : qualité, transparence et satisfaction client. Vous bénéficiez d’un service réactif, d’une livraison rapide et
                discrète, et d’une sélection rigoureuse de produits premium.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">FAQ rapide sur le CBN</h3>
              <div className="space-y-3">
                <p><strong className="text-white">Qu’est-ce que le CBN ?</strong> Le CBN (cannabinol) est un cannabinoïde naturellement présent dans le chanvre. Il résulte notamment de l’oxydation d’autres cannabinoïdes au fil du temps. Il est surtout associé à la détente du soir et à la création d’un contexte favorable au repos. Son usage reste bien-être et non médical.</p>
                <p><strong className="text-white">Le CBN est-il légal en Europe ?</strong> La conformité dépend de la réglementation de chaque pays et du respect des seuils de THC imposés par la loi. Un produit CBN fiable doit présenter des analyses de laboratoire, une origine chanvre claire et des informations transparentes sur sa composition pour sécuriser l’achat.</p>
                <p><strong className="text-white">Quels effets du CBN sont le plus souvent recherchés ?</strong> Les utilisateurs mentionnent principalement la relaxation, la réduction de la charge mentale en fin de journée et le soutien d’une routine sommeil. Les effets varient selon la concentration, la forme choisie et la sensibilité individuelle. Commencer progressivement reste la pratique recommandée.</p>
                <p><strong className="text-white">Comment utiliser l’huile CBN ?</strong> L’usage le plus courant est sublingual : déposer quelques gouttes sous la langue, attendre environ une minute, puis avaler. Cette méthode facilite un dosage précis. Pour une évaluation plus fiable, il est conseillé de garder une routine régulière et d’ajuster progressivement.</p>
              </div>
            </section>

            <section className="space-y-4 border border-white/10 rounded-3xl p-6 md:p-8 bg-zinc-900/40">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Crédibilité éditoriale</h3>
              <p><strong className="text-white">Rédigé par :</strong> Équipe éditoriale Green Mood CBD</p>
              <p><strong className="text-white">Relu par :</strong> Conseiller produit spécialisé cannabinoïdes</p>
              <p><strong className="text-white">Dernière mise à jour :</strong> 08 mars 2026</p>
              <h4 className="text-lg font-semibold text-white pt-2">Références</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Analyses laboratoires indépendantes par lot produit.</li>
                <li>Réglementation chanvre et THC applicable au marché européen.</li>
                <li>Documentation interne qualité, traçabilité et conformité.</li>
              </ul>
            </section>

            <section className="space-y-4 border border-green-neon/20 rounded-3xl p-6 md:p-8 bg-green-neon/[0.03]">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Ressentez la différence du CBN premium</h3>
              <p>
                Le bien-être commence par des produits de qualité. Que vous recherchiez une meilleure qualité de sommeil, un moment de détente ou un soutien au bien-être quotidien, notre collection CBN premium
                vous accompagne avec des produits fiables, testés et sélectionnés avec soin.
              </p>
              <p className="text-zinc-200">✔ Qualité premium • ✔ Chanvre européen • ✔ Tests en laboratoire • ✔ Livraison rapide et discrète</p>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-green-neon text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Découvrir nos produits CBN
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
            RESSENTEZ LA DIFFÉRENCE <br />
            <span className="text-green-neon italic glow-green">DU CBN PREMIUM.</span>
          </h2>
          <p className="text-zinc-300 text-xl md:text-2xl max-w-2xl mx-auto font-light mb-12">
            Des produits naturels, testés en laboratoire et conçus pour votre bien-être.
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
