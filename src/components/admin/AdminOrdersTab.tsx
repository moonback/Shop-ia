import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Package,
    Store,
    Truck,
    ShoppingBag,
    Users,
    MapPin,
    Download,
    Filter,
    RotateCcw,
    Calendar,
} from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem } from '../../lib/types';

const ORDER_STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente', color: 'text-yellow-400 bg-yellow-900/30 border-yellow-800' },
    { value: 'paid', label: 'Payé', color: 'text-blue-400 bg-blue-900/30 border-blue-800' },
    { value: 'processing', label: 'En préparation', color: 'text-purple-400 bg-purple-900/30 border-purple-800' },
    { value: 'ready', label: 'Prêt à retirer', color: 'text-green-400 bg-green-900/30 border-green-800' },
    { value: 'shipped', label: 'En livraison', color: 'text-sky-400 bg-sky-900/30 border-sky-800' },
    { value: 'delivered', label: 'Livré', color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800' },
    { value: 'cancelled', label: 'Annulé', color: 'text-red-400 bg-red-900/30 border-red-800' },
];

const DELIVERY_TYPE_OPTIONS = [
    { value: 'all', label: 'Tous les types' },
    { value: 'click_collect', label: 'Click & Collect' },
    { value: 'delivery', label: 'Livraison' },
    { value: 'in_store', label: 'Vente Boutique' },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: 'all', label: 'Tous les paiements' },
    { value: 'pending', label: 'En attente' },
    { value: 'paid', label: 'Payé' },
    { value: 'failed', label: 'Échoué' },
    { value: 'refunded', label: 'Remboursé' },
];

interface AdminOrdersTabProps {
    orders: Order[];
    onRefresh: () => void;
    storeName: string;
    storeAddress: string;
}

export default function AdminOrdersTab({ orders, onRefresh, storeName, storeAddress }: AdminOrdersTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', orderId);
        onRefresh();
    };

    const activeFiltersCount = [
        searchQuery !== '',
        orderStatusFilter !== 'all',
        deliveryTypeFilter !== 'all',
        paymentStatusFilter !== 'all',
        dateFrom !== '',
        dateTo !== '',
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSearchQuery('');
        setOrderStatusFilter('all');
        setDeliveryTypeFilter('all');
        setPaymentStatusFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const filteredOrders = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return orders.filter((order) => {
            const matchesSearch =
                !q ||
                order.id.toLowerCase().includes(q) ||
                (order.profile?.full_name ?? '').toLowerCase().includes(q);

            const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
            const matchesDelivery = deliveryTypeFilter === 'all' || order.delivery_type === deliveryTypeFilter;
            const matchesPayment = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;

            const orderDate = new Date(order.created_at);
            const matchesFrom = !dateFrom || orderDate >= new Date(dateFrom);
            const matchesTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

            return matchesSearch && matchesStatus && matchesDelivery && matchesPayment && matchesFrom && matchesTo;
        });
    }, [orders, searchQuery, orderStatusFilter, deliveryTypeFilter, paymentStatusFilter, dateFrom, dateTo]);

    const exportCSV = () => {
        const rows = filteredOrders.map((order) => ({
            ID: order.id,
            Client: order.profile?.full_name ?? 'Inconnu',
            Téléphone: order.profile?.phone ?? '',
            Date: new Date(order.created_at).toLocaleString('fr-FR'),
            Statut: ORDER_STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status,
            'Type livraison': DELIVERY_TYPE_OPTIONS.find((d) => d.value === order.delivery_type)?.label ?? order.delivery_type,
            Paiement: order.payment_status,
            'Sous-total (€)': order.subtotal?.toFixed(2) ?? '0.00',
            'Livraison (€)': order.delivery_fee?.toFixed(2) ?? '0.00',
            'Total (€)': order.total.toFixed(2),
            'Points fidélité': order.loyalty_points_earned ?? 0,
        }));

        const csv = Papa.unparse(rows, { delimiter: ';' });
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {/* Filtres */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                {/* Ligne 1 : recherche + export */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par n° ou nom client…"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-primary"
                        />
                    </div>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exporter CSV
                    </button>
                </div>

                {/* Ligne 2 : filtres avancés */}
                <div className="flex gap-2 flex-wrap items-center">
                    <Filter className="w-4 h-4 text-zinc-500 shrink-0" />

                    <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                    >
                        <option value="all">Tous les statuts</option>
                        {ORDER_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    <select
                        value={deliveryTypeFilter}
                        onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                    >
                        {DELIVERY_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                    >
                        {PAYMENT_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                        />
                        <span className="text-zinc-600 text-xs">→</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                        />
                    </div>

                    {activeFiltersCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Réinitialiser
                            <span className="bg-red-900/60 text-red-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                                {activeFiltersCount}
                            </span>
                        </button>
                    )}
                </div>

                {/* Compteur */}
                <div className="text-xs text-zinc-500">
                    {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
                    {activeFiltersCount > 0 && ` · ${orders.length} au total`}
                </div>
            </div>

            {/* Liste commandes */}
            <div className="space-y-2">
                {filteredOrders.length === 0 && (
                    <p className="text-zinc-500 text-center py-10">Aucune commande ne correspond aux filtres.</p>
                )}
                {filteredOrders.map((order) => {
                    const st = ORDER_STATUS_OPTIONS.find((s) => s.value === order.status);
                    const isExpanded = expandedOrder === order.id;
                    const items = order.order_items as OrderItem[] | undefined;
                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/40 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-white text-sm">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-sm font-medium text-green-neon mt-0.5">
                                            {order.profile?.full_name ?? 'Client ID: ' + (order.user_id?.slice(0, 8) ?? 'Inconnu')}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full border hidden sm:inline-flex ${order.delivery_type === 'click_collect'
                                            ? 'text-purple-400 bg-purple-900/20 border-purple-800'
                                            : order.delivery_type === 'in_store'
                                                ? 'text-orange-400 bg-orange-900/20 border-orange-800'
                                                : 'text-sky-400 bg-sky-900/20 border-sky-800'
                                            }`}
                                    >
                                        {order.delivery_type === 'click_collect' ? (
                                            <span className="flex items-center gap-1"><Store className="w-3 h-3" />Click & Collect</span>
                                        ) : order.delivery_type === 'in_store' ? (
                                            <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />Vente Boutique</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Truck className="w-3 h-3" />Livraison</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${st?.color ?? ''}`}>
                                        {st?.label ?? order.status}
                                    </span>
                                    <span className="font-bold text-white">{order.total.toFixed(2)} €</span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-zinc-800 p-5 space-y-6">
                                    {/* Informations Client */}
                                    <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Users className="w-3 h-3 text-green-neon" />
                                            Informations Client
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase">Nom Complet</p>
                                                <p className="text-sm font-semibold text-white">{order.profile?.full_name ?? 'Non renseigné'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase">Téléphone / Contact</p>
                                                <p className="text-sm font-semibold text-white">{order.profile?.phone ?? 'Aucun numéro'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Adresse de Livraison */}
                                    <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-green-neon" />
                                            {order.delivery_type === 'click_collect' ? 'Point de retrait' : 'Adresse de Livraison'}
                                        </h3>
                                        {(() => {
                                            const addr = order.address || (order.profile as any)?.addresses?.[0];

                                            if (order.delivery_type === 'in_store') {
                                                return (
                                                    <div className="flex items-start gap-3">
                                                        <ShoppingBag className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">Vente Boutique — Direct</p>
                                                            <p className="text-xs text-zinc-400">{storeName} — {storeAddress}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (order.delivery_type === 'click_collect') {
                                                return (
                                                    <div className="flex items-start gap-3">
                                                        <Store className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">Click & Collect — Boutique Shop-ia</p>
                                                            <p className="text-xs text-zinc-400">{storeAddress || '123 Rue de la Nature, 75000 Paris'}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (addr) {
                                                return (
                                                    <div className="grid grid-cols-1 gap-1">
                                                        <p className="text-sm font-semibold text-white">{addr.street}</p>
                                                        <p className="text-sm text-zinc-300">
                                                            {addr.postal_code} {addr.city}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 uppercase tracking-tight">{addr.country || 'France'}</p>
                                                        {!order.address && (
                                                            <p className="text-[10px] text-orange-400 font-medium mt-1 italic">
                                                                Affichage de l'adresse par défaut du profil utilisateur.
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return <p className="text-sm text-zinc-500 italic">Aucune adresse renseignée</p>;
                                        })()}
                                    </div>

                                    {/* Order lines */}
                                    <div className="space-y-1.5">
                                        {(items ?? []).map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-zinc-400">
                                                    {item.product_name} ×{item.quantity}
                                                </span>
                                                <span className="text-white">{item.total_price.toFixed(2)} €</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-zinc-700 pt-2 space-y-1">
                                            <div className="flex justify-between text-xs text-zinc-500">
                                                <span>Livraison</span>
                                                <span>{order.delivery_fee === 0 ? 'Gratuit' : `${order.delivery_fee.toFixed(2)} €`}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-white">
                                                <span>Total</span>
                                                <span>{order.total.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & metadata */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-zinc-400">Statut :</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-green-primary"
                                            >
                                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-4 text-xs text-zinc-500 flex-wrap">
                                            <span>
                                                Paiement :{' '}
                                                <span className={order.payment_status === 'paid' ? 'text-green-400' : 'text-orange-400'}>
                                                    {order.payment_status}
                                                </span>
                                            </span>
                                            {order.viva_order_code && <span>Réf : {order.viva_order_code}</span>}
                                            {order.loyalty_points_earned > 0 && (
                                                <span className="text-yellow-400">+{order.loyalty_points_earned} pts fidélité</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
