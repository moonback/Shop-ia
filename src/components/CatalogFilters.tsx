import { Category } from "../lib/types";

interface CatalogFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  aiTags: string[];
  selectedAiTags: string[];
  toggleAiTag: (tag: string) => void;
}

export default function CatalogFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  priceRange,
  setPriceRange,
  aiTags,
  selectedAiTags,
  toggleAiTag,
}: CatalogFiltersProps) {
  return (
    <aside className="sticky top-28 h-fit rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm" aria-label="Filtres catalogue">
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Catégories</h3>
          <button className="block text-left text-sm" onClick={() => setSelectedCategory(null)}>Toutes</button>
          {categories.map((category) => (
            <button key={category.id} className={`mt-1 block text-left text-sm ${selectedCategory === category.id ? "font-semibold text-[var(--color-primary)]" : ""}`} onClick={() => setSelectedCategory(category.id)}>
              {category.name}
            </button>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Prix</h3>
          <label className="text-xs">Max: {priceRange[1]}€</label>
          <input type="range" min={0} max={300} value={priceRange[1]} onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])} className="w-full" aria-label="Prix maximum" />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Note minimum</h3>
          <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm" aria-label="Note minimale">
            <option value={0}>Toutes</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} aria-label="Disponibles uniquement" />
          Disponibilité immédiate
        </label>

        <div>
          <h3 className="mb-2 text-sm font-semibold">AI Tags</h3>
          <div className="flex flex-wrap gap-2">
            {aiTags.map((tag) => (
              <button key={tag} onClick={() => toggleAiTag(tag)} className={`rounded-full border px-2 py-1 text-xs ${selectedAiTags.includes(tag) ? "border-[var(--color-primary)] bg-green-50" : "border-[var(--color-border)]"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
