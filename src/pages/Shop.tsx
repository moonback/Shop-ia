import { motion } from "motion/react";
import {
  MapPin, Clock, ArrowRight, ShieldCheck, Utensils,
  Award, Users, Sparkles, CalendarCheck, ChefHat,
  Truck, Star, Leaf, Package
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useSettingsStore } from "../store/settingsStore";

const VALUES = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Qualité Absolue",
    desc: "Nous sélectionnons rigoureusement chaque producteur pour garantir des saveurs authentiques et une fraîcheur parfaite.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Exigence Gourmet",
    desc: "Une sélection drastique des meilleurs terroirs français et internationaux pour votre assiette.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Conseil Culinaire",
    desc: "Nos experts et notre IA sont là pour vous guider dans vos choix et vos recettes au quotidien.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: <ChefHat className="w-6 h-6" />,
    title: "Savoir-faire",
    desc: "Des produits issus de méthodes artisanales traditionnelles et respectueuses du goût.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const STATS = [
  { value: "100+", label: "Produits d'Exception" },
  { value: "4.8★", label: "Note Clients" },
  { value: "24h", label: "Livraison Fraîcheur" },
  { value: "2024", label: "Renouveau Shop-ia" },
];

export default function Shop() {
  const settings = useSettingsStore((s) => s.settings);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <SEO
        title="L'ADN Shop-ia — Notre Boutique & Nos Valeurs"
        description="Découvrez Shop-ia, votre épicerie fine de confiance. Histoire, valeurs et engagement qualité."
        keywords="boutique épicerie fine Paris, produits frais, gastronomie, histoire Shop-ia"
      />

      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-end pb-20 pt-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"
            alt="Boutique Shop-ia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Leaf className="w-4 h-4" /> Notre ADN & Vision
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-none mb-6">
            L'EXPÉRIENCE <br />
            <span className="text-amber-400 italic">Shop-ia.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl font-light leading-relaxed">
            Plus qu'un point de vente — un sanctuaire dédié à la gastronomie et à l'excellence culinaire du quotidien.
          </p>
        </motion.div>
      </section>

      {/* ── Stats bar (Amazon-style quick facts) ── */}
      <div className="bg-zinc-900 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center gap-1 py-8 px-6 text-center"
              >
                <span className="text-3xl font-black text-amber-400 tracking-tighter">{s.value}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Brand Story ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-amber-400 font-bold tracking-[0.3em] text-[11px] uppercase">Notre Histoire</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Une histoire de <br />
                <span className="text-amber-400 italic">Goût & Passion.</span>
              </h2>
              <div className="w-16 h-1 bg-amber-400 rounded-full" />
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed font-light">
              Née de la volonté d'offrir une alternative authentique et exigeante, Shop-ia a été fondée par des amoureux de la bonne cuisine. Notre mission : démocratiser l'accès aux meilleurs produits du terroir tout en élevant les standards de fraîcheur du marché urbain.
            </p>
            <blockquote className="border-l-2 border-amber-400 pl-5 text-zinc-400 italic">
              "Nous croyons qu'une alimentation saine ne peut naître que d'une sélection passionnée et d'un respect absolu du produit."
            </blockquote>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Découvrir le catalogue <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-400/10 blur-[80px] rounded-full" />
            <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
                alt="Boutique"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values — Amazon-style feature grid ── */}
      <section className="py-20 bg-zinc-900/30 border-y border-white/[0.05] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <span className="text-amber-400 font-bold tracking-[0.3em] text-[11px] uppercase">Nos piliers</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              La charte qui définit{" "}
              <span className="text-amber-400 italic">chaque sélection</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col gap-5 p-6 rounded-2xl bg-zinc-900 border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center ${v.color} group-hover:scale-110 transition-transform`}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2">{v.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Store Info — Amazon "Seller info" style ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              Passez nous{" "}
              <span className="text-amber-400 italic">voir à Paris.</span>
            </h2>
            <p className="text-zinc-500">Notre boutique physique vous accueille du lundi au samedi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-5 p-6 bg-zinc-900 border border-white/[0.06] rounded-2xl hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Notre Adresse</p>
                <p className="text-white font-medium">{settings.store_address || '123 Avenue Gourmet, 75000 Paris'}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings.store_address || '123 Avenue Gourmet Paris')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2 transition-colors"
                >
                  Voir sur la carte <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5 p-6 bg-zinc-900 border border-white/[0.06] rounded-2xl hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Horaires d'ouverture</p>
                <p className="text-white font-medium whitespace-pre-line">{settings.store_hours || 'Lun-Sam : 09h00 — 20h00'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Nous contacter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalogue"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all text-sm"
            >
              <Package className="w-4 h-4 text-zinc-400" />
              Commander en ligne
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quote bar ── */}
      <section className="py-16 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-6 opacity-70" />
          <p className="text-xl md:text-2xl font-serif font-light text-zinc-300 italic leading-relaxed">
            "L'essence de Shop-ia réside dans l'équilibre parfait entre l'excellence du produit et la fraîcheur du terroir."
          </p>
        </div>
      </section>
    </div>
  );
}
