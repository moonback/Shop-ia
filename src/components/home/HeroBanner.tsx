import { Link } from "react-router-dom";

export default function HeroBanner() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-bg)] p-8 shadow-sm">
      <p className="text-sm font-medium text-[var(--color-primary)]">Premium AI Commerce</p>
      <h1 className="mt-2 text-3xl font-bold">Achetez plus vite avec des recommandations intelligentes</h1>
      <p className="mt-3 max-w-2xl text-sm text-gray-600">Une expérience inspirée des meilleurs standards marketplace, adaptée à votre boutique.</p>
      <Link to="/catalogue" className="mt-5 inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">Découvrir le catalogue</Link>
    </section>
  );
}
