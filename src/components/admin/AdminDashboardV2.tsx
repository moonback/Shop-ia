import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  RefreshCw,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  X,
  Plus,
  LayoutDashboard,
} from 'lucide-react';
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
    id: 'stock-alerts',
    type: 'alert',
    title: 'Alertes Stock',
    size: 'small',
    position: { x: 3, y: 0 },
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

export default function AdminDashboardV2({ stats, onViewOrders, onViewStock }: AdminDashboardV2Props) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
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

  // Gestion du réordonnancement
  const handleReorder = useCallback((newOrder: WidgetConfig[]) => {
    // Recalculer les positions
    const reordered = newOrder.map((widget, index) => ({
      ...widget,
      position: {
        x: index % (compactMode ? 2 : 4),
        y: Math.floor(index / (compactMode ? 2 : 4)),
      },
    }));
    setWidgets(reordered);
    // Sauvegarder dans localStorage
    localStorage.setItem('admin-widgets', JSON.stringify(reordered));
  }, [compactMode]);

  // Toggle visibilité widget
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setWidgets(prev => 
      prev.map(w => 
        w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
      )
    );
  }, []);

  // Toggle minimisation widget
  const toggleWidgetMinimize = useCallback((widgetId: string) => {
    setWidgets(prev => 
      prev.map(w => 
        w.id === widgetId ? { ...w, isMinimized: !w.isMinimized } : w
      )
    );
  }, []);

  // Ajouter widget
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
    setWidgets(prev => [...prev, newWidget]);
  }, []);

  // Widget KPI Component
  const KPIWidget = ({ widget, data }: { widget: WidgetConfig; data?: any }) => {
    const getKPIData = () => {
      switch (widget.id) {
        case 'revenue-kpi':
          return {
            value: `${stats.totalRevenue.toFixed(2)} €`,
            sub: `${stats.revenueThisMonth.toFixed(2)} € ce mois`,
            change: 12.5,
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10 border-green-400/20',
          };
        case 'orders-kpi':
          return {
            value: stats.ordersTotal,
            sub: `${stats.ordersToday} aujourd'hui`,
            change: 8.2,
            icon: Package,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10 border-blue-400/20',
          };
        case 'customers-kpi':
          return {
            value: stats.totalCustomers,
            sub: 'clients inscrits',
            change: 15.3,
            icon: Users,
            color: 'text-purple-400',
            bgColor: 'bg-purple-400/10 border-purple-400/20',
          };
        default:
          return {
            value: '0',
            sub: 'Donnée indisponible',
            change: 0,
            icon: Activity,
            color: 'text-zinc-400',
            bgColor: 'bg-zinc-400/10 border-zinc-400/20',
          };
      }
    };

    const kpiData = getKPIData();
    const Icon = kpiData.icon;

    return (
      <div className={`h-full p-6 rounded-2xl border transition-all duration-300 bg-zinc-900/90 border-zinc-800 hover:border-zinc-700`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${kpiData.bgColor}`}>
            <Icon className={`w-6 h-6 ${kpiData.color}`} />
          </div>
          <div className="flex items-center gap-1">
            {kpiData.change > 0 && (
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{kpiData.change}%</span>
              </div>
            )}
            {kpiData.change < 0 && (
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>{kpiData.change}%</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className={`text-2xl font-bold text-white`}>
            {kpiData.value}
          </div>
          <div className={`text-sm text-zinc-400`}>
            {kpiData.sub}
          </div>
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
      },
      {
        type: 'warning',
        count: stats.productsLowStock,
        label: 'Stock faible',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10 border-yellow-400/20',
      },
    ].filter(alert => alert.count > 0);

    return (
      <div className={`h-full p-6 rounded-2xl border bg-zinc-900/90 border-zinc-800`}>
        <h3 className={`text-lg font-semibold mb-4 text-white`}>
          Alertes
        </h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-zinc-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune alerte active</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${alert.bgColor}`}>
                  <Icon className={`w-5 h-5 ${alert.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {alert.label}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {alert.count} produit{alert.count > 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewStock()}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-red-400 text-black hover:bg-red-300`}
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
  const ListWidget = ({ widget }: { widget: WidgetConfig }) => {
    return (
      <div className={`h-full p-6 rounded-2xl border bg-zinc-900/90 border-zinc-800`}>
        <div className={`flex items-center justify-between mb-4`}>
          <h3 className={`text-lg font-semibold text-white`}>
            Commandes Récentes
          </h3>
          <button
            onClick={() => onViewOrders()}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-green-neon text-black hover:bg-green-400`}
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-64">
          {stats.recentOrders?.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className={`flex items-center justify-between p-3 rounded-xl border border-zinc-700`}
            >
              <div>
                <div className={`font-medium text-white`}>
                  Commande #{order.id?.slice(0, 8)}
                </div>
                <div className={`text-sm text-zinc-400`}>
                  {order.profile?.full_name || 'Client anonyme'}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold text-white`}>
                  {Number(order.total).toFixed(2)} €
                </div>
                <div className={`text-xs text-zinc-500`}>
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Widget Chart Component
  const ChartWidget = ({ widget }: { widget: WidgetConfig }) => {
    return (
      <div className={`h-full p-6 rounded-2xl border bg-zinc-900/90 border-zinc-800`}>
        <h3 className={`text-lg font-semibold mb-4 text-white`}>
          Évolution Chiffre d'Affaires
        </h3>
        <div className={`h-48 flex items-center justify-center`}>
          <div className={`text-center text-zinc-400`}>
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Graphique en cours de développement</p>
            <p className="text-xs mt-1">Intégration Recharts prévue</p>
          </div>
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
          return <KPIWidget widget={widget} data={stats} />;
        case 'alert':
          return <AlertWidget widget={widget} />;
        case 'list':
          return <ListWidget widget={widget} />;
        case 'chart':
          return <ChartWidget widget={widget} />;
        default:
          return (
            <div className={`h-full p-6 rounded-2xl border flex items-center justify-center bg-zinc-900/90 border-zinc-800`}>
              <div className={`text-center text-zinc-400`}>
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
        className={`${widgetSizes[widget.size]} relative group ${
          widget.isMinimized ? 'row-span-1' : ''
        }`}
        whileHover={{ scale: isEditMode ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header du widget en mode édition */}
        {isEditMode && (
          <div className={`absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button
              onClick={() => toggleWidgetMinimize(widget.id)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400`}
            >
              {widget.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400`}
            >
              {widget.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Contenu du widget */}
        <AnimatePresence mode="wait">
          {!widget.isMinimized ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {widgetContent()}
            </motion.div>
          ) : (
            <motion.div
              key="minimized"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`h-full p-4 rounded-2xl border flex items-center justify-center bg-zinc-900/90 border-zinc-800`}
            >
              <div className={`text-center text-zinc-400`}>
                <LayoutDashboard className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs font-medium">{widget.title}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 transition-colors duration-300">
      {/* Header avec contrôles */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl bg-zinc-900/90 border-zinc-800 text-white">
        <div className="max-w-12xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Administration</h1>
              <p className="text-sm text-zinc-400">
                Widgets personnalisables • Mode sombre
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mode compact */}
              <button
                onClick={() => setCompactMode(!compactMode)}
                className="px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {compactMode ? 'Normal' : 'Compact'}
                </span>
              </button>

              {/* Mode édition */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isEditMode ? 'Terminer' : 'Personnaliser'}
                </span>
              </button>


              {/* Ajouter widget */}
              {isEditMode && (
                <button
                  onClick={addWidget}
                  className="px-4 py-2 rounded-xl bg-green-neon text-black font-medium hover:bg-green-400 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Widget</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Grille de widgets */}
      <main className="max-w-12xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {isEditMode ? (
            <Reorder.Group
              axis="y"
              values={widgets.filter(w => w.isVisible)}
              onReorder={handleReorder}
              className={`grid ${gridCols} gap-4 auto-rows-min`}
            >
              {widgets.filter(w => w.isVisible).map((widget) => (
                <Reorder.Item key={widget.id} value={widget} className="cursor-move">
                  {renderWidget(widget)}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className={`grid ${gridCols} gap-4 auto-rows-min`}>
              {widgets.filter(w => w.isVisible).map((widget) => (
                <div key={widget.id}>
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Widgets invisibles en mode édition */}
        {isEditMode && widgets.some(w => !w.isVisible) && (
          <div className={`mt-8 p-6 rounded-2xl border bg-zinc-900/90 border-zinc-800`}>
            <h3 className={`text-lg font-semibold mb-4 text-white`}>
              Widgets masqués
            </h3>
            <div className="flex flex-wrap gap-3">
              {widgets.filter(w => !w.isVisible).map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300`}
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{widget.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
