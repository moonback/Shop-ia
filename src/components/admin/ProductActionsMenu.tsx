import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronDown,
    Upload,
    FileDown,
    FileUp,
    Sparkles,
    Brain,
    ShoppingBag,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../lib/utils';
import { FOOD_PRODUCTS } from '../../lib/generateFoodProducts';
import type { Product } from '../../lib/types';

interface Progress { done: number; total: number }

interface ProductActionsMenuProps {
    products: Product[];
    onRefresh: () => void;

    onEnrich: () => void;
    isSyncingAI: boolean;
    aiSyncProgress: Progress | null;
    enrichCount: number;

    onSyncVectors: () => void;
    isSyncingVectors: boolean;
    vectorSyncProgress: Progress | null;
    missingVectorsCount: number;

    onGenerateFood: () => void;
    isGeneratingFood: boolean;
    foodProgress: Progress | null;

    onNewProduct: () => void;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
    return (
        <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            {children}
        </p>
    );
}

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick?: () => void;
    disabled?: boolean;
    isRunning?: boolean;
    progress?: Progress | null;
    iconColor?: string;
    hoverBg?: string;
    as?: 'button' | 'a';
    href?: string;
    download?: boolean;
}

function MenuItem({
    icon: Icon,
    label,
    description,
    onClick,
    disabled,
    isRunning,
    progress,
    iconColor = 'text-zinc-400',
    hoverBg = 'hover:bg-zinc-800',
    as: Tag = 'button',
    href,
    download,
}: MenuItemProps) {
    const content = (
        <div className="flex items-center gap-3 w-full">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-zinc-800/80 ${iconColor}`}>
                {isRunning
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Icon className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-200 truncate">{label}</span>
                    {isRunning && progress && (
                        <span className="text-[10px] font-black text-green-neon bg-green-neon/10 px-1.5 py-0.5 rounded-full">
                            {progress.done}/{progress.total}
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{description}</p>
            </div>
        </div>
    );

    const cls = `w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
        ${hoverBg} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`;

    if (Tag === 'a') {
        return (
            <a href={href} download={download} className={cls} onClick={onClick}>
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cls}
        >
            {content}
        </button>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProductActionsMenu({
    products,
    onRefresh,
    onEnrich,
    isSyncingAI,
    aiSyncProgress,
    enrichCount,
    onSyncVectors,
    isSyncingVectors,
    vectorSyncProgress,
    missingVectorsCount,
    onGenerateFood,
    isGeneratingFood,
    foodProgress,
    onNewProduct,
}: ProductActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const [isImportingCSV, setIsImportingCSV] = useState(false);
    const [toast, setToast] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

    const isAnyRunning = isSyncingAI || isSyncingVectors || isGeneratingFood || isImportingCSV;

    // Click outside to close
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto-dismiss toast after 4s
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    // ─── CSV Import ─────────────────────────────────────────────────────────────
    const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImportingCSV(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const data = results.data as Record<string, string>[];
                    const { data: cats, error: catError } = await supabase
                        .from('categories')
                        .select('id, slug');
                    if (catError) throw catError;

                    const catMap = new Map(cats?.map(c => [c.slug.trim().toLowerCase(), c.id]));

                    const rows = data.map((row, idx) => {
                        const rawSlug = (row.category_slug || '').trim().toLowerCase();
                        const categoryId = catMap.get(rawSlug);
                        if (!categoryId) {
                            throw new Error(`Ligne ${idx + 2} : catégorie "${rawSlug}" introuvable. Importez les catégories d'abord.`);
                        }
                        return {
                            category_id: categoryId,
                            name: row.name,
                            slug: row.slug || slugify(row.name),
                            sku: row.sku || null,
                            brand: row.brand || null,
                            description: row.description || null,
                            price: parseFloat(row.price) || 0,
                            original_value: row.original_value ? parseFloat(row.original_value) : null,
                            stock_quantity: parseInt(row.stock_quantity) || 0,
                            nutriscore: row.nutriscore || null,
                            weight_info: row.weight_info || null,
                            weight_grams: row.weight_grams ? parseFloat(row.weight_grams) : null,
                            unit_label: row.unit_label || 'unit',
                            is_available: row.is_available === 'true' || row.is_available === '1',
                            is_active: row.is_active !== 'false' && row.is_active !== '0',
                            is_featured: row.is_featured === 'true' || row.is_featured === '1',
                            is_bundle: row.is_bundle === 'true' || row.is_bundle === '1',
                            image_url: row.image_url || null,
                            attributes: { benefits: [], aromas: [] },
                        };
                    });

                    const { error } = await supabase
                        .from('products')
                        .upsert(rows, { onConflict: 'slug' });
                    if (error) throw error;

                    setToast({ type: 'success', msg: `${data.length} produit(s) importé(s) avec succès.` });
                    onRefresh();
                    if (csvInputRef.current) csvInputRef.current.value = '';
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erreur lors de l\'importation.';
                    setToast({ type: 'error', msg });
                } finally {
                    setIsImportingCSV(false);
                }
            },
            error: () => {
                setToast({ type: 'error', msg: 'Impossible de lire le fichier CSV.' });
                setIsImportingCSV(false);
            },
        });
    };

    // ─── CSV Export ─────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (products.length === 0) {
            setToast({ type: 'error', msg: 'Aucun produit à exporter.' });
            return;
        }
        const rows = products.map(p => ({
            name: p.name,
            slug: p.slug,
            sku: p.sku ?? '',
            brand: p.brand ?? '',
            category_slug: (p.category as { slug?: string } | undefined)?.slug ?? '',
            price: p.price,
            original_value: p.original_value ?? '',
            stock_quantity: p.stock_quantity,
            unit_label: p.unit_label ?? 'unit',
            description: p.description ?? '',
            nutriscore: p.nutriscore ?? '',
            weight_info: p.weight_info ?? '',
            weight_grams: p.weight_grams ?? '',
            is_available: p.is_available,
            is_active: p.is_active,
            is_featured: p.is_featured,
            is_bundle: p.is_bundle,
            image_url: p.image_url ?? '',
        }));
        const csv = Papa.unparse(rows);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setToast({ type: 'success', msg: `${products.length} produit(s) exporté(s).` });
        setOpen(false);
    };

    const close = () => setOpen(false);

    return (
        <>
            <div className="relative" ref={menuRef}>
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border relative
                        ${open
                            ? 'bg-zinc-700 border-zinc-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                >
                    {isAnyRunning && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-neon rounded-full shadow-[0_0_6px_rgba(57,255,20,0.8)] animate-pulse" />
                    )}
                    <span>Actions</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/70 z-50 overflow-hidden"
                        >
                            {/* ── Données ───────────────────────────────── */}
                            <div className="px-2 pt-1">
                                <SectionLabel>Données</SectionLabel>
                                <MenuItem
                                    icon={Upload}
                                    label="Importer CSV"
                                    description="Ajouter ou mettre à jour des produits"
                                    isRunning={isImportingCSV}
                                    progress={null}
                                    iconColor="text-blue-400"
                                    onClick={() => { csvInputRef.current?.click(); close(); }}
                                    disabled={isImportingCSV}
                                />
                                <MenuItem
                                    icon={FileUp}
                                    label={`Exporter CSV (${products.length})`}
                                    description="Télécharger le catalogue actuel"
                                    iconColor="text-emerald-400"
                                    onClick={handleExportCSV}
                                />
                                <MenuItem
                                    as="a"
                                    icon={FileDown}
                                    label="Exemple CSV"
                                    description="Modèle vierge pour l'importation"
                                    iconColor="text-zinc-400"
                                    href="/examples/products_example.csv"
                                    download
                                    onClick={close}
                                />
                            </div>

                            <div className="mx-4 my-2 border-t border-zinc-800/80" />

                            {/* ── Intelligence IA ───────────────────────── */}
                            <div className="px-2">
                                <SectionLabel>Intelligence IA</SectionLabel>
                                <MenuItem
                                    icon={Sparkles}
                                    label={
                                        isSyncingAI && aiSyncProgress
                                            ? `Enrichissement… ${aiSyncProgress.done}/${aiSyncProgress.total}`
                                            : `Enrich. IA (${enrichCount})`
                                    }
                                    description="Descriptions, nutriscore et attributs"
                                    isRunning={isSyncingAI}
                                    progress={aiSyncProgress}
                                    iconColor="text-purple-400"
                                    hoverBg="hover:bg-purple-500/10"
                                    disabled={enrichCount === 0 || isSyncingAI}
                                    onClick={() => { onEnrich(); close(); }}
                                />
                                <MenuItem
                                    icon={Brain}
                                    label={
                                        isSyncingVectors && vectorSyncProgress
                                            ? `Vectorisation… ${vectorSyncProgress.done}/${vectorSyncProgress.total}`
                                            : `Sync IA manquante (${missingVectorsCount})`
                                    }
                                    description="Génère les vecteurs de recherche sémantique"
                                    isRunning={isSyncingVectors}
                                    progress={vectorSyncProgress}
                                    iconColor="text-cyan-400"
                                    hoverBg="hover:bg-cyan-500/10"
                                    disabled={missingVectorsCount === 0 || isSyncingVectors}
                                    onClick={() => { onSyncVectors(); close(); }}
                                />
                            </div>

                            <div className="mx-4 my-2 border-t border-zinc-800/80" />

                            {/* ── Génération ────────────────────────────── */}
                            <div className="px-2">
                                <SectionLabel>Génération</SectionLabel>
                                <MenuItem
                                    icon={ShoppingBag}
                                    label={
                                        isGeneratingFood && foodProgress
                                            ? `Génération… ${foodProgress.done}/${foodProgress.total}`
                                            : `Générer Alim (${FOOD_PRODUCTS.length})`
                                    }
                                    description="Créer 20 produits alimentaires variés"
                                    isRunning={isGeneratingFood}
                                    progress={foodProgress}
                                    iconColor="text-orange-400"
                                    hoverBg="hover:bg-orange-500/10"
                                    disabled={isGeneratingFood}
                                    onClick={() => { onGenerateFood(); close(); }}
                                />
                            </div>

                            <div className="mx-4 my-2 border-t border-zinc-800/80" />

                            {/* ── Nouveau produit ───────────────────────── */}
                            <div className="px-2 pb-2">
                                <button
                                    type="button"
                                    onClick={() => { onNewProduct(); close(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-neon/10 hover:bg-green-neon/20 border border-green-neon/20 text-green-neon transition-all"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-green-neon/20 flex items-center justify-center shrink-0">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">Nouveau produit</p>
                                        <p className="text-[11px] text-green-neon/60">Créer manuellement</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    type="file"
                    ref={csvInputRef}
                    onChange={handleCSVImport}
                    accept=".csv"
                    className="hidden"
                />
            </div>

            {/* Toast notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-black/40 border text-sm font-medium max-w-sm
                            ${toast.type === 'error'
                                ? 'bg-zinc-950 border-red-500/30 text-red-400'
                                : 'bg-zinc-950 border-green-neon/30 text-green-400'
                            }`}
                    >
                        {toast.type === 'error'
                            ? <AlertCircle className="w-4 h-4 shrink-0" />
                            : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        <span className="flex-1">{toast.msg}</span>
                        <button
                            type="button"
                            onClick={() => setToast(null)}
                            className="opacity-50 hover:opacity-100 transition-opacity ml-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
