import type { Order, Expense, ExpenseCategory, AccountingSummary, Transaction, AccountingPeriod, AccountingPeriodPreset } from '../types'

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  stock: 'Achats stock',
  shipping: 'Livraison / Logistique',
  marketing: 'Publicité',
  banking: 'Frais bancaires',
  salary: 'Salaires',
  rent: 'Loyer',
  other: 'Autre',
}

export const PERIOD_PRESETS: { value: AccountingPeriodPreset; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'yesterday', label: 'Hier' },
  { value: 'last-7-days', label: '7 derniers jours' },
  { value: 'last-30-days', label: '30 derniers jours' },
  { value: 'this-month', label: 'Ce mois-ci' },
  { value: 'last-month', label: 'Mois dernier' },
  { value: 'this-year', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
]

const REVENUE_STATUSES = new Set(['delivered'])

export function isConfirmedRevenue(status: Order['status']) {
  return REVENUE_STATUSES.has(status)
}

export function getMonthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-')
  return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  )
}

export function getPeriodLabel(period: AccountingPeriod): string {
  if (period === 'all') return 'Toutes les périodes'
  if (typeof period === 'object' && period.type === 'custom') {
    const fmt = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(d))
    return `${fmt(period.start)} - ${fmt(period.end)}`
  }
  return PERIOD_PRESETS.find((p) => p.value === period)?.label ?? 'Période'
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function getPeriodRange(period: AccountingPeriod): { start: Date; end: Date } | null {
  const now = new Date()
  if (period === 'all') return null

  if (period === 'today') {
    return { start: startOfDay(now), end: endOfDay(now) }
  }

  if (period === 'yesterday') {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    return { start: startOfDay(d), end: endOfDay(d) }
  }

  if (period === 'last-7-days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return { start: startOfDay(d), end: endOfDay(now) }
  }

  if (period === 'last-30-days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 29)
    return { start: startOfDay(d), end: endOfDay(now) }
  }

  if (period === 'this-month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfDay(now) }
  }

  if (period === 'last-month') {
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    const d = new Date(lastDay.getFullYear(), lastDay.getMonth(), 1)
    return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: endOfDay(lastDay) }
  }

  if (period === 'this-year') {
    return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(now) }
  }

  if (period.type === 'custom') {
    return { start: startOfDay(new Date(period.start)), end: endOfDay(new Date(period.end)) }
  }

  return null
}

function isInRange(dateStr: string, range: { start: Date; end: Date } | null): boolean {
  if (!range) return true
  const d = new Date(dateStr)
  return d >= range.start && d <= range.end
}

export function buildTransactions(orders: Order[], expenses: Expense[], period?: AccountingPeriod): Transaction[] {
  const range = getPeriodRange(period ?? 'all')
  const periodOrders = range
    ? orders.filter((o) => isInRange(o.createdAt, range))
    : orders
  const periodExpenses = range
    ? expenses.filter((e) => isInRange(e.date, range))
    : expenses

  const income: Transaction[] = periodOrders
    .filter((o) => isConfirmedRevenue(o.status))
    .map((o) => ({
      id: `inc-${o.id}`,
      type: 'income' as const,
      label: `Commande ${o.id}`,
      category: 'Ventes',
      amount: o.total,
      date: o.createdAt,
      reference: o.id,
    }))

  const outgoing: Transaction[] = periodExpenses.map((e) => ({
    id: `exp-${e.id}`,
    type: 'expense' as const,
    label: e.label,
    category: EXPENSE_CATEGORY_LABELS[e.category],
    amount: e.amount,
    date: e.date,
    reference: e.id,
  }))

  return [...income, ...outgoing].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function computeAccountingSummary(
  orders: Order[],
  expenses: Expense[],
  period: AccountingPeriod = 'all'
): AccountingSummary {
  const range = getPeriodRange(period)
  const periodOrders = range
    ? orders.filter((o) => isInRange(o.createdAt, range))
    : orders
  const periodExpenses = range
    ? expenses.filter((e) => isInRange(e.date, range))
    : expenses

  const activeOrders = periodOrders.filter((o) => o.status !== 'cancelled')
  const confirmedOrders = activeOrders.filter((o) => isConfirmedRevenue(o.status))
  const pendingOrders = activeOrders.filter((o) => o.status === 'pending')

  const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0)
  const confirmedRevenue = confirmedOrders.reduce((s, o) => s + o.total, 0)
  const pendingRevenue = pendingOrders.reduce((s, o) => s + o.total, 0)
  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = confirmedRevenue - totalExpenses
  const profitMargin = confirmedRevenue > 0 ? (netProfit / confirmedRevenue) * 100 : 0

  const monthKeys = new Set<string>()
  activeOrders.forEach((o) => monthKeys.add(getMonthKey(o.createdAt)))
  periodExpenses.forEach((e) => monthKeys.add(getMonthKey(e.date)))

  const monthlyBreakdown = [...monthKeys]
    .sort()
    .slice(-6)
    .map((month) => {
      const monthOrders = activeOrders.filter((o) => getMonthKey(o.createdAt) === month)
      const monthExpenses = periodExpenses.filter((e) => getMonthKey(e.date) === month)
      const revenue = monthOrders
        .filter((o) => isConfirmedRevenue(o.status))
        .reduce((s, o) => s + o.total, 0)
      const expTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)
      return {
        month,
        label: getMonthLabel(month),
        revenue,
        expenses: expTotal,
        profit: revenue - expTotal,
      }
    })

  const categoryTotals = new Map<ExpenseCategory, number>()
  periodExpenses.forEach((e) => {
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount)
  })

  const expensesByCategory = (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[])
    .map((category) => ({
      category,
      label: EXPENSE_CATEGORY_LABELS[category],
      amount: categoryTotals.get(category) ?? 0,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const recentTransactions = buildTransactions(periodOrders, periodExpenses, period).slice(0, 12)

  return {
    totalRevenue,
    confirmedRevenue,
    pendingRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    orderCount: activeOrders.length,
    confirmedOrderCount: confirmedOrders.length,
    deliveredCount: activeOrders.filter((o) => o.status === 'delivered').length,
    monthlyBreakdown,
    expensesByCategory,
    recentTransactions,
  }
}

export function getAvailablePeriods(orders: Order[], expenses: Expense[]) {
  const keys = new Set<string>()
  orders.forEach((o) => keys.add(getMonthKey(o.createdAt)))
  expenses.forEach((e) => keys.add(getMonthKey(e.date)))
  return [...keys].sort().reverse()
}
