import { useState } from 'react'
import Header from '../components/layout/Header'
import StorefrontPreview from '../components/storefront/StorefrontPreview'
import DevicePreviewFrame, { DeviceToggle, type ViewportMode } from '../components/storefront/DevicePreviewFrame'
import { useStore } from '../context/StoreContext'
import { normalizeSiteContent } from '../utils/siteContent'

export default function Store() {
  const { siteContent, products } = useStore()
  const [viewport, setViewport] = useState<ViewportMode>('mobile')
  const content = normalizeSiteContent(siteContent)
  const product = products.find((p) => p.active) ?? products[0]

  if (!product) {
    return (
      <>
        <Header title="Boutique" subtitle="Aucun produit actif" />
        <p className="p-8 text-gray-500">Ajoutez un produit pour afficher la boutique.</p>
      </>
    )
  }

  return (
    <>
      <Header title="Aperçu boutique" subtitle="Landing page telle que vue par vos clients" />

      <div className="space-y-4 p-4">
        <div className="flex justify-center">
          <DeviceToggle value={viewport} onChange={setViewport} />
        </div>
        <div
          className={`rounded-xl border border-gray-200 bg-gray-100 ${
            viewport === 'desktop' ? 'overflow-y-auto' : 'overflow-x-auto overflow-y-hidden'
          }`}
        >
          <DevicePreviewFrame mode={viewport}>
            <StorefrontPreview content={content} product={product} viewport={viewport} />
          </DevicePreviewFrame>
        </div>
      </div>
    </>
  )
}
