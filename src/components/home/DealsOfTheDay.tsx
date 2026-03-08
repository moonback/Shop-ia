import { Product } from "../../lib/types";
import ProductGrid from "../ProductGrid";

export default function DealsOfTheDay({ products }: { products: Product[] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">Deals of the Day</h2>
      <ProductGrid products={products} />
    </section>
  );
}
