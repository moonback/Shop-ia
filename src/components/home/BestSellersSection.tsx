import { Product } from "../../lib/types";
import ProductGrid from "../ProductGrid";

export default function BestSellersSection({ products }: { products: Product[] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Best Sellers</h2>
      <ProductGrid products={products} />
    </section>
  );
}
