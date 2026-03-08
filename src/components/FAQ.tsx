import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Qu’est-ce que le CBN ?",
    answer: "Le CBN (cannabinol) est un cannabinoïde naturel dérivé du chanvre reconnu pour ses effets relaxants et favorisant le sommeil."
  },
  {
    question: "Le CBN est-il légal ?",
    answer: "Oui, les produits à base de CBN sont légaux en Europe lorsqu’ils respectent la réglementation sur le THC."
  },
  {
    question: "Quels sont les effets du CBN ?",
    answer: "Le CBN est souvent utilisé pour : améliorer le sommeil, réduire le stress et favoriser la relaxation."
  },
  {
    question: "Comment utiliser l’huile CBN ?",
    answer: "L’huile CBN se prend généralement sous la langue pour une absorption rapide."
  },
  {
    question: "Où puis-je me faire livrer ?",
    answer: "Nous livrons dans toute la France métropolitaine, avec un service express à Paris et sa région (livraison en 24h)."
  },
  {
    question: "Comment choisir le bon produit ?",
    answer: "Vous pouvez consulter notre guide d'achat détaillé, utiliser notre BudTender IA pour une recommandation personnalisée ou nous contacter directement pour une consultation sur-mesure."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-16 md:py-24 bg-zinc-950 border-t border-white/[0.06]">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-serif font-bold text-white mb-4"
          >
            Questions Fréquentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400"
          >
            Tout ce que vous devez savoir sur le CBD et notre boutique.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/[0.08] rounded-2xl overflow-hidden bg-zinc-900/30 hover:border-green-neon/20 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-medium text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-green-neon shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-4 text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
