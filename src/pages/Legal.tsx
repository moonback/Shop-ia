import { motion } from "motion/react";
import SEO from "../components/SEO";

export default function Legal() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <SEO
        title="Mentions Légales - Shop-ia"
        description="Consultez les mentions légales, conditions générales d'utilisation et avertissements légaux de Shop-ia."
        keywords="mentions légales épicerie, CGU Shop-ia"
      />
      {/* Header */}
      <section className="py-24 text-center px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-serif font-bold text-white mb-6"
        >
          Mentions <span className="text-amber-400">Légales</span>
        </motion.h1>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-invert prose-zinc max-w-none space-y-12"
          >
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                1. Éditeur du site
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Le site Shop-ia est édité par :<br />
                <strong>Raison sociale :</strong> Shop-ia SAS
                <br />
                <strong>Siège social :</strong> 45 Avenue de la Fraîcheur, 75001 Paris
                <br />
                <strong>Numéro SIRET :</strong> 987 654 321 00012
                <br />
                <strong>Directeur de la publication :</strong> Mayssa
                <br />
                <strong>Contact :</strong> hello@shop-ia.fr
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                2. Hébergement
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Le site est hébergé par :<br />
                <strong>Nom de l'hébergeur :</strong> OVH (ou Hostinger /
                o2switch)
                <br />
                <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix,
                France
                <br />
                <strong>Téléphone :</strong> 1007
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                3. Qualité & Consommation
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Les produits proposés sur ce site sont sélectionnés pour leur qualité et leur origine. Nous nous engageons à respecter toutes les normes sanitaires en vigueur.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                <strong>Conservation :</strong> Pour une qualité optimale, suivez les conseils de conservation indiqués sur les emballages.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                4. Propriété Intellectuelle
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, logos, etc.)
                est la propriété exclusive de Shop-ia SAS, sauf mention
                contraire. Toute reproduction, distribution, modification,
                adaptation, retransmission ou publication de ces différents
                éléments est strictement interdite sans l'accord exprès par
                écrit de Shop-ia SAS.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-4">
                5. Données Personnelles
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Ce site vitrine ne collecte pas de données personnelles à des
                fins commerciales. Aucun cookie de traçage publicitaire n'est
                utilisé.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
