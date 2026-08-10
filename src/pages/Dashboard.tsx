import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Calculator,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import StatusBadge from '../components/ui/Badge'
import { useStore } from '../context/StoreContext'

import { formatFcfa } from '../utils/format'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default function Dashboard() {
  const { stats, orders, products, accounting } = useStore()

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.active)

  const statCards = [
    {
      label: 'Commandes totales',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: `${stats.pendingOrders} en attente`,
    },
    {
      label: 'Chiffre d\'affaires',
      value: formatFcfa(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Hors annulations',
    },
    {
      label: 'Produits actifs',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: `${products.length} au total`,
    },
    {
      label: 'Stock faible',
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'bg-amber-500',
      change: '≤ 10 unités',
    },
  ]

  return (
    <>
      <Header title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique" />

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${stat.color}`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-indigo-500 p-3">
                  <Calculator size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comptabilité — Résultat net</p>
                  <p
                    className={`text-2xl font-bold ${
                      accounting.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {accounting.netProfit >= 0 ? '+' : ''}
                    {formatFcfa(accounting.netProfit)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Revenus {formatFcfa(accounting.confirmedRevenue)} · Dépenses{' '}
                    {formatFcfa(accounting.totalExpenses)} · Marge {accounting.profitMargin.toFixed(1)} %
                  </p>
                </div>
              </div>
              <Link
                to="/accounting"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Voir la comptabilité <ArrowRight size={16} />
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
                <Link
                  to="/orders"
                  className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Voir tout <ArrowRight size={16} />
                </Link>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Commande</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Montant</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                        Aucune commande pour le moment.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link to={`/orders/${order.id}`} className="font-medium text-brand-600 hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{order.customerName}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {formatFcfa(order.total)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))})
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Alertes stock</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Tous les stocks sont suffisants.</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-amber-700">{product.stock} restant(s)</p>
                    </div>
                  </div>
                ))
              )}
              <Link
                to="/products"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Gérer les produits <ArrowRight size={16} />
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
