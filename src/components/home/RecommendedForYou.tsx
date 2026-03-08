import { Product } from "../../lib/types";
import ProductGrid from "../ProductGrid";

export default function RecommendedForYou({ products }: { products: Product[] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Recommended For You (AI)</h2>
      <ProductGrid products={products} />
    </section>
  );
}
