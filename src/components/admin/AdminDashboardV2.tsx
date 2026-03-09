import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  Grid3x3,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  LayoutDashboard,
  Receipt,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Order, Product, Profile } from '../../lib/types';

// Types pour les widgets
interface WidgetConfig {
  id: string;
  type: 'kpi' | 'chart' | 'list' | 'alert' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  isMinimized: boolean;
  isVisible: boolean;
  data?: any;
}

interface DashboardStats {
  totalRevenue: number;
  revenueThisMonth: number;
  ordersTotal: number;
  ordersToday: number;
  ordersPending: number;
  productsLowStock: number;
  productsOutOfStock: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts?: Product[];
  conversionRate?: number;
  avgOrderValue?: number;
}

interface AdminDashboardV2Props {
  stats: DashboardStats;
  onViewOrders: () => void;
  onViewStock: () => void;
}

// Widget templates par défaut
const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'revenue-kpi',
    type: 'kpi',
    title: 'Chiffre d\'affaires',
    size: 'medium',
    position: { x: 0, y: 0 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'orders-kpi',
    type: 'kpi',
    title: 'Commandes',
    size: 'medium',
    position: { x: 1, y: 0 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'customers-kpi',
    type: 'kpi',
    title: 'Clients',
    size: 'small',
    position: { x: 2, y: 0 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'avg-order-kpi',
    type: 'kpi',
    title: 'Panier Moyen',
    size: 'small',
    position: { x: 3, y: 0 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'stock-alerts',
    type: 'alert',
    title: 'Alertes Stock',
    size: 'small',
    position: { x: 4, y: 0 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'recent-orders',
    type: 'list',
    title: 'Commandes Récentes',
    size: 'large',
    position: { x: 0, y: 1 },
    isMinimized: false,
    isVisible: true,
  },
  {
    id: 'revenue-chart',
    type: 'chart',
    title: 'Évolution CA',
    size: 'large',
    position: { x: 2, y: 1 },
    isMinimized: false,
    isVisible: true,
  },
];

function loadWidgetsFromStorage(): WidgetConfig[] {
  try {
    const saved = localStorage.getItem('admin-widgets');
    if (saved) {
      const parsed = JSON.parse(saved) as WidgetConfig[];
      // Merge with defaults to handle new widgets added after save
      const savedIds = new Set(parsed.map((w) => w.id));
      const newDefaults = DEFAULT_WIDGETS.filter((w) => !savedIds.has(w.id));
      return [...parsed, ...newDefaults];
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDGETS;
}

export default function AdminDashboardV2({ stats, onViewOrders, onViewStock }: AdminDashboardV2Props) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadWidgetsFromStorage);
  const [isEditMode, setIsEditMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Tailles de widgets
  const widgetSizes = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
    full: 'col-span-4 row-span-2',
  };

  // Grille responsive
  const gridCols = compactMode ? 'grid-cols-2' : 'grid-cols-4';

  // Données chart : revenus des 7 derniers jours depuis recentOrders
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      days[key] = 0;
    }
    (stats.recentOrders ?? []).forEach((order) => {
      const d = new Date(order.created_at);
      const key = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      if (key in days) {
        days[key] += Number(order.total ?? 0);
      }
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
  }, [stats.recentOrders]);

  const avgOrderValue = useMemo(
    () => stats.avgOrderValue ?? (stats.ordersTotal > 0 ? stats.totalRevenue / stats.ordersTotal : 0),
    [stats]
  );

  // Gestion du réordonnancement
  const handleReorder = useCallback((newOrder: WidgetConfig[]) => {
    const reordered = newOrder.map((widget, index) => ({
      ...widget,
      position: {
        x: index % (compactMode ? 2 : 4),
        y: Math.floor(index / (compactMode ? 2 : 4)),
      },
    }));
    setWidgets(reordered);
    localStorage.setItem('admin-widgets', JSON.stringify(reordered));
  }, [compactMode]);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w));
      localStorage.setItem('admin-widgets', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleWidgetMinimize = useCallback((widgetId: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => (w.id === widgetId ? { ...w, isMinimized: !w.isMinimized } : w));
      localStorage.setItem('admin-widgets', JSON.stringify(next));
      return next;
    });
  }, []);

  const addWidget = useCallback(() => {
    const newWidget: WidgetConfig = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'Nouveau Widget',
      size: 'medium',
      position: { x: 0, y: 0 },
      isMinimized: false,
      isVisible: true,
    };
    setWidgets((prev) => {
      const next = [...prev, newWidget];
      localStorage.setItem('admin-widgets', JSON.stringify(next));
      return next;
    });
  }, []);

  // Widget KPI Component
  const KPIWidget = ({ widget }: { widget: WidgetConfig }) => {
    const getKPIData = () => {
      switch (widget.id) {
        case 'revenue-kpi':
          return {
            value: `${stats.totalRevenue.toFixed(2)} €`,
            sub: `${stats.revenueThisMonth.toFixed(2)} € ce mois`,
            change: null,
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10 border-green-400/20',
            accent: 'from-green-500/10',
          };
        case 'orders-kpi':
          return {
            value: stats.ordersTotal,
            sub: `${stats.ordersToday} aujourd'hui · ${stats.ordersPending} en attente`,
            change: null,
            icon: Package,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10 border-blue-400/20',
            accent: 'from-blue-500/10',
          };
        case 'customers-kpi':
          return {
            value: stats.totalCustomers,
            sub: 'clients inscrits',
            change: null,
            icon: Users,
            color: 'text-purple-400',
            bgColor: 'bg-purple-400/10 border-purple-400/20',
            accent: 'from-purple-500/10',
          };
        case 'avg-order-kpi':
          return {
            value: `${avgOrderValue.toFixed(2)} €`,
            sub: 'panier moyen',
            change: null,
            icon: Receipt,
            color: 'text-amber-400',
            bgColor: 'bg-amber-400/10 border-amber-400/20',
            accent: 'from-amber-500/10',
          };
        default:
          return {
            value: '—',
            sub: 'Donnée indisponible',
            change: null,
            icon: Activity,
            color: 'text-zinc-400',
            bgColor: 'bg-zinc-400/10 border-zinc-400/20',
            accent: 'from-zinc-500/10',
          };
      }
    };

    const kpiData = getKPIData();
    const Icon = kpiData.icon;

    return (
      <div className={`h-full p-6 rounded-2xl border transition-all duration-300 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-600 relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${kpiData.accent} to-transparent pointer-events-none`} />
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${kpiData.bgColor}`}>
            <Icon className={`w-6 h-6 ${kpiData.color}`} />
          </div>
        </div>
        <div className="relative z-10">
          <div className="text-2xl font-bold text-white">{kpiData.value}</div>
          <div className="text-sm text-zinc-400 mt-1">{kpiData.sub}</div>
        </div>
      </div>
    );
  };

  // Widget Alert Component
  const AlertWidget = ({ widget }: { widget: WidgetConfig }) => {
    const alerts = [
      {
        type: 'error',
        count: stats.productsOutOfStock,
        label: 'Rupture de stock',
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10 border-red-400/20',
        btnColor: 'bg-red-500 hover:bg-red-400 text-white',
      },
      {
        type: 'warning',
        count: stats.productsLowStock,
        label: 'Stock faible',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10 border-yellow-400/20',
        btnColor: 'bg-yellow-500 hover:bg-yellow-400 text-black',
      },
    ].filter((alert) => alert.count > 0);

    return (
      <div className="h-full p-6 rounded-2xl border bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-600 transition-all">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Alertes Stock</h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-zinc-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tout est en ordre</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.type} className={`flex items-center gap-3 p-3 rounded-xl border ${alert.bgColor}`}>
                  <Icon className={`w-5 h-5 ${alert.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{alert.label}</div>
                    <div className="text-xs text-zinc-400">{alert.count} produit{alert.count > 1 ? 's' : ''}</div>
                  </div>
                  <button
                    onClick={() => onViewStock()}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${alert.btnColor}`}
                  >
                    Voir
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Widget List Component
  const ListWidget = () => {
    return (
      <div className="h-full p-6 rounded-2xl border bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Commandes Récentes</h3>
          <button
            onClick={() => onViewOrders()}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-green-neon text-black hover:bg-green-400"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          {(stats.recentOrders ?? []).slice(0, 6).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium text-white text-sm">#{order.id?.slice(0, 8).toUpperCase()}</div>
                <div className="text-xs text-zinc-500 truncate">{order.profile?.full_name || 'Client anonyme'}</div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="font-semibold text-white text-sm">{Number(order.total).toFixed(2)} €</div>
                <div className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Widget Chart Component avec Recharts
  const ChartWidget = () => {
    return (
      <div className="h-full p-6 rounded-2xl border bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Évolution CA — 7 jours</h3>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff' }}
                labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                formatter={(value: number) => [`${value.toFixed(2)} €`, 'CA']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#fbbf24"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ fill: '#fbbf24', r: 3 }}
                activeDot={{ r: 5, fill: '#fbbf24' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Rendu du widget selon son type
  const renderWidget = (widget: WidgetConfig) => {
    if (!widget.isVisible) return null;

    const widgetContent = () => {
      switch (widget.type) {
        case 'kpi':
          return <KPIWidget widget={widget} />;
        case 'alert':
          return <AlertWidget widget={widget} />;
        case 'list':
          return <ListWidget />;
        case 'chart':
          return <ChartWidget />;
        default:
          return (
            <div className="h-full p-6 rounded-2xl border flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
              <div className="text-center text-zinc-400">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Widget personnalisé</p>
              </div>
            </div>
          );
      }
    };

    return (
      <motion.div
        layout
        className={`${widgetSizes[widget.size]} relative group ${widget.isMinimized ? 'row-span-1' : ''}`}
        whileHover={{ scale: isEditMode ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
      >
        {/* Controls en mode édition */}
        {isEditMode && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleWidgetMinimize(widget.id)}
              className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400"
            >
              {widget.isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!widget.isMinimized ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {widgetContent()}
            </motion.div>
          ) : (
            <motion.div
              key="minimized"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full p-4 rounded-2xl border flex items-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
              <p className="text-xs font-medium text-zinc-500 truncate">{widget.title}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-zinc-500 font-medium">
          {widgets.filter((w) => w.isVisible).length} widget{widgets.filter((w) => w.isVisible).length > 1 ? 's' : ''} actif{widgets.filter((w) => w.isVisible).length > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompactMode(!compactMode)}
            className="px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 text-xs font-medium"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            {compactMode ? 'Normal' : 'Compact'}
          </button>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors text-xs font-medium ${
              isEditMode
                ? 'bg-green-neon text-black border-green-neon'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {isEditMode ? 'Terminer' : 'Personnaliser'}
          </button>
          {isEditMode && (
            <button
              onClick={addWidget}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 transition-colors flex items-center gap-2 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Widget
            </button>
          )}
        </div>
      </div>

      {/* Grille de widgets */}
      <AnimatePresence mode="wait">
        {isEditMode ? (
          <Reorder.Group
            axis="y"
            values={widgets.filter((w) => w.isVisible)}
            onReorder={handleReorder}
            className={`grid ${gridCols} gap-4 auto-rows-[minmax(140px,auto)]`}
          >
            {widgets.filter((w) => w.isVisible).map((widget) => (
              <Reorder.Item key={widget.id} value={widget} className="cursor-move">
                {renderWidget(widget)}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className={`grid ${gridCols} gap-4 auto-rows-[minmax(140px,auto)]`}>
            {widgets.filter((w) => w.isVisible).map((widget) => (
              <div key={widget.id}>{renderWidget(widget)}</div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Widgets masqués */}
      {isEditMode && widgets.some((w) => !w.isVisible) && (
        <div className="p-4 rounded-2xl border bg-zinc-900/60 border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Widgets masqués</h3>
          <div className="flex flex-wrap gap-2">
            {widgets.filter((w) => !w.isVisible).map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidgetVisibility(widget.id)}
                className="px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-colors bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs"
              >
                <Eye className="w-3 h-3" />
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
