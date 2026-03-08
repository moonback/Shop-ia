import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, TrendingUp, Sparkles, Star, User, Leaf } from 'lucide-react';
import {
  CUSTOMER_DISPLAY_STORAGE_KEY,
  useCustomerDisplayChannel,
} from '../hooks/useCustomerDisplayChannel';
import { supabase } from '../lib/supabase';

// Example payload shown before the cashier starts a live cart.
const EXAMPLE_CART_STATE = [
  { id: 'demo-1', name: "Huile d'Olive Bio", quantity: 1, unitPrice: 39.9 },
  { id: 'demo-2', name: 'Infusion Relax', quantity: 2, unitPrice: 12.5 },
  { id: 'demo-3', name: 'Gummies Nuit', quantity: 1, unitPrice: 24.0 },
];

const EXAMPLE_CUSTOMER_NAME = 'Client en caisse';
const EXAMPLE_POINTS_USED = 120;

const CURRENCY = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&q=80';

export default function CustomerDisplay() {
  const [topProducts, setTopProducts] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);

  const [displayInfo, setDisplayInfo] = useState(() => {
    try {
      const raw = window.localStorage.getItem(CUSTOMER_DISPLAY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.type === 'CART_UPDATE' && Array.isArray(parsed.cart)) {
          return {
            cart: parsed.cart,
            customerName: parsed.customerName ?? null,
            customerEmail: parsed.customerEmail ?? null,
            loyaltyPointsUsed: Number(parsed.loyaltyPointsUsed ?? 0),
            loyaltyPointsBalance: Number(parsed.loyaltyPointsBalance ?? 0),
            promoDiscount: Number(parsed.promoDiscount ?? 0),
            promoCode: parsed.promoCode ?? null,
            manualDiscountValue: Number(parsed.manualDiscountValue ?? 0),
            manualDiscountType: parsed.manualDiscountType ?? 'euro',
          };
        }
      }
    } catch {
      // Keep fallback sample state if cache is unavailable.
    }

    return {
      cart: EXAMPLE_CART_STATE,
      customerName: EXAMPLE_CUSTOMER_NAME,
      customerEmail: 'premium@greenmood.fr',
      loyaltyPointsUsed: EXAMPLE_POINTS_USED,
      loyaltyPointsBalance: 1450,
      promoDiscount: 0,
      promoCode: null,
      manualDiscountValue: 0,
      manualDiscountType: 'euro',
    };
  });

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 120000); // 2 minutes
  }, []);

  const handleChannelMessage = useCallback((payload) => {
    resetIdleTimer();
    if (payload?.type === 'CART_UPDATE' && Array.isArray(payload.cart)) {
      setDisplayInfo({
        cart: payload.cart,
        customerName: payload.customerName ?? null,
        customerEmail: payload.customerEmail ?? null,
        loyaltyPointsUsed: Number(payload.loyaltyPointsUsed ?? 0),
        loyaltyPointsBalance: Number(payload.loyaltyPointsBalance ?? 0),
        promoDiscount: Number(payload.promoDiscount ?? 0),
        promoCode: payload.promoCode ?? null,
        manualDiscountValue: Number(payload.manualDiscountValue ?? 0),
        manualDiscountType: payload.manualDiscountType ?? 'euro',
      });
    }
  }, [resetIdleTimer]);

  // Initial timer setup and user interaction listeners
  useEffect(() => {
    resetIdleTimer();
    const handleInteraction = () => resetIdleTimer();
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [resetIdleTimer]);

  // Fetch top 3 best-selling products from Supabase
  useEffect(() => {
    async function fetchTop() {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('product_id, product_name, unit_price, product:products(id, name, slug, image_url, price, cbd_percentage, attributes, category:categories(name, slug))')
          .not('product_id', 'is', null)
          .limit(300);

        if (error || !data) return;

        const counts = {};
        data.forEach(item => {
          const id = item.product_id;
          if (!id) return;
          if (!counts[id]) {
            counts[id] = {
              id,
              name: item.product?.name || item.product_name || 'Produit',
              image_url: item.product?.image_url || null,
              price: item.product?.price || item.unit_price || 0,
              cbd_percentage: item.product?.cbd_percentage || null,
              benefit: item.product?.attributes?.benefits?.[0] || item.product?.category?.name || 'Exceptionnel',
              qty: 0,
            };
          }
          counts[id].qty += 1;
        });

        const sorted = Object.values(counts)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 3);

        if (sorted.length > 0) setTopProducts(sorted);
      } catch (err) {
        console.error('Error fetching top products:', err);
      }
    }
    fetchTop();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (topProducts.length < 2) return;
    const t = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % topProducts.length);
    }, 5000);
    return () => clearInterval(t);
  }, [topProducts.length]);

  // Subscribes to BroadcastChannel updates coming from the POS window.
  useCustomerDisplayChannel({ onMessage: handleChannelMessage });

  const preparedCart = useMemo(
    () =>
      displayInfo.cart.map((line, index) => {
        const unitPrice = Number(line.unitPrice ?? 0);
        const quantity = Number(line.quantity ?? 0);
        const lineTotal = quantity * unitPrice;

        return {
          id: line.id ?? `${line.name}-${index}`,
          name: line.name ?? line.product?.name ?? 'Produit',
          quantity,
          lineTotal,
        };
      }),
    [displayInfo.cart]
  );

  const total = useMemo(
    () => preparedCart.reduce((sum, line) => sum + line.lineTotal, 0),
    [preparedCart]
  );

  const totalItems = useMemo(
    () => preparedCart.reduce((sum, line) => sum + line.quantity, 0),
    [preparedCart]
  );

  const customerLabel = displayInfo.customerName || 'Visiteur';
  const loyaltyPointsUsed = Math.max(0, Number(displayInfo.loyaltyPointsUsed || 0));
  // 100 pts = 1€
  const loyaltyValue = loyaltyPointsUsed / 100;

  // Manual discount calculation
  const manualDiscount = displayInfo.manualDiscountValue <= 0
    ? 0
    : displayInfo.manualDiscountType === 'percent'
      ? Math.min(total, (total * displayInfo.manualDiscountValue) / 100)
      : Math.min(total, displayInfo.manualDiscountValue);

  const totalPromoDiscounts = Number(displayInfo.promoDiscount || 0) + manualDiscount;
  const finalTotal = Math.max(0, total - loyaltyValue - totalPromoDiscounts);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020408] text-zinc-100 font-inter">
      {/* Premium Background */}
      <div className="pointer-events-none absolute inset-0">

        <div className="absolute inset-0 bg-gradient-to-br from-[#020408] via-transparent to-[#020408] opacity-80" />
        <div
          className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse"
          style={{ animationDuration: '12s' }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      <div className="relative mx-auto grid h-screen max-w-[1920px] grid-cols-12 gap-6 p-8">
        <section className="col-span-8 rounded-[2rem] border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-8 flex flex-col shadow-2xl shadow-black/30">
          <header className="flex items-end justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-zinc-400 mb-3">Shop-ia Gastronomie</p>
              <h1 className="text-5xl font-black tracking-tight">Bonjour {customerLabel}</h1>
            </div>

            <div className="flex gap-4 min-w-[720px]">
              <div className="flex-1 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-1">Sous-total</p>
                <p className="text-4xl font-black text-white/50 line-through decoration-white/20">{CURRENCY.format(total)}</p>
              </div>
              <div className="flex-1 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold mb-1">
                  Remises {displayInfo.promoCode ? `(${displayInfo.promoCode})` : (loyaltyPointsUsed > 0 ? `(${loyaltyPointsUsed} pts)` : '')}
                </p>
                <p className="text-4xl font-black text-red-400">
                  -{CURRENCY.format(loyaltyValue + totalPromoDiscounts)}
                </p>
              </div>
              <div className="flex-1 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold mb-1">Total Final</p>
                <p className="text-4xl font-black text-emerald-400">{CURRENCY.format(finalTotal)}</p>
              </div>
            </div>
          </header>

          <div className="mt-5 rounded-3xl border border-white/5 bg-white/[0.015] p-5 backdrop-blur-md flex items-center justify-between group hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg">
                <User size={28} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Client Privilège</span>
                  {displayInfo.customerName && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black tracking-widest border border-amber-500/20">
                      <Star size={10} fill="currentColor" /> PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-white leading-none">{customerLabel}</p>
                {displayInfo.customerEmail && (
                  <p className="text-xs font-bold text-zinc-500 mt-1.5 opacity-60">{displayInfo.customerEmail}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-8 pr-4">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-1">Total cagnotte</span>
                <p className="text-2xl font-black text-zinc-100 flex items-center justify-end gap-2">
                  {displayInfo.loyaltyPointsBalance || 0}
                  <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">pts</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex-1 overflow-hidden">
            {preparedCart.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center rounded-[3rem] border border-white/5 bg-black/40 relative overflow-hidden">
                {/* Immersive Onboarding Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-110"
                  style={{ backgroundImage: "url('/images/N10.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />

                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px]" />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                    <Leaf size={48} strokeWidth={1.5} className="animate-pulse" />
                  </div>
                  <h2 className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.4em] mb-4">Green Moon – Expérience Boutique</h2>
                  <p className="max-w-xl text-center text-5xl font-black leading-tight text-white tracking-tighter">
                    Prêt pour votre <br /><span className="text-emerald-400">bien-être ?</span>
                  </p>
                  <p className="mt-6 text-zinc-500 font-medium text-lg italic">Déposez simplement vos articles pour commencer.</p>
                </motion.div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {preparedCart.map((line, index) => (
                    <motion.article
                      key={line.id}
                      initial={{ opacity: 0, y: 28, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -26, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: 'easeOut', delay: index * 0.02 }}
                      className="mb-4 flex items-center justify-between rounded-3xl border border-white/5 bg-white/[0.02] pl-8 pr-10 py-6 group hover:bg-white/[0.04] transition-all relative overflow-hidden"
                    >
                      {/* Side accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-60" />

                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-1 group-hover:text-emerald-500 transition-colors">Article Sélectionné</span>
                        <h2 className="text-[2.2rem] font-black leading-tight text-white tracking-tight">{line.name}</h2>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-1">Quantité</span>
                          <p className="text-3xl font-black text-white/40">
                            <span className="text-xl text-zinc-500 font-bold mr-1">×</span>{line.quantity}
                          </p>
                        </div>
                        <div className="flex flex-col text-right min-w-[140px]">
                          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/50 mb-1">Prix Ligne</span>
                          <p className="text-4xl font-black text-emerald-300 tabular-nums">
                            {CURRENCY.format(line.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Detailed Discount Breakdown */}
          {(loyaltyValue > 0 || manualDiscount > 0 || displayInfo.promoDiscount > 0) && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4">
              {loyaltyValue > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Points Fidélité</span>
                  <span className="text-lg font-black text-orange-200">-{CURRENCY.format(loyaltyValue)}</span>
                </div>
              )}
              {manualDiscount > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Remises POS</span>
                  <span className="text-lg font-black text-red-200">-{CURRENCY.format(manualDiscount)}</span>
                </div>
              )}
              {displayInfo.promoDiscount > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Coupon Promo</span>
                    {displayInfo.promoCode && <span className="text-[8px] font-bold text-cyan-400/60 uppercase">{displayInfo.promoCode}</span>}
                  </div>
                  <span className="text-lg font-black text-cyan-200">-{CURRENCY.format(displayInfo.promoDiscount)}</span>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="col-span-4 flex flex-col gap-6">
          {/* Top Sales Slideshow */}
          <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-zinc-900/60 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl relative">
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-emerald-500/90 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 backdrop-blur-md">
              <TrendingUp size={14} strokeWidth={3} className="animate-bounce" />
              Sélection Élite
            </div>

            <div className="relative flex-1 bg-black/40">
              <AnimatePresence mode="wait">
                {topProducts.length > 0 ? (
                  <motion.div
                    key={topProducts[slideIndex]?.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <motion.img
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      src={topProducts[slideIndex]?.image_url || FALLBACK_IMG}
                      alt={topProducts[slideIndex]?.name}
                      className="h-full w-full object-cover opacity-50 grayscale-[0.3] group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000"
                    />
                    <div className="absolute inset-0  to-transparent" />

                    <div className="absolute bottom-10 left-8 right-8 z-10">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-wrap gap-2">
                          {topProducts[slideIndex]?.cbd_percentage && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                              CBD {topProducts[slideIndex]?.cbd_percentage}%
                            </span>
                          )}
                          <span className="bg-white/5 text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                            {topProducts[slideIndex]?.benefit}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold flex items-center gap-2">
                            <Sparkles size={12} className="animate-spin-slow" /> Populaire en ce moment
                          </p>
                          <h3 className="text-4xl font-serif font-bold italic leading-tight text-white mb-2 drop-shadow-2xl">
                            {topProducts[slideIndex]?.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                          <p className="text-3xl font-black text-emerald-400 flex items-baseline gap-1">
                            {CURRENCY.format(topProducts[slideIndex]?.price)}
                          </p>
                          <div className="flex gap-2">
                            {topProducts.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setSlideIndex(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${i === slideIndex ? 'w-10 bg-emerald-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Analyse des tendances...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>


          </div>

          <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Star size={24} fill="currentColor" />
            </div>
            <p className="text-lg font-bold leading-tight text-emerald-100 italic">
              "Merci de votre confiance, profitez de nos offres exclusives !"
            </p>
          </div>
        </aside>
      </div>

      {/* Boutique Screensaver (Idle Mode) */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020408] overflow-hidden"
          >
            {/* Immersive Screensaver Background */}
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.15] mix-blend-luminosity scale-105"
                style={{ backgroundImage: "url('/images/N10.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
              <div
                className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse"
                style={{ animationDuration: '10s' }}
              />
              <div
                className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"
                style={{ animationDuration: '12s' }}
              />
            </div>

            <motion.div
              animate={{
                y: [0, -20, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full scale-125" />
                <img
                  src="/logo.jpeg"
                  alt="Green Moon Logo"
                  className="relative h-[500px] w-[500px] object-cover rounded-full shadow-[0_0_80px_rgba(16,185,129,0.15)] border-4 border-white/5"
                />
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-16 flex flex-col items-center"
              >
                <div className="flex items-center gap-6 text-emerald-400 mb-6">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Leaf size={8} />
                  </div>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent to-emerald-400/50" />
                  <span className="text-xl font-black tracking-[0.5em] uppercase">Bien-Être Botanique</span>
                  <div className="h-px w-24 bg-gradient-to-l from-transparent to-emerald-400/50" />
                  <div className="h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <Leaf size={8} />
                  </div>
                </div>
                <h2 className="text-zinc-500 text-3xl uppercase font-black tracking-[0.8em] animate-pulse">
                  Green Moon CBD
                </h2>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
