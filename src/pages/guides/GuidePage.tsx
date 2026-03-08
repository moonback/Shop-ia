import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { articleSchema, breadcrumbSchema, faqSchema, howToSchema } from '../../lib/seo/schemaBuilder';

export const guideContent = {
  'guide-huiles-olive': {
    title: 'Guide complet des huiles d\'olive',
    description: 'Tout comprendre sur les huiles d\'olive : extra vierge, première pression, arômes et utilisations culinaires.',
    summary: 'Guide expert pour choisir une huile d\'olive de qualité et comprendre ses différents usages en cuisine.',
    body: 'Les huiles d\'olive extra vierge sont parmi les ingrédients les plus précieux de la cuisine méditerranéenne. Chez Shop-ia, nous sélectionnons des huiles de première pression à froid, avec traçabilité et origine certifiée. Pour comparer les produits, regardez la méthode d\'extraction, l\'origine, le taux d\'acidité et les profils aromatiques (fruité, poivré, herbacé).',
    faq: [
      { question: 'Quelle huile choisir pour la cuisine ?', answer: 'Pour les cuissons douces et les assaisonnements, privilégiez une huile extra vierge de qualité. Pour les cuissons à haute température, une huile raffinée est plus adaptée.' },
      { question: 'Comment conserver une huile d\'olive ?', answer: 'Conservez à l\'abri de la lumière et de la chaleur, idéalement à température ambiante entre 12°C et 18°C. Consommez dans les 18 mois suivant la récolte.' },
    ],
  },
  'guide-confitures-maison': {
    title: 'Guide des confitures artisanales',
    description: 'Comment choisir et apprécier les confitures artisanales : fruits, sucre, texture et conservation.',
    summary: 'Méthode simple pour identifier une confiture artisanale de qualité et en apprécier toutes les nuances.',
    body: 'Une bonne confiture artisanale se distingue par la qualité des fruits utilisés, le taux de sucre naturel et l\'absence d\'additifs. Nos confitures sont fabriquées en petite bassine de cuivre selon des méthodes traditionnelles. Le taux de fruits est généralement supérieur à 65% pour garantir les meilleures saveurs.',
    faq: [
      { question: 'Comment se conserve une confiture artisanale ?', answer: 'Un pot non ouvert se conserve 2 à 3 ans dans un endroit frais et sec. Une fois ouvert, consommez dans les 3 à 4 semaines et conservez au réfrigérateur.' },
      { question: 'Quelle différence avec une confiture industrielle ?', answer: 'Les confitures artisanales contiennent plus de fruits, moins de sucre ajouté et aucun conservateur artificiel. La texture et les saveurs sont bien plus prononcées.' },
    ],
  },
  'guide-thes-infusions': {
    title: 'Guide des thés et infusions premium',
    description: 'Découvrir et apprécier les thés de qualité : origines, niveaux d\'oxydation, préparation et dégustation.',
    summary: 'Guide complet pour choisir et préparer les meilleurs thés selon vos goûts et moments de la journée.',
    body: 'Le monde du thé est fascinant par sa diversité. Des thés verts japonais aux thés noirs d\'Inde en passant par les oolongs taïwanais, chaque variété offre une expérience unique. Chez Shop-ia, nous sélectionnons des thés de première qualité avec une traçabilité claire sur le jardin d\'origine et la saison de récolte.',
    faq: [
      { question: 'À quelle température infuser le thé vert ?', answer: 'Le thé vert s\'infuse entre 60°C et 75°C pour éviter l\'amertume. L\'eau trop chaude détruit les arômes délicats et les antioxydants bénéfiques.' },
      { question: 'Combien de temps infuser ?', answer: 'En règle générale : 2-3 minutes pour les thés verts, 3-5 minutes pour les thés noirs. Ajustez selon votre préférence pour l\'intensité.' },
    ],
  },
  'guide-cafes-specialty': {
    title: 'Guide du café specialty et single origin',
    description: 'Comprendre et apprécier les cafés de spécialité : origines, torréfaction, méthodes de préparation.',
    summary: 'Guide pratique pour choisir et préparer un café single origin de qualité selon votre équipement.',
    body: 'Le café specialty représente le sommet de la qualité caféière. Ces cafés ont un score cupping supérieur à 80/100, une traçabilité totale jusqu\'à la ferme et une torréfaction artisanale qui révèle leurs meilleurs arômes. Chez Shop-ia, nos cafés single origin sont sélectionnés pour leurs profils aromatiques uniques et leur traçabilité irréprochable.',
    faq: [
      { question: 'Quelle mouture pour quel usage ?', answer: 'Mouture fine pour l\'espresso, mouture moyenne pour les cafetières à filtre, mouture grossière pour la presse française. La mouture fraîche préserve les arômes.' },
      { question: 'Comment conserver son café ?', answer: 'Conservez dans un contenant hermétique à l\'abri de la lumière et de l\'humidité. Consommez dans les 2-4 semaines après torréfaction pour les meilleurs arômes.' },
    ],
  },
  'guide-accords-mets': {
    title: 'Guide des accords mets et épicerie fine',
    description: 'Maîtriser les accords entre les produits d\'épicerie fine et vos plats pour sublimer vos repas.',
    summary: 'Conseils pratiques pour créer des associations harmonieuses entre épicerie fine et cuisine du quotidien.',
    body: 'L\'art des accords en cuisine repose sur l\'équilibre des saveurs, des textures et des intensités. Nos produits d\'épicerie fine se marient avec subtilité selon quelques principes simples : les saveurs sucrées équilibrent les plats acides, les huiles fruitées subliment les salades légères, les condiments épicés rehaussent les plats de caractère.',
    faq: [
      { question: 'Quel miel pour accompagner les fromages ?', answer: 'Le miel de lavande s\'associe merveilleusement aux fromages de chèvre frais. Le miel de châtaignier convient mieux aux fromages à pâte dure et corsés.' },
      { question: 'Quelle confiture avec les viandes ?', answer: 'Les confitures d\'oignons ou de figues sont parfaites avec les viandes rouges et les terrines. Les confitures de fruits rouges accompagnent les volailles et les gibiers.' },
    ],
  },
} as const;

export default function GuidePage({ slug }: { slug: keyof typeof guideContent }) {
  const content = guideContent[slug];
  const schema = [
    articleSchema({ title: content.title, description: content.description, path: `/guides/${slug}`, datePublished: '2026-01-01' }),
    faqSchema(content.faq),
    breadcrumbSchema([
      { name: 'Accueil', path: '/' },
      { name: 'Guides Culinaires', path: '/guides' },
      { name: content.title, path: `/guides/${slug}` },
    ]),
    howToSchema({
      name: `Comment utiliser ${content.title}`,
      description: content.description,
      steps: ['Choisir un produit artisanal de qualité', 'Lire les conseils de conservation', 'Découvrir les accords et utilisations recommandés'],
    }),
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pt-28 pb-20">
      <SEO
        title={`${content.title} | Shop-ia`}
        description={content.description}
        canonical={`/guides/${slug}`}
        schema={schema}
        article={{ publishedTime: '2026-01-01', section: 'Guides Culinaires' }}
        keywords={['épicerie fine', 'guide culinaire', 'shop-ia', 'alimentation artisanale', ...content.faq.map((f) => f.question)]}
        semanticKeywords={['artisanal', 'gastronomie', 'circuits courts', 'terroir', 'saveurs']}
        aiSummary={content.summary}
        aiEntity="Épicerie fine;Alimentation;Artisanal;Gastronomie;Circuits courts"
      />
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <p className="text-sm uppercase tracking-widest text-green-400">Résumé culinaire</p>
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">{content.summary}</p>
        <h1 className="text-4xl font-bold">{content.title}</h1>
        <p className="text-zinc-300 leading-7">{content.body}</p>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Questions fréquentes</h2>
          {content.faq.map((item) => (
            <article key={item.question} className="rounded-lg border border-zinc-800 p-4">
              <h3 className="font-medium">{item.question}</h3>
              <p className="text-zinc-300">{item.answer}</p>
            </article>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <h2 className="text-xl font-semibold mb-3">Liens recommandés</h2>
          <div className="flex flex-wrap gap-3">
            <Link className="text-green-400 underline" to="/catalogue">Voir nos produits</Link>
            <Link className="text-green-400 underline" to="/guides">Autres guides culinaires</Link>
            <Link className="text-green-400 underline" to="/contact">Parler à notre conseiller</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
