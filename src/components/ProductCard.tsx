import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Package, RefreshCw, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../lib/types';

import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useWishlistStore } from '../store/wishlistStore';
import StarRating from './StarRating';
import { useState } from 'react';


interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export default function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const [selectedQuantity] = useState(1);
  const addItem = useCartStore(s => s.addItem);
  const openSidebar = useCartStore(s => s.openSidebar);
  const addToast = useToastStore(s => s.addToast);
  const toggleWishlist = useWishlistStore(s => s.toggleItem);
  const isWished = useWishlistStore(s => s.hasItem(product.id));

  const handleToggleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
    addToast({
      message: isWished ? `${product.name} retiré des favoris` : `${product.name} ajouté aux favoris`,
      type: isWished ? 'info' : 'success',
    });
  };

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedQuantity);
    openSidebar();
    addToast({ message: `${product.name} ajouté au panier`, type: 'success' });
  };

  const isOutOfStock = !product.is_available || product.stock_quantity === 0;
  const hasDiscount = product.is_bundle && product.original_value != null && product.original_value > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.original_value! - product.price) / product.original_value!) * 100)
    : 0;

  // ── Tags ────────────────────────────────────────────────────────────────────
  const tags: { label: string; variant: 'spec' | 'benefit' }[] = [];
  if (product.weight_grams != null) tags.push({ label: `${product.weight_grams}g`, variant: 'spec' });
  if (product.nutriscore != null) tags.push({ label: `Nutri-Score ${product.nutriscore}`, variant: 'spec' });
  for (const b of (product.attributes?.benefits || []).slice(0, 1)) {
    if (tags.length < 2) tags.push({ label: b, variant: 'benefit' });
  }

  const tagStyles = {
    spec: 'bg-white/5 text-zinc-400 border border-white/10',
    benefit: 'bg-green-neon/10 text-green-neon border border-green-neon/20',
  };

  // ── List Layout ─────────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-10px' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex flex-col sm:flex-row bg-zinc-900/40 rounded-2xl border border-white/8 overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-md hover:shadow-xl"
      >
        {/* Badges */}
        {product.is_bundle && (
          <div className="absolute top-3 left-3 z-10 bg-purple-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <Package className="w-3 h-3" /> Pack
          </div>
        )}
        {product.is_featured && !product.is_bundle && (
          <div className="absolute top-3 left-3 z-10 bg-green-neon text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-current" /> Elite
          </div>
        )}

        {/* Image */}
        <Link
          to={`/catalogue/${product.slug}`}
          className="relative block w-full sm:w-52 h-52 sm:h-auto flex-shrink-0 overflow-hidden bg-zinc-900"
        >
          <img
            src={product.image_url ?? 'https://images.unsplash.com/photo-1540331547168-8b63100a446c?w=400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs font-bold text-red-400 bg-black/60 px-3 py-1 rounded-full uppercase tracking-widest">Épuisé</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-5">
          <div className="flex-1 space-y-3">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag.label} className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tagStyles[tag.variant]}`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            <Link to={`/catalogue/${product.slug}`} className="block font-serif font-bold text-xl text-white hover:text-green-neon transition-colors leading-snug">
              {product.name}
            </Link>

            {product.description && (
              <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{product.description}</p>
            )}

            {product.avg_rating !== undefined && product.avg_rating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.avg_rating} size="sm" showCount={false} />
                <span className="text-xs text-zinc-500">({product.review_count} avis)</span>
              </div>
            )}
          </div>

          {/* Price & CTA */}
          <div className="sm:w-44 flex flex-col justify-end gap-3 sm:border-l sm:border-white/5 sm:pl-5">
            <div>
              <div className="text-2xl font-bold font-serif text-white">
                {product.price.toFixed(2)}<span className="text-green-neon ml-1 text-lg">€</span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-zinc-500 line-through">{product.original_value!.toFixed(2)}€</span>
                  <span className="text-xs font-bold text-green-neon">-{discountPct}%</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleToggleWishlist}
                className={`flex-shrink-0 w-10 h-10 rounded-xl border transition-all flex items-center justify-center ${
                  isWished ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-10 bg-green-neon text-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_18px_rgba(251,191,36,0.4)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {product.is_subscribable && (
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest">
                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Abonnement éligible
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Grid Layout ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative bg-zinc-900/50 rounded-2xl border border-white/8 overflow-hidden hover:border-zinc-700 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/30 flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.is_bundle && (
          <div className="flex items-center gap-1 bg-purple-600/90 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white">
            <Package className="w-2.5 h-2.5" /> Pack
          </div>
        )}
        {product.is_featured && !product.is_bundle && (
          <div className="flex items-center gap-1 bg-green-neon text-black px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            <Star className="w-2.5 h-2.5 fill-current" /> Elite
          </div>
        )}
        {hasDiscount && (
          <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-xl border backdrop-blur-xl transition-all duration-300 flex items-center justify-center ${
          isWished
            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
            : 'bg-zinc-950/50 border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-400/40'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-current' : ''}`} />
      </button>

      {/* Image — square */}
      <Link to={`/catalogue/${product.slug}`} className="relative block aspect-square overflow-hidden bg-zinc-900 flex-shrink-0">
        <img
          src={product.image_url ?? 'https://images.unsplash.com/photo-1540331547168-8b63100a446c?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[10px] font-bold text-red-400 bg-black/70 px-3 py-1 rounded-full uppercase tracking-widest">Épuisé</span>
          </div>
        )}

        {product.is_subscribable && (
          <div className="absolute bottom-2 right-2 w-7 h-7 bg-zinc-950/70 backdrop-blur rounded-lg border border-white/10 flex items-center justify-center text-green-neon">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag.label} className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tagStyles[tag.variant]}`}>
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <Link
          to={`/catalogue/${product.slug}`}
          className="block font-serif font-bold text-base text-white leading-snug line-clamp-2 hover:text-green-neon transition-colors duration-200"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.avg_rating !== undefined && product.avg_rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.avg_rating} size="sm" showCount={false} />
            <span className="text-[10px] text-zinc-500">({product.review_count})</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-serif text-white">
              {product.price.toFixed(2)}<span className="text-green-neon text-base ml-0.5">€</span>
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-500 line-through">{product.original_value!.toFixed(2)}€</span>
            )}
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
            isOutOfStock
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
              : 'bg-green-neon text-black hover:shadow-[0_0_16px_rgba(251,191,36,0.35)]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? 'Épuisé' : 'Ajouter au panier'}
        </button>
      </div>
    </motion.div>
  );
}
