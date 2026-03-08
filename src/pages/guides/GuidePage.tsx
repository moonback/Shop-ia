import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { articleSchema, breadcrumbSchema, faqSchema, howToSchema } from '../../lib/seo/schemaBuilder';

export const guideContent = {
  'guide-conservation-produits-frais': {
    title: 'Conserver ses produits frais',
    description: 'Astuces et conseils pour prolonger la fraîcheur de vos fruits, légumes et produits frais.',
    summary: 'Guide pratique pour optimiser la durée de vie de vos achats et réduire le gaspillage.',
    body: 'La conservation commence dès le retour des courses. Séparez les fruits climactériques (comme les pommes) des autres, maintenez une hygrométrie adaptée dans le bac à légumes et respectez les zones de froid de votre réfrigérateur. Shop-ia s\'engage à vous livrer des produits extra-frais pour vous faciliter la tâche.',
    faq: [
      { question: 'Faut-il laver les légumes avant de les ranger ?', answer: 'Il est préférable de les laver juste avant la consommation pour éviter l\'humidité stagnante qui favorise le flétrissement.' },
      { question: 'Comment conserver les herbes aromatiques ?', answer: 'Enveloppez-les dans un essuie-tout humide ou placez-les comme un bouquet dans un verre d\'eau au frais.' },
    ],
  },
  'guide-saisonnalite-fruits-legumes': {
    title: 'Calendrier de saisonnalité',
    description: 'Pourquoi manger de saison et quels produits privilégier chaque mois.',
    summary: 'Retrouvez le goût authentique en respectant le cycle de la nature.',
    body: 'Manger de saison, c\'est profiter de produits au sommet de leurs qualités nutritionnelles et gustatives. C\'est aussi un geste pour la planète en limitant les serres chauffées et les transports longue distance. Chez Shop-ia, notre catalogue évolue au fil des mois pour vous proposer le meilleur du moment.',
    faq: [
      { question: 'Pourquoi les tomates d\'hiver ont moins de goût ?', answer: 'Elles sont souvent cultivées hors-sol sous serre et cueillies avant maturité pour supporter le transport.' },
      { question: 'Quels sont les légumes rois de l\'automne ?', answer: 'Les courges, les poireaux, les choux et les racines comme le panais.' },
    ],
  },
  'guide-choisir-huile-olive': {
    title: 'Bien choisir son huile d\'olive',
    description: 'Comprendre les étiquettes, les origines et les méthodes d\'extraction.',
    summary: 'Devenez expert en huile d\'olive et sublimez vos plats.',
    body: 'Vierge extra, pression à froid, origine protégée... les termes ne manquent pas. Une bonne huile d\'olive doit avoir une ardence (piquant) et une amertume équilibrées, signes de la présence de polyphénols. Privilégiez les bouteilles opaques qui protègent l\'huile de l\'oxydation par la lumière.',
    faq: [
      { question: 'Que signifie "pression à froid" ?', answer: 'Cela garantit que l\'huile a été extraite mécaniquement à moins de 27°C, préservant ses arômes et vitamines.' },
      { question: 'Peut-on cuisiner avec de l\'huile d\'olive vierge extra ?', answer: 'Oui, son point de fumée est élevé (environ 210°C), ce qui la rend stable pour la cuisson.' },
    ],
  },
  'guide-epicerie-fine': {
    title: 'Découvrir l\'épicerie fine',
    description: 'Voyage culinaire à travers des produits d\'exception et des savoir-faire artisanaux.',
    summary: 'Le plaisir d\'offrir ou de se faire plaisir avec des produits rares.',
    body: 'L\'épicerie fine chez Shop-ia, c\'est une sélection de produits issus de petits ateliers : confitures cuites au chaudron, pâtes artisanales séchées lentement, épices sourcées à la source. C\'est l\'assurance d\'un goût unique et d\'une histoire derrière chaque flacon.',
    faq: [
      { question: 'Quelle est la différence avec l\'épicerie classique ?', answer: 'La qualité des ingrédients, le temps de fabrication et l\'absence d\'additifs industriels.' },
      { question: 'Comment conserver les épices ?', answer: 'À l\'abri de la lumière, de la chaleur et de l\'humidité pour préserver leurs huiles essentielles.' },
    ],
  },
  'guide-achat-local': {
    title: 'Les avantages de l\'achat local',
    description: 'Soutenir l\'économie régionale et réduire son empreinte carbone.',
    summary: 'Pourquoi le circuit court est l\'avenir de notre alimentation.',
    body: 'Acheter local, c\'est recréer un lien entre le producteur et le consommateur. Cela permet une meilleure rémunération de l\'agriculteur et une traçabilité sans faille. Shop-ia privilégie les partenariats en direct pour vous garantir des produits qui n\'ont pas fait trois fois le tour de la terre.',
    faq: [
      { question: 'Le local est-il forcément plus cher ?', answer: 'Pas nécessairement, car la réduction des intermédiaires permet de compenser les coûts de production artisanaux.' },
      { question: 'Comment Shop-ia sélectionne ses producteurs ?', answer: 'Sur des critères de goût, de respect de l\'environnement et de proximité géographique.' },
    ],
  },
} as const;

export default function GuidePage({ slug }: { slug: keyof typeof guideContent }) {
  const content = guideContent[slug];
  const schema = [
    articleSchema({ title: content.title, description: content.description, path: `/guides/${slug}`, datePublished: '2026-03-08' }),
    faqSchema(content.faq),
    breadcrumbSchema([
      { name: 'Accueil', path: '/' },
      { name: 'Guides Gourmets', path: '/guides' },
      { name: content.title, path: `/guides/${slug}` },
    ]),
    howToSchema({
      name: `Comment profiter de : ${content.title}`,
      description: content.description,
      steps: ['Sélectionner le produit sur Shop-ia', 'Suivre les conseils de conservation', 'Accompagner avec des produits de saison'],
    }),
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pt-28 pb-20">
      <SEO
        title={`${content.title} | Shop-ia`}
        description={content.description}
        canonical={`/guides/${slug}`}
        schema={schema}
        article={{ publishedTime: '2026-03-08', section: 'Guides Alimentaires' }}
        keywords={['alimentation', 'guide culinaire', 'shop-ia', 'produits frais', 'épicerie', ...content.faq.map((f) => f.question)]}
        semanticKeywords={['gastronomie', 'terroir', 'cuisine', 'bien-manger', 'fraîcheur']}
        aiSummary={content.summary}
        aiEntity="Food;Grocery;Cooking;Nutrition;Local Sourcing;Freshness"
      />
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <p className="text-sm uppercase tracking-widest text-amber-400">Résumé IA</p>
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">{content.summary}</p>
        <h1 className="text-4xl font-bold font-serif">{content.title}</h1>
        <p className="text-zinc-300 leading-7 text-lg">{content.body}</p>

        <div className="space-y-3 pt-6">
          <h2 className="text-2xl font-serif font-semibold text-white">Questions fréquentes</h2>
          <div className="grid gap-4">
            {content.faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-zinc-800 bg-white/[0.02] p-6 hover:border-amber-400/30 transition-colors">
                <h3 className="font-bold text-lg mb-2 text-white">{item.question}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-800">
          <h2 className="text-xl font-serif font-semibold mb-6 text-white text-center">Recommandations Shop-ia</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link className="px-6 py-3 rounded-full bg-amber-400 text-black font-bold hover:scale-105 transition-transform" to="/catalogue">Faire mes courses</Link>
            <Link className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors" to="/boutique">Voir les rayons</Link>
            <Link className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors" to="/contact">Besoin d'un conseil ?</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
