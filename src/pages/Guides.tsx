import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { guideContent } from './guides/GuidePage';
import { breadcrumbSchema } from '../lib/seo/schemaBuilder';

export default function Guides() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-28 pb-20 px-4">
      <SEO
        title="Guides Experts Alimentation | Shop-ia"
        description="Découvrez nos guides pour mieux consommer : fraîcheur, saisonnalité, épicerie fine et conseils culinaires."
        canonical="/guides"
        schema={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Guides Gourmets', path: '/guides' },
        ])}
      />
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-4 block">Savoir-faire & Conseils</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Guides <span className="text-amber-400 italic">Gourmets</span></h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            Explorez nos dossiers pour apprendre à mieux choisir vos produits, comprendre les terroirs et optimiser votre cuisine au quotidien.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(guideContent).map(([slug, guide]) => (
            <Link key={slug} to={`/guides/${slug}`} className="group rounded-3xl border border-white/5 bg-white/[0.02] p-8 hover:border-amber-400/30 transition-all hover:bg-white/[0.04]">
              <h2 className="font-serif font-bold text-2xl mb-4 text-white group-hover:text-amber-400 transition-colors">{guide.title}</h2>
              <p className="text-zinc-400 leading-relaxed line-clamp-2">{guide.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">Lire la suite</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black transition-all">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
