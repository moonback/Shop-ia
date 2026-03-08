import { motion } from "motion/react";
import {
  Utensils,
  Droplet,
  Coffee,
  Info,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Zap,
  Egg,
  Cookie
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
          "name": "Épicerie Salée Fine",
          "description": "Une sélection d'huiles d'olive extra vierge, épices rares et bases culinaires pour vos plats."
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Product",
          "name": "Épicerie Sucrée Artisanale",
          "description": "Biscuits, miels et chocolats fins issus des meilleurs terroirs de France."
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Product",
          "name": "Produits Frais de Saison",
          "description": "Légumes, fromages et crémerie livrés en direct des producteurs locaux."
        }
      }
    ]
  };

  const categories = [
    {
      id: "epicerie-salee",
      title: "Épicerie Salée Fine",
      subtitle: "Saveurs & Terroirs",
      icon: <Utensils className="h-6 w-6 text-green-neon" />,
      description: "Notre sélection culinaire est sourcée auprès d'artisans passionnés. Des huiles d'olive de Provence aux épices lointaines, chaque produit est choisi pour son excellence gustative et sa traçabilité exemplaire.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
      tag: "Cuisine & Gastronomie",
      features: [
        { icon: <Droplet className="w-4 h-4" />, text: "Extra Vierge" },
        { icon: <ShieldCheck className="w-4 h-4" />, text: "AOP / IGP" },
      ],
      items: ["Huile d'Olive Bio", "Pâtes Artisanales", "Sels & Poivres Rares", "Sauces Maison"],
    },
    {
      id: "epicerie-sucree",
      title: "Douceurs Artisanales",
      subtitle: "Gourmandise & Tradition",
      icon: <Cookie className="h-6 w-6 text-green-neon" />,
      description: "Succombez à notre gamme sucrée : miels de montagne, chocolats grands crus et biscuits pur beurre. Une célébration du savoir-faire pâtissier français pour vos moments de douceur.",
      image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800",
      tag: "Plaisirs Sucrés",
      features: [
        { icon: <Cookie className="w-4 h-4" />, text: "Beau & Bon" },
        { icon: <Sparkles className="w-4 h-4" />, text: "Artisanal" },
      ],
      items: ["Chocolat Noir 70%", "Miel de Lavande", "Biscuits de Provence", "Confiseries Fins"],
    },
    {
      id: "produits-frais",
      title: "Produits Frais & Fermiers",
      subtitle: "Fraîcheur & Proximité",
      icon: <Egg className="h-6 w-6 text-green-neon" />,
      description: "Directement issus des fermes partenaires, nos produits frais garantissent une qualité nutritionnelle et un goût incomparable. Fromages affinés, œufs bio et fruits de saison sélectionnés pour vous.",
      image: "https://images.unsplash.com/photo-1546487813-f931b2691761?w=800",
      tag: "Direct Producteur",
      features: [
        { icon: <Egg className="w-4 h-4" />, text: "100% Frais" },
        { icon: <Zap className="w-4 h-4" />, text: "Circuit Court" },
      ],
      items: ["Fromage de Chèvre", "Yaourts Bio", "Beurre de Baratte", "Corbeille du Maraîcher"],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden pb-32">
      <SEO
        title="Nos Produits Frais & Épicerie Fine — Shop-ia"
        description="Découvrez nos gammes de produits alimentaires d'exception. Frais, épicerie fine et spécialités locales pour une cuisine saine et gourmande."
        keywords="épicerie fine, produits frais, bio, gastronomie Paris, alimentation saine"
        schema={productsSchema}
      />

      {/* Hero Header - Architectural Depth */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-40 overflow-hidden px-4">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"
            className="w-full h-full object-cover opacity-30 filter blur-[2px]"
            alt="Gastronomie Shop-ia"
          />

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
            L'EXCELLENCE CULINAIRE À VOTRE PORTE.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter leading-[0.85] uppercase"
          >
            L'APOGÉE <br />
            <span className="text-green-neon italic glow-green-strong">DES SAVEURS.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-2xl md:text-4xl text-white font-serif italic font-light leading-relaxed mb-6">
              Découvrez notre collection exclusive d'épicerie fine et produits frais.
            </p>
            <p className="text-lg md:text-xl text-zinc-400 font-sans font-light uppercase tracking-widest leading-relaxed">
              Une sélection rigoureuse pour une cuisine saine, éthique et résolument gourmande.
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
            { icon: <ShieldCheck className="w-8 h-8 text-green-neon mx-auto mb-4" />, title: "Qualité", text: "Sélection rigoureuse" },
            { icon: <Utensils className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Naturel", text: "Agriculture Bio/Durable" },
            { icon: <Zap className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Traçabilité", text: "Direct Producteur" },
            { icon: <Info className="h-8 w-8 text-green-neon mx-auto mb-4" />, title: "Conseil", text: "Assistant Culinaire IA" },
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
                L'expérience <br /> Shop-ia <span className="text-green-neon not-italic font-sans">Online.</span>
              </h2>
              <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                Profitez du Click & Collect rapide à Paris ou de la livraison
                fraîcheur partout en France. Tous nos produits sont expédiés
                dans des emballages isothermes et protecteurs.
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
