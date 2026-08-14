import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Calculator,
  Calendar,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import StatusBadge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useStore } from '../context/StoreContext'

import { formatFcfa } from '../utils/format'
import {
  PERIOD_PRESETS,
  getPeriodRange,
} from '../utils/accounting'
import type { AccountingPeriod, AccountingPeriodPreset, AccountingPeriodCustom } from '../types'

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
  const { orders, products, accounting, accountingPeriod, setAccountingPeriod } = useStore()
  const [period, setPeriod] = useState<AccountingPeriod>(accountingPeriod)
  const [showCustom, setShowCustom] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  function applyCustom() {
    const start = (document.getElementById('dash-period-start') as HTMLInputElement)?.value
    const end = (document.getElementById('dash-period-end') as HTMLInputElement)?.value
    if (start && end && new Date(end) >= new Date(start)) {
      const custom: AccountingPeriodCustom = { type: 'custom', start, end }
      setPeriod(custom)
      setAccountingPeriod(custom)
    }
  }

  const range = getPeriodRange(period)

  const filteredOrders = useMemo(() => {
    if (!range) return orders
    return orders.filter((o) => {
      const d = new Date(o.createdAt)
      return d >= range.start && d <= range.end
    })
  }, [orders, range])

  const filteredStats = useMemo(() => {
    const active = filteredOrders.filter((o) => o.status !== 'cancelled')
    return {
      totalOrders: active.length,
      pendingOrders: active.filter((o) => o.status === 'pending').length,
      totalRevenue: active.reduce((sum, o) => sum + o.total, 0),
      totalProducts: products.filter((p) => p.active).length,
      lowStockProducts: products.filter((p) => p.stock <= 10 && p.active).length,
    }
  }, [filteredOrders, products])

  const recentFilteredOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.active)

  const statCards = [
    {
      label: 'Commandes totales',
      value: filteredStats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: `${filteredStats.pendingOrders} en attente`,
    },
    {
      label: "Chiffre d'affaires",
      value: formatFcfa(filteredStats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Hors annulations',
    },
    {
      label: 'Produits actifs',
      value: filteredStats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: `${products.length} au total`,
    },
    {
      label: 'Stock faible',
      value: filteredStats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'bg-amber-500',
      change: '≤ 10 unités',
    },
  ]

  const isActive = (preset: AccountingPeriodPreset | AccountingPeriodCustom) => {
    if (typeof preset === 'object' && preset.type === 'custom') {
      return typeof period === 'object' && period.type === 'custom'
    }
    return period === preset
  }

  const isCustomActive =
    typeof period === 'object' && period.type === 'custom'

  return (
    <>
      <Header title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique" />

      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:space-y-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          {PERIOD_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              size="sm"
              variant={isActive(preset.value) ? 'primary' : 'secondary'}
              onClick={() => {
                setPeriod(preset.value)
                setAccountingPeriod(preset.value)
              }}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={isCustomActive ? 'primary' : 'secondary'}
            onClick={() => setShowCustom((v) => !v)}
          >
            Personnalisé
          </Button>
        </div>

        {showCustom && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="dash-period-start"
              type="date"
              max={today}
              className="w-36"
              defaultValue={
                typeof period === 'object' && period.type === 'custom'
                  ? period.start
                  : ''
              }
            />
            <span className="text-sm text-gray-500">à</span>
            <Input
              id="dash-period-end"
              type="date"
              max={today}
              className="w-36"
              defaultValue={
                typeof period === 'object' && period.type === 'custom'
                  ? period.end
                  : ''
              }
            />
            <Button size="sm" onClick={applyCustom}>
              Appliquer
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardBody>
                <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-gray-400">{stat.change}</p>
                </div>
                  <div className={`rounded-lg p-2 sm:p-2.5 ${stat.color}`}>
                    <stat.icon size={16} className="text-white sm:hidden" />
                    <stat.icon size={20} className="text-white hidden sm:block" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-lg bg-indigo-500 p-2.5 sm:p-3">
                  <Calculator size={18} className="text-white sm:hidden" />
                  <Calculator size={22} className="text-white hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Comptabilité — Résultat net</p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${
                      accounting.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {accounting.netProfit >= 0 ? '+' : ''}
                    {formatFcfa(accounting.netProfit)}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-1">
                    Revenus {formatFcfa(accounting.confirmedRevenue)} · Dépenses{' '}
                    {formatFcfa(accounting.totalExpenses)} · Marge {accounting.profitMargin.toFixed(1)} %
                  </p>
                </div>
              </div>
              <Link
                to="/accounting"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 sm:w-auto"
              >
                Voir la comptabilité <ArrowRight size={16} />
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:font-semibold text-gray-900">Commandes récentes</h2>
                <Link
                  to="/orders"
                  className="flex items-center gap-1 text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2 sm:px-6 sm:py-3">Commande</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3">Client</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3">Montant</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3">Statut</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentFilteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 sm:px-6 sm:py-12 text-center text-xs sm:text-sm text-gray-500">
                        Aucune commande pour cette période.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {recentFilteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 sm:px-6 sm:py-3">
                            <Link to={`/orders/${order.id}`} className="text-xs sm:text-sm font-medium text-brand-600 hover:underline">
                              {order.id}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 sm:px-6 sm:py-3">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">{order.customerName}</p>
                          </td>
                          <td className="px-3 py-2.5 sm:px-6 sm:py-3">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{formatFcfa(order.total)}</span>
                          </td>
                          <td className="px-3 py-2.5 sm:px-6 sm:py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-3 py-2.5 sm:px-6 sm:py-3">
                            <span className="flex items-center gap-1 text-[11px] sm:text-sm text-gray-500">
                              <Clock size={12} className="sm:hidden" />
                              <Clock size={14} className="hidden sm:block" />
                              <span className="hidden sm:inline">{formatDate(order.createdAt)}</span>
                              <span className="sm:hidden">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
              <CardHeader>
                <h2 className="text-sm sm:font-semibold text-gray-900">Alertes stock</h2>
              </CardHeader>
              <CardBody className="space-y-2 sm:space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Tous les stocks sont suffisants.</p>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2.5 rounded-lg border border-amber-100 bg-amber-50 p-2.5 sm:p-3"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-8 w-8 rounded-lg object-cover sm:h-10 sm:w-10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs sm:text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-[11px] sm:text-xs text-amber-700">{product.stock} restant(s)</p>
                    </div>
                  </div>
                ))
              )}
              <Link
                to="/products"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs sm:text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Gérer les produits <ArrowRight size={14} />
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
