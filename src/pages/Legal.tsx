import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Building2, Server, ShieldCheck, Copyright, Database, ChevronRight } from "lucide-react";
import SEO from "../components/SEO";

const SECTIONS = [
  {
    id: "editeur",
    number: "1",
    icon: <Building2 className="w-5 h-5" />,
    title: "Éditeur du site",
    content: (
      <div className="space-y-2 text-zinc-400 leading-relaxed">
        <p>Le site Shop-ia est édité par :</p>
        <ul className="space-y-1.5 mt-3">
          {[
            ["Raison sociale", "Shop-ia SAS"],
            ["Siège social", "45 Avenue de la Fraîcheur, 75001 Paris"],
            ["Numéro SIRET", "987 654 321 00012"],
            ["Directeur de la publication", "Mayssa"],
            ["Contact", "hello@shop-ia.fr"],
          ].map(([k, v]) => (
            <li key={k} className="flex flex-wrap gap-2">
              <span className="font-semibold text-zinc-200 min-w-[200px]">{k} :</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "hebergement",
    number: "2",
    icon: <Server className="w-5 h-5" />,
    title: "Hébergement",
    content: (
      <div className="space-y-2 text-zinc-400 leading-relaxed">
        <p>Le site est hébergé par :</p>
        <ul className="space-y-1.5 mt-3">
          {[
            ["Hébergeur", "OVH (ou Hostinger / o2switch)"],
            ["Adresse", "2 rue Kellermann, 59100 Roubaix, France"],
            ["Téléphone", "1007"],
          ].map(([k, v]) => (
            <li key={k} className="flex flex-wrap gap-2">
              <span className="font-semibold text-zinc-200 min-w-[200px]">{k} :</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "qualite",
    number: "3",
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Qualité & Consommation",
    content: (
      <div className="space-y-3 text-zinc-400 leading-relaxed">
        <p>
          Les produits proposés sur ce site sont sélectionnés pour leur qualité et leur origine. Nous nous engageons à respecter toutes les normes sanitaires en vigueur.
        </p>
        <p>
          <span className="font-semibold text-zinc-200">Conservation :</span> Pour une qualité optimale, suivez les conseils de conservation indiqués sur les emballages.
        </p>
      </div>
    ),
  },
  {
    id: "propriete",
    number: "4",
    icon: <Copyright className="w-5 h-5" />,
    title: "Propriété Intellectuelle",
    content: (
      <p className="text-zinc-400 leading-relaxed">
        L'ensemble du contenu de ce site (textes, images, logos, etc.) est la propriété exclusive de Shop-ia SAS, sauf mention contraire. Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord exprès par écrit de Shop-ia SAS.
      </p>
    ),
  },
  {
    id: "donnees",
    number: "5",
    icon: <Database className="w-5 h-5" />,
    title: "Données Personnelles",
    content: (
      <p className="text-zinc-400 leading-relaxed">
        Ce site ne collecte pas de données personnelles à des fins commerciales. Aucun cookie de traçage publicitaire n'est utilisé. Conformément au RGPD, les données collectées lors de la création d'un compte sont utilisées exclusivement pour la gestion de votre espace client et de vos commandes.
      </p>
    ),
  },
];

export default function Legal() {
  const [activeSection, setActiveSection] = useState("editeur");

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      <SEO
        title="Mentions Légales — Shop-ia"
        description="Consultez les mentions légales, conditions générales d'utilisation et avertissements légaux de Shop-ia."
        keywords="mentions légales épicerie, CGU Shop-ia"
      />

      {/* ── Page header ── */}
      <section className="border-b border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-serif font-bold text-white"
            >
              Mentions <span className="text-amber-400">Légales</span>
            </motion.h1>
            <p className="text-zinc-500 text-sm mt-1">Dernière mise à jour : Mars 2026</p>
          </div>
        </div>
      </section>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

        {/* Sidebar ToC — Amazon-style left nav */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-28 bg-zinc-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sommaire</p>
            </div>
            <nav className="p-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${activeSection === s.id
                      ? "bg-amber-400/10 text-amber-400 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  <span className={`flex-shrink-0 ${activeSection === s.id ? "text-amber-400" : "text-zinc-600"}`}>
                    {s.icon}
                  </span>
                  <span className="flex-1">{s.title}</span>
                  {activeSection === s.id && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {SECTIONS.map((s, i) => (
            <motion.section
              id={s.id}
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onViewportEnter={() => setActiveSection(s.id)}
              className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden scroll-mt-32"
            >
              {/* Section header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-zinc-900/60">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  {s.icon}
                </div>
                <h2 className="text-base font-bold text-white">
                  <span className="text-zinc-600 mr-2">{s.number}.</span>
                  {s.title}
                </h2>
              </div>

              {/* Section body */}
              <div className="px-6 py-5 text-sm">
                {s.content}
              </div>
            </motion.section>
          ))}

          {/* Footer note */}
          <div className="text-center py-8 text-zinc-600 text-xs">
            Pour toute question concernant ces mentions légales,{" "}
            <a href="mailto:hello@shop-ia.fr" className="text-amber-400 hover:underline">
              contactez-nous
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
