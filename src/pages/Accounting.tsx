import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CalendarIcon,
  ChevronDown,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { useStore } from '../context/StoreContext'
import { formatFcfa } from '../utils/format'
import {
  EXPENSE_CATEGORY_LABELS,
  getPeriodLabel,
  getPeriodRange,
  PERIOD_PRESETS,
  type AccountingPeriodPreset,
} from '../utils/accounting'
import type { Expense, ExpenseCategory } from '../types'

const categoryOptions = (Object.entries(EXPENSE_CATEGORY_LABELS) as [ExpenseCategory, string][]).map(
  ([value, label]) => ({ value, label })
)

const emptyExpense = {
  label: '',
  category: 'other' as ExpenseCategory,
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export default function Accounting() {
  const {
    orders,
    expenses,
    accounting,
    accountingPeriod,
    setAccountingPeriod,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshData,
    loading,
  } = useStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(emptyExpense)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  function selectPreset(preset: AccountingPeriodPreset) {
    setShowCustom(false)
    setAccountingPeriod(preset)
  }

  function applyCustom() {
    const start = (document.getElementById('period-start') as HTMLInputElement)?.value
    const end = (document.getElementById('period-end') as HTMLInputElement)?.value
    if (start && end && new Date(end) >= new Date(start)) {
      setAccountingPeriod({ type: 'custom', start, end })
    }
  }

  const isActive = (preset: AccountingPeriodPreset) =>
    accountingPeriod === preset
  const isCustomActive =
    accountingPeriod !== 'all' &&
    typeof accountingPeriod === 'object' &&
    accountingPeriod.type === 'custom'

  const periodLabel = getPeriodLabel(accountingPeriod)

  const kpiCards = [
    {
      label: 'Revenus confirmés',
      value: formatFcfa(accounting.confirmedRevenue),
      sub: `${accounting.confirmedOrderCount} commande(s) confirmée(s)`,
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: accounting.pendingRevenue > 0 ? `+${formatFcfa(accounting.pendingRevenue)} en attente` : undefined,
    },
    {
      label: 'Dépenses',
      value: formatFcfa(accounting.totalExpenses),
      sub: `${expenses.length} entrée(s)`,
      icon: TrendingDown,
      color: 'bg-red-500',
    },
    {
      label: 'Bénéfice net',
      value: formatFcfa(accounting.netProfit),
      sub: accounting.netProfit >= 0 ? 'Résultat positif' : 'Résultat négatif',
      icon: Wallet,
      color: accounting.netProfit >= 0 ? 'bg-blue-500' : 'bg-amber-500',
    },
    {
      label: 'Marge bénéficiaire',
      value: `${accounting.profitMargin.toFixed(1)} %`,
      sub: `${accounting.deliveredCount} livraison(s)`,
      icon: Percent,
      color: 'bg-purple-500',
    },
  ]

  const maxBar = Math.max(
    ...accounting.monthlyBreakdown.flatMap((m) => [m.revenue, m.expenses]),
    1
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyExpense)
    setModalOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditing(expense)
    setForm({
      label: expense.label,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.slice(0, 10),
      notes: expense.notes ?? '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    const data = {
      ...form,
      date: new Date(form.date).toISOString(),
      notes: form.notes || undefined,
    }
    try {
      if (editing) {
        await updateExpense(editing.id, data)
      } else {
        await addExpense(data)
      }
      setModalOpen(false)
    } catch {
      setStatusError("Erreur lors de l'enregistrement. Vérifiez la console.")
    }
  }

  const range = getPeriodRange(accountingPeriod)

  const filteredExpenses =
    !range || accountingPeriod === 'all'
      ? expenses
      : expenses.filter((e) => {
          const d = new Date(e.date)
          return d >= range.start && d <= range.end
        })

  return (
    <>
      <Header
        title="Comptabilité"
        subtitle="Suivi des revenus, dépenses et résultat net"
      />

      <div className="space-y-6 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {PERIOD_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={isActive(preset.value) ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => selectPreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                variant={isCustomActive ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowCustom((v) => !v)}
              >
                Personnalisé
              </Button>
            </div>

            {showCustom && (
              <div className="flex items-center gap-2">
                <Input
                  id="period-start"
                  type="date"
                  max={today}
                  className="w-44"
                  defaultValue={
                    accountingPeriod !== 'all' &&
                    typeof accountingPeriod === 'object' &&
                    accountingPeriod.type === 'custom'
                      ? accountingPeriod.start
                      : ''
                  }
                />
                <span className="text-sm text-gray-500">à</span>
                <Input
                  id="period-end"
                  type="date"
                  max={today}
                  className="w-44"
                  defaultValue={
                    accountingPeriod !== 'all' &&
                    typeof accountingPeriod === 'object' &&
                    accountingPeriod.type === 'custom'
                      ? accountingPeriod.end
                      : ''
                  }
                />
                <Button size="sm" onClick={applyCustom}>
                  Appliquer
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Période sélectionnée : <span className="font-medium text-gray-700">{periodLabel}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </Button>
            <Button onClick={openCreate}>
              <Plus size={18} />
              Ajouter une dépense
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{kpi.sub}</p>
                    {kpi.trend && (
                      <p className="mt-1 text-xs font-medium text-amber-600">{kpi.trend}</p>
                    )}
                  </div>
                  <div className={`rounded-lg p-2.5 ${kpi.color}`}>
                    <kpi.icon size={20} className="text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Évolution mensuelle</h2>
            </CardHeader>
            <CardBody>
              {accounting.monthlyBreakdown.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune donnée pour cette période.</p>
              ) : (
                <div className="space-y-4">
                  {accounting.monthlyBreakdown.map((m) => (
                    <div key={m.month}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{m.label}</span>
                        <span
                          className={`font-semibold ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {m.profit >= 0 ? '+' : ''}
                          {formatFcfa(m.profit)}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-xs text-gray-500">Revenus</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-500 transition-all"
                              style={{ width: `${(m.revenue / maxBar) * 100}%` }}
                            />
                          </div>
                          <span className="w-24 text-right text-xs font-medium text-gray-700">
                            {formatFcfa(m.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-xs text-gray-500">Dépenses</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-red-400 transition-all"
                              style={{ width: `${(m.expenses / maxBar) * 100}%` }}
                            />
                          </div>
                          <span className="w-24 text-right text-xs font-medium text-gray-700">
                            {formatFcfa(m.expenses)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Dépenses par catégorie</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {accounting.expensesByCategory.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune dépense enregistrée.</p>
              ) : (
                accounting.expensesByCategory.map((c) => {
                  const pct =
                    accounting.totalExpenses > 0
                      ? (c.amount / accounting.totalExpenses) * 100
                      : 0
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{c.label}</span>
                        <span className="font-medium">{formatFcfa(c.amount)}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-xs text-gray-400">{pct.toFixed(0)} %</p>
                    </div>
                  )
                })
              )}
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Journal des transactions</h2>
            </CardHeader>
            <div className="divide-y divide-gray-50">
              {accounting.recentTransactions.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-gray-500">Aucune transaction.</p>
              ) : (
                accounting.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 px-6 py-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight size={16} className="text-green-600" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{tx.label}</p>
                      <p className="text-xs text-gray-500">
                        {tx.category} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatFcfa(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Dépenses</h2>
                <span className="text-sm text-gray-500">{filteredExpenses.length} entrée(s)</span>
              </div>
            </CardHeader>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {filteredExpenses.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-gray-500">Aucune dépense.</p>
              ) : (
                filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <div key={expense.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{expense.label}</p>
                        <p className="text-xs text-gray-500">
                          {EXPENSE_CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-red-600">
                        −{formatFcfa(expense.amount)}
                      </span>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(expense)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(expense.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Compte de résultat simplifié</h2>
          </CardHeader>
          <CardBody>
            <div className="mx-auto max-w-lg space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                <span className="text-gray-600">Chiffre d&apos;affaires (commandes confirmées)</span>
                <span className="font-semibold text-green-600">
                  + {formatFcfa(accounting.confirmedRevenue)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                <span className="text-gray-600">Encaissements en attente</span>
                <span className="font-medium text-amber-600">
                  {formatFcfa(accounting.pendingRevenue)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                <span className="text-gray-600">Total des dépenses</span>
                <span className="font-semibold text-red-600">
                  − {formatFcfa(accounting.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="font-bold text-gray-900">Résultat net</span>
                <span
                  className={`font-bold ${accounting.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {accounting.netProfit >= 0 ? '+' : ''}
                  {formatFcfa(accounting.netProfit)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la dépense' : 'Nouvelle dépense'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Libellé"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Ex: Campagne publicitaire"
          />
          <Select
            label="Catégorie"
            options={categoryOptions}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Montant (FCFA)"
              type="number"
              min="0"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <Textarea
            label="Notes (optionnel)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!form.label || !form.amount}>
              {editing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer la dépense"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Cette dépense sera définitivement supprimée de la comptabilité.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteId) deleteExpense(deleteId)
              setDeleteId(null)
            }}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </>
  )
}
