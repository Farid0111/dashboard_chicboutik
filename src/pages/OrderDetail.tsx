import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Mail, Phone, Package } from 'lucide-react'
import Header from '../components/layout/Header'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import StatusBadge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { useStore } from '../context/StoreContext'
import type { OrderStatus } from '../types'

import { formatFcfa } from '../utils/format'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const statusFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours de traitement' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
]

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const { orders, updateOrderStatus, products } = useStore()
  const [statusError, setStatusError] = useState<string | null>(null)

  const order = orders.find((o) => o.id === orderId)
  if (!order) return <Navigate to="/orders" replace />

  const currentStep = statusFlow.indexOf(order.status)

  const getProductImage = (item: { productId?: string; image?: string }) => {
    if (item.image) return item.image
    const product = products.find((p) => p.id === item.productId)
    return product?.image || '/images/product-placeholder.svg'
  }

  return (
    <>
      <Header title={`Commande ${order.id}`} subtitle={formatDate(order.createdAt)} />

      <div className="space-y-6 p-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Retour aux commandes
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Progression</h2>
                  <StatusBadge status={order.status} />
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between">
                  {statusFlow.map((step, i) => {
                    const labels = ['Reçue', 'En cours', 'Expédiée', 'Livrée']
                    const isActive = i <= currentStep && order.status !== 'cancelled'
                    const isCurrent = step === order.status
                    return (
                      <div key={step} className="flex flex-1 flex-col items-center">
                        <div className="relative flex w-full items-center">
                          {i > 0 && (
                            <div
                              className={`h-0.5 flex-1 ${isActive ? 'bg-brand-600' : 'bg-gray-200'}`}
                            />
                          )}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isCurrent
                                ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                                : isActive
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {i + 1}
                          </div>
                          {i < statusFlow.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 ${i < currentStep && order.status !== 'cancelled' ? 'bg-brand-600' : 'bg-gray-200'}`}
                            />
                          )}
                        </div>
                        <p className={`mt-2 text-xs font-medium ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
                          {labels[i]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Package size={18} />
                  Articles commandés
                </h2>
              </CardHeader>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatFcfa(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatFcfa(order.total)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Traiter la commande</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="Changer le statut"
                  options={statusOptions}
                  value={order.status}
                  onChange={async (e) => {
                    setStatusError(null)
                    try {
                      await updateOrderStatus(order.id, e.target.value as OrderStatus)
                    } catch (err) {
                      setStatusError("Mise à jour impossible — exécutez ce SQL dans Supabase > SQL Editor : DROP POLICY IF EXISTS orders_anon_update ON orders; CREATE POLICY orders_anon_update ON orders FOR UPDATE USING (true); DROP POLICY IF EXISTS orders_anon_delete ON orders; CREATE POLICY orders_anon_delete ON orders FOR DELETE USING (true);")
                    }
                  }}
                />
                {statusError && (
                  <p className="text-sm text-red-600">{statusError}</p>
                )}
                {order.status === 'pending' && (
                  <Button
                    className="w-full"
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                  >
                    Commencer le traitement
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button
                    className="w-full"
                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                  >
                    Marquer comme expédiée
                  </Button>
                )}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  >
                    Annuler la commande
                  </Button>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Client</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="font-medium text-gray-900">{order.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {order.customerEmail}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  {order.customerPhone}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
                  <span>
                    {order.address}
                    <br />
                    {order.city}
                  </span>
                </div>
                {order.notes && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    <strong>Note :</strong> {order.notes}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
