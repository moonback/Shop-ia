import { FormEvent, KeyboardEvent, memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../lib/types";
import { generateEmbedding } from "../lib/embeddings";

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  type: "product" | "category";
}

function SearchBarComponent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setCategories((data as Category[]) ?? []);
      });
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      return;
    }

    const timeout = setTimeout(async () => {
      const text = query.trim();
      const productQuery = supabase
        .from("products")
        .select("id,name,slug")
        .eq("is_active", true)
        .ilike("name", `%${text}%`)
        .limit(6);

      if (category !== "all") {
        productQuery.eq("category_id", category);
      }

      const [{ data: productRows }, { data: categoryRows }] = await Promise.all([
        productQuery,
        supabase.from("categories").select("id,name,slug").eq("is_active", true).ilike("name", `%${text}%`).limit(3),
      ]);

      const semanticSuggestions: SearchSuggestion[] = [];
      try {
        const embedding = await generateEmbedding(text);
        const { data: semanticRows } = await supabase.rpc("match_products", {
          query_embedding: embedding,
          match_threshold: 0.15,
          match_count: 4,
        });
        semanticSuggestions.push(
          ...((semanticRows as Pick<Product, "id" | "name" | "slug">[] | null) ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            type: "product" as const,
          })),
        );
      } catch {
        // semantic search is optional; ignore failures
      }

      const keywordSuggestions: SearchSuggestion[] = [
        ...(((productRows as Pick<Product, "id" | "name" | "slug">[] | null) ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: "product" as const,
        }))),
        ...(((categoryRows as Pick<Category, "id" | "name" | "slug">[] | null) ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          type: "category" as const,
        }))),
      ];

      const deduped = new Map<string, SearchSuggestion>();
      [...keywordSuggestions, ...semanticSuggestions].forEach((item) => {
        deduped.set(`${item.type}-${item.id}`, item);
      });

      setSuggestions(Array.from(deduped.values()).slice(0, 8));
      setSelectedSuggestionIndex(-1);
    }, 250);

    return () => clearTimeout(timeout);
  }, [category, query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("search", trimmed);
    if (category !== "all") params.set("category", category);
    navigate(`/catalogue?${params.toString()}`);
    setSuggestions([]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    }

    if (event.key === "Enter" && selectedSuggestionIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[selectedSuggestionIndex];
      navigate(selected.type === "product" ? `/catalogue/${selected.slug}` : `/catalogue?category=${selected.id}`);
      setSuggestions([]);
    }
  };

  const hasSuggestions = useMemo(() => suggestions.length > 0, [suggestions.length]);

  return (
    <div className="relative w-full max-w-4xl" role="search">
      <form onSubmit={handleSubmit} className="flex overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
        <label className="sr-only" htmlFor="search-category">Catégorie</label>
        <select
          id="search-category"
          className="w-36 border-r border-[var(--color-border)] bg-[var(--color-secondary)] px-3 py-3 text-sm text-[var(--color-text)]"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Sélectionner une catégorie"
        >
          <option value="all">Toutes</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="site-search">Rechercher des produits</label>
        <input
          id="site-search"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none"
          placeholder="Rechercher un produit, une marque, une catégorie..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Recherche produits"
        />
        <button type="submit" className="flex items-center gap-2 bg-[var(--color-primary)] px-5 text-sm font-semibold text-white" aria-label="Lancer la recherche">
          <Search className="h-4 w-4" />
          Rechercher
        </button>
      </form>

      {hasSuggestions && (
        <ul className="absolute inset-x-0 top-[calc(100%+0.25rem)] z-50 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg" aria-label="Suggestions de recherche">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.type}-${suggestion.id}`}>
              <Link
                to={suggestion.type === "product" ? `/catalogue/${suggestion.slug}` : `/catalogue?category=${suggestion.id}`}
                className={`block px-4 py-2 text-sm ${index === selectedSuggestionIndex ? "bg-[var(--color-secondary)]" : ""}`}
                onClick={() => setSuggestions([])}
              >
                <span className="font-medium text-[var(--color-text)]">{suggestion.name}</span>
                <span className="ml-2 text-xs text-gray-500">{suggestion.type === "product" ? "Produit" : "Catégorie"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SearchBar = memo(SearchBarComponent);

export default SearchBar;
