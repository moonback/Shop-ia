import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "../lib/types";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

interface ProductGridProps {
  products: Product[];
}

function ProductGridComponent({ products }: ProductGridProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const hasWishlistItem = useWishlistStore((state) => state.hasItem);

  const visibleProducts = useMemo(() => {
    if (products.length <= 200) return products;
    return products.slice(0, 200);
  }, [products]);

  return (
    <section aria-label="Produits" className="space-y-4">
      {products.length > 200 && <p className="text-xs text-gray-500">Affichage virtualisé sur 200 produits pour optimiser les performances.</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleProducts.map((product) => {
          const inWishlist = hasWishlistItem(product.id);
          return (
            <motion.article key={product.id} whileHover={{ y: -4 }} className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm transition hover:shadow-md">
              <Link to={`/catalogue/${product.slug}`} className="relative block">
                <img src={product.image_url ?? "/logo.png"} alt={product.name} loading="lazy" className="h-40 w-full rounded-t-xl object-cover" />
                <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-semibold ${product.stock_quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {product.stock_quantity > 0 ? "En stock" : "Rupture"}
                </span>
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link to={`/catalogue/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">{product.name}</Link>
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{(product.avg_rating ?? 4.5).toFixed(1)}</span>
                </div>
                <div className="text-lg font-bold text-[var(--color-text)]">{product.price.toFixed(2)}€</div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => addItem(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-2 py-2 text-xs font-semibold text-white" aria-label={`Ajouter ${product.name} au panier`}>
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter
                  </button>
                  <button onClick={() => toggleWishlist(product.id)} className={`rounded-lg border px-2 ${inWishlist ? "border-rose-300 bg-rose-50 text-rose-600" : "border-[var(--color-border)]"}`} aria-label={`Ajouter ${product.name} à la wishlist`}>
                    <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

const ProductGrid = memo(ProductGridComponent);

export default ProductGrid;
