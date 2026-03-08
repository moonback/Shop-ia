import { motion } from "motion/react";
import { ShieldCheck, FileText, CheckCircle, Search, Beaker, Globe, Lock, Microscope, Utensils } from "lucide-react";
import SEO from "../components/SEO";

export default function Quality() {
  const qualitySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Qualité, Fraîcheur & Engagement - Shop-ia",
    "description": "Découvrez nos standards de qualité pour vos produits alimentaires. Fraîcheur garantie, circuits courts et sélection rigoureuse."
  };

  const certificates = [
    { title: "Fraîcheur 24h", icon: ShieldCheck, detail: "Livraison de produits récoltés ou préparés moins de 24h avant l'envoi." },
    { title: "Standard Bio-Éthique", icon: Lock, detail: "Priorité aux produits certifiés Agriculture Biologique et respectueux de l'environnement." },
    { title: "Circuits Courts", icon: Globe, detail: "Réduction des intermédiaires pour une meilleure rémunération des producteurs." },
    { title: "Hygiène & Sécurité", icon: Utensils, detail: "Respect strict des normes HACCP et de la chaîne du froid." },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SEO
        title="Qualité & Engagement — L'Excellence Shop-ia"
        description="Votre santé est notre priorité. Nos produits alimentaires sont sélectionnés selon des critères rigoureux de fraîcheur et d'origine."
        keywords="qualité alimentaire, produits frais, circuits courts, bio, shop-ia, traçabilité"
        schema={qualitySchema}
      />

      {/* Hero Header */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden">
        {/* L'image de fond doit avoir une opacité contrôlée pour laisser ressortir le texte */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"
            alt="Produits Frais Shop-ia"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-green-neon/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-black uppercase tracking-widest mb-8"
          >
            <Utensils className="w-4 h-4" />
            Standard de Qualité Shop-ia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tighter leading-none mb-8"
          >
            L'EXCELLENCE <br />
            <span className="text-amber-400 italic glow-green">DU GOÛT.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Chez Shop-ia, nous sélectionnons le meilleur de nos terroirs pour vous garantir une expérience gustative exceptionnelle.
          </motion.p>
        </div>
      </section>

      {/* Main Pillars Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certificates.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-neon/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-neon/20 transition-all duration-500">
                <cert.icon className="w-7 h-7 text-green-neon" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-3">{cert.title}</h3>
              <p className="text-sm text-zinc-500 font-light leading-relaxed">
                {cert.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content Deep Dive */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-40">

          {/* Legal Compliance Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-black">Sélection <br /> <span className="text-amber-400 italic">Rigoureuse.</span></h2>
              </div>
              <div className="space-y-8">
                <p className="text-lg text-zinc-400 leading-relaxed font-light italic">
                  "Nous ne vendons que des produits que nous serions fiers de servir à notre propre table."
                </p>
                <div className="grid gap-6">
                  <div className="flex gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <CheckCircle className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Direct Producteur</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-light">
                        Nous sourçons nos produits directement auprès d'artisans et d'agriculteurs passionnés, garantissant une fraîcheur incomparable.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <CheckCircle className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Contrôle Qualité</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-light">
                        Chaque arrivage est inspecté pour vérifier sa conformité à nos standards de goût, de texture et d'aspect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10"
            >
              <img src="/images/hero-bg.png" alt="Legal Compliance" className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <span className="px-6 py-3 rounded-full bg-green-neon text-black font-black text-xs uppercase tracking-widest shadow-2xl">
                  100% Frais & Certifié
                </span>
              </div>
            </motion.div>
          </div>

          {/* Traceability Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, order: 2 }}
              whileInView={{ opacity: 1, order: 2 }}
              viewport={{ once: true }}
              className="space-y-10 lg:order-2"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-black">L'Origine <br /> <span className="text-amber-400 italic">Garantie.</span></h2>
              </div>
              <div className="space-y-8">
                <p className="text-lg text-zinc-400 leading-relaxed font-light">
                  Nous travaillons main dans la main avec des producteurs locaux qui respectent les cycles naturels et la biodiversité de nos régions.
                </p>

                <div className="bg-zinc-900 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[60px] group-hover:bg-amber-400/20 transition-all duration-1000" />
                  <div className="flex items-center gap-6 mb-6">
                    <FileText className="w-10 h-10 text-amber-400" />
                    <h3 className="text-xl font-black uppercase tracking-widest">Fiche de Traçabilité</h3>
                  </div>
                  <p className="text-sm text-zinc-500 leading-relaxed font-light mb-8">
                    Chaque produit dispose d'une fiche détaillée indiquant son origine exacte, sa date de récolte ou de fabrication, et ses certifications.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Origine France
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Sans OGM
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Bio Certifié
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-amber-400">
                      100% Frais
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, order: 1 }}
              whileInView={{ opacity: 1, scale: 1, order: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10 lg:order-1"
            >
              <img src="https://images.unsplash.com/photo-1488459711612-0717992d60bc?w=1000" alt="Produits de saison" className="w-full h-full object-cover scale-110 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Warning Footer Banner */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-12 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] text-center space-y-8">
          <Search className="w-12 h-12 text-zinc-700 mx-auto" />
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-black">Une Transparence Totale</h3>
            <p className="text-zinc-500 max-w-xl mx-auto font-light leading-relaxed">
              Nous vous accueillons en boutique pour échanger sur nos méthodes de sélection,
              nos origines et vous présenter les engagements de chaque sélection en rayon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
