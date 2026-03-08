import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../lib/types";
import HeroBanner from "../components/home/HeroBanner";
import DealsOfTheDay from "../components/home/DealsOfTheDay";
import BestSellersSection from "../components/home/BestSellersSection";
import RecommendedForYou from "../components/home/RecommendedForYou";
import CategoryShowcase from "../components/home/CategoryShowcase";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*, category:categories(*)").eq("is_active", true).limit(30),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order").limit(8),
    ]).then(([productResponse, categoryResponse]) => {
      setProducts((productResponse.data as Product[]) ?? []);
      setCategories((categoryResponse.data as Category[]) ?? []);
    });
  }, []);

  const deals = useMemo(() => products.filter((item) => item.is_featured).slice(0, 10), [products]);
  const bestSellers = useMemo(() => products.filter((item) => (item.avg_rating ?? 4) >= 4).slice(0, 10), [products]);
  const recommended = useMemo(() => products.filter((item) => item.stock_quantity > 0).slice(0, 10), [products]);

  return (
    <div className="space-y-10 pb-10">
      <SEO title="Shop-ia | Premium AI Commerce" description="Plateforme e-commerce IA moderne, rapide et accessible." />
      <HeroBanner />
      <DealsOfTheDay products={deals} />
      <BestSellersSection products={bestSellers} />
      <RecommendedForYou products={recommended} />
      <CategoryShowcase categories={categories} />
    </div>
  );
}
