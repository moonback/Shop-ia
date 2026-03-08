import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import CatalogFilters from "../components/CatalogFilters";
import ProductGrid from "../components/ProductGrid";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../lib/types";

const AI_TAGS = ["Premium", "Bio", "Nouveauté", "Top Rated"];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [selectedAiTags, setSelectedAiTags] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*, category:categories(*)").eq("is_active", true).order("name"),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ]).then(([productResponse, categoryResponse]) => {
      setProducts((productResponse.data as Product[]) ?? []);
      setCategories((categoryResponse.data as Category[]) ?? []);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const search = searchParams.get("search")?.toLowerCase();
    return products.filter((product) => {
      if (selectedCategory && product.category_id !== selectedCategory) return false;
      if (inStockOnly && product.stock_quantity <= 0) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if ((product.avg_rating ?? 0) < minRating) return false;
      if (search && !product.name.toLowerCase().includes(search)) return false;
      if (selectedAiTags.includes("Premium") && !product.is_featured) return false;
      if (selectedAiTags.includes("Nouveauté")) {
        const createdAt = new Date(product.created_at).getTime();
        const daysSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 30) return false;
      }
      return true;
    });
  }, [inStockOnly, minRating, priceRange, products, searchParams, selectedAiTags, selectedCategory]);

  const toggleAiTag = (tag: string) => {
    setSelectedAiTags((current) => (
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    ));
  };

  return (
    <div className="space-y-6">
      <SEO title="Catalogue | Shop-ia" description="Catalogue intelligent type marketplace avec filtres avancés." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <CatalogFilters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minRating={minRating}
          setMinRating={setMinRating}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          aiTags={AI_TAGS}
          selectedAiTags={selectedAiTags}
          toggleAiTag={toggleAiTag}
        />
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}
