import type { OrderStatus } from '../../types'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
  processing: { label: 'En cours', className: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Expédiée', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
}

interface BadgeProps {
  status: OrderStatus
}

export default function StatusBadge({ status }: BadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {active ? 'Actif' : 'Inactif'}
    </span>
  )
}
