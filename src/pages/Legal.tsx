import { motion } from "motion/react";
import SEO from "../components/SEO";

export default function Legal() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <SEO
        title="Mentions Légales - Shop-ia Épicerie Fine"
        description="Consultez les mentions légales, conditions générales d'utilisation de Shop-ia, votre épicerie fine en ligne."
        keywords="mentions légales, CGU Shop-ia, épicerie fine"
      />
      {/* Header */}
      <section className="py-24 text-center px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-serif font-bold text-white mb-6"
        >
          Mentions <span className="text-green-neon">Légales</span>
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
                <strong>Siège social :</strong> 123 Rue du Marché, 75000
                Paris
                <br />
                <strong>Numéro SIRET :</strong> 123 456 789 00012
                <br />
                <strong>Directeur de la publication :</strong> [Nom du
                Directeur]
                <br />
                <strong>Contact :</strong> contact@shop-ia.fr
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
                3. Informations sur les produits alimentaires
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Les produits proposés sur ce site et en boutique sont des produits
                alimentaires conformes à la réglementation européenne et française en
                vigueur. Tous les produits respectent les normes d'hygiène et de sécurité
                alimentaire applicables.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                <strong>Allergènes :</strong> Certains produits peuvent contenir des
                allergènes. Les informations relatives aux allergènes sont disponibles sur
                chaque fiche produit. En cas de doute, contactez-nous avant votre commande.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Les informations nutritionnelles et les descriptions de produits sont
                fournies à titre indicatif. Pour toute information spécifique sur un
                produit, consultez l'étiquetage officiel du produit reçu.
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
                Ce site collecte uniquement les données personnelles nécessaires
                au traitement de vos commandes et à la gestion de votre compte.
                Conformément au RGPD, vous disposez d'un droit d'accès, de
                rectification et de suppression de vos données personnelles.
                Pour exercer ces droits, contactez-nous à : contact@shop-ia.fr
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
