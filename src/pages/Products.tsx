import { motion } from "motion/react";
import {
  Leaf,
  Droplet,
  Coffee,
  Info,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Zap,
  Moon,
  Wind
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function Products() {
  const productsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Product",
          "name": "Huiles CBN Full Spectrum",
          "description": "Huiles de CBN premium testées en laboratoire, pour une relaxation profonde et un meilleur sommeil."
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Product",
          "name": "Fleurs CBN Premium",
          "description": "Fleurs naturelles riches en CBN aux arômes authentiques et préservés."
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Product",
          "name": "Résines CBN",
          "description": "Résines de chanvre hautement concentrées en CBN pour une détente intense."
        }
      }
    ]
  };

  const categories = [
    {
      id: "huiles",
      title: "Huiles CBN Full Spectrum",
      subtitle: "Absorption & Précision",
      icon: <Droplet className="h-6 w-6 text-green-neon" />,
      description: "Nos huiles CBN premium sont extraites au CO2 supercritique pour préserver l'ensemble des cannabinoïdes et terpènes naturels. Idéales pour une routine du soir apaisante et un dosage précis sous la langue.",
      image: "/images/cbd-oil.png",
      tag: "Sommeil & Relaxation",
      features: [
        { icon: <Droplet className="w-4 h-4" />, text: "Action Rapide" },
        { icon: <ShieldCheck className="w-4 h-4" />, text: "Full Spectrum" },
      ],
      items: ["Huile CBN 5%", "Huile CBN 10%", "Huile CBN 20%", "Huile Sommeil Profond"],
    },
    {
      id: "fleurs",
      title: "Fleurs CBN Premium",
      subtitle: "Nature & Authenticité",
      icon: <Leaf className="h-6 w-6 text-green-neon" />,
      description: "Découvrez nos fleurs naturelles enrichies ou naturellement riches en CBN. Cultivées avec soin en Europe, elles offrent des arômes authentiques et une expérience de détente par excellence.",
      image: "/images/products-flower.png",
      tag: "Arômes Authentiques",
      features: [
        { icon: <Leaf className="w-4 h-4" />, text: "100% Naturel" },
        { icon: <Wind className="w-4 h-4" />, text: "Terpènes Préservés" },
      ],
      items: ["Amnesia CBN", "White Widow CBN", "Purple Haze CBN", "OG Kush CBN"],
    },
    {
      id: "resines",
      title: "Résines CBN Concentrées",
      subtitle: "Intensité & Tradition",
      icon: <Sparkles className="h-6 w-6 text-green-neon" />,
      description: "Pour les amateurs de textures authentiques et d'effets plus marqués. Nos résines CBN sont confectionnées selon des méthodes traditionnelles, garantissant une concentration optimale.",
      image: "/images/products-resin.png",
      tag: "Concentration Maximale",
      features: [
        { icon: <Sparkles className="w-4 h-4" />, text: "Haute Concentration" },
        { icon: <Moon className="w-4 h-4" />, text: "Détente Intense" },
      ],
      items: ["Afghan CBN", "Olive CBN", "Hash Filtré CBN", "Jaune CBN"],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden pb-32">
      <SEO
        title="Nos Produits CBN Premium : Huiles, Fleurs & Résines — Green Mood"
        description="Découvrez nos gammes de produits infusés au CBN. Fleurs, huiles et résines de haute qualité pour la relaxation, la détente musculaire et le sommeil."
        keywords="CBN, produits CBN, Huile CBN, Fleurs CBN, Résine CBN, achat CBN, CBD sommeil"
        schema={productsSchema}
      />

      {/* Hero Header - Architectural Depth */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-40 overflow-hidden px-4">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/presentation-cbd2.png"
            className="w-full h-full object-cover opacity-100 filter blur-[1px]"
            alt="N10 Mood"
          />
          {/* <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-zinc-950/40" /> */}

          {/* Animated Glows */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [-100, 100, -100]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-green-neon/10 rounded-full blur-[180px]"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-20 space-y-16">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.6em" }}
            transition={{ duration: 1.5 }}
            className="text-green-neon font-black uppercase text-xs mb-8"
          >
            L'EXCELLENCE NATURELLE DU CHANVRE.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter leading-[0.85] uppercase"
          >
            L'APOGÉE <br />
            <span className="text-green-neon italic glow-green-strong">DU CBN.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-2xl md:text-4xl text-white font-serif italic font-light leading-relaxed mb-6">
              Découvrez notre collection exclusive dédiée au Cannabinol (CBN).
            </p>
            <p className="text-lg md:text-xl text-zinc-400 font-sans font-light uppercase tracking-widest leading-relaxed">
              Des produits premium conçus pour la relaxation et le bien-être nocturne.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="pt-12"
          >
            <Link
              to="/catalogue"
              className="px-12 py-6 bg-white text-black font-black rounded-2xl hover:bg-green-neon transition-all hover:scale-110 shadow-2xl uppercase tracking-widest text-xs"
            >
              Découvrir le Catalogue
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-green-neon/40 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">DÉCOUVREZ LES COLLECTIONS</span>
        </motion.div>
      </section>

      {/* Main Collections */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-40">
          {categories.map((cat, index) => (
            <div key={cat.id} className="relative">
              {/* Background text for depth */}
              <div className={`absolute -top-20 hidden lg:block text-[150px] font-black text-white/5 select-none pointer-events-none ${index % 2 === 1 ? '-left-20' : '-right-20'}`}>
                {cat.tag.split(' ')[0]}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col lg:flex-row gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Image Content */}
                <div className="w-full lg:w-[45%]">
                  <div className="relative group perspective-1000">
                    <div className="absolute -inset-4 bg-green-neon/10 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-700 transform group-hover:scale-[1.02] group-hover:rotate-1">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-8 left-8 flex flex-col gap-2">
                        <span className="px-5 py-2 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-black tracking-widest uppercase">
                          {cat.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="w-full lg:w-[55%] space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-4 text-green-neon">
                      {cat.icon}
                      <span className="font-bold tracking-[0.2em] uppercase text-sm">{cat.subtitle}</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-serif font-black text-white">
                      {cat.title}
                    </h2>
                    <p className="text-xl text-zinc-400 leading-relaxed font-light font-sans">
                      {cat.description}
                    </p>
                  </div>

                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-4">
                    {cat.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium">
                        {feat.icon}
                        {feat.text}
                      </div>
                    ))}
                  </div>

                  {/* Gamme Preview */}
                  <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                    <h3 className="text-zinc-500 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                      <div className="w-8 h-[1px] bg-green-neon" />
                      Les incontournables
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-white group cursor-default">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-neon transition-transform group-hover:scale-150" />
                          <span className="font-medium text-sm lg:text-base group-hover:text-green-neon transition-colors">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/catalogue?category=${cat.id}`}
                    className="inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black hover:bg-green-neon transition-all group"
                  >
                    Acheter cette gamme
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Commitment Bar */}
      <section className="mt-40 py-20 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around gap-12 text-center">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-green-neon mx-auto mb-4" />, title: "Légalité", text: "Taux THC < 0.3%" },
            { icon: <Leaf className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Naturel", text: "Culture organique" },
            { icon: <Droplet className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Pureté", text: "Sans additifs" },
            { icon: <Info className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Conseil", text: "Expertise locale" },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              {item.icon}
              <p className="font-bold text-white text-lg">{item.title}</p>
              <p className="text-zinc-500 text-sm uppercase tracking-widest">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Online Experience CTA */}
      <section className="py-40 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto relative rounded-[4rem] p-12 md:p-24 overflow-hidden border border-white/10 group"
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-neon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="relative z-10 text-center space-y-10">
            <ShoppingBag className="w-16 h-16 text-green-neon mx-auto animate-bounce-slow" />
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-serif font-black text-white italic">
                L'expérience <br /> Green Mood <span className="text-green-neon not-italic font-sans">Online.</span>
              </h2>
              <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                Profitez du Click & Collect rapide à Paris ou de la livraison
                discrète partout en France. Tous nos produits sont expédiés
                dans des emballages neutres et hermétiques.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/catalogue"
                className="px-12 py-6 bg-green-neon text-black font-black rounded-2xl hover:glow-box-green transition-all transform hover:scale-105"
              >
                Explorer le Catalogue
              </Link>
              <Link
                to="/contact"
                className="px-12 py-6 bg-white/5 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                Horaires de la Boutique
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
