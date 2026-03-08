import { Category } from "../../lib/types";
import { Link } from "react-router-dom";

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Category Showcase</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/catalogue?category=${category.id}`} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm transition hover:shadow-md">
            <p className="font-semibold">{category.name}</p>
            <p className="text-xs text-gray-500">Explorer la sélection</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
