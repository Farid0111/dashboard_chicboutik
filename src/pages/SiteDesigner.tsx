import type { ReactNode } from 'react'
import { useState, useEffect, useCallback } from 'react'
import {
  Save,
  Eye,
  ShoppingBag,
  FileText,
  Image,
  Star,
  BarChart3,
  Megaphone,
  Phone,
  Layers,
  Images,
  Upload,
  Truck,
  HelpCircle,
  Target,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Card, { CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import StorefrontPreview from '../components/storefront/StorefrontPreview'
import DevicePreviewFrame, { DeviceToggle, type ViewportMode } from '../components/storefront/DevicePreviewFrame'
import { useStore } from '../context/StoreContext'
import type { SiteContent, WhyFeature, ComparisonItem, Testimonial, StatItem, ProductFeature, ProductVariant, Product, FaqItem } from '../types'
import { normalizeSiteContent } from '../utils/siteContent'

type Tab =
  | 'product'
  | 'media'
  | 'order'
  | 'why'
  | 'hero'
  | 'compare'
  | 'stats'
  | 'delivery'
  | 'faq'
  | 'urgency'
  | 'contact'
  | 'facebook'

const tabs: { id: Tab; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'product', label: 'Produit', icon: ShoppingBag },
  { id: 'media', label: 'Images & variantes', icon: Images },
  { id: 'order', label: 'Formulaire commande', icon: FileText },
  { id: 'why', label: 'Pourquoi nous choisir', icon: Layers },
  { id: 'hero', label: 'Confort & Technologie', icon: Image },
  { id: 'compare', label: 'Comparaison', icon: BarChart3 },
  { id: 'stats', label: 'Statistiques & Avis', icon: Star },
  { id: 'delivery', label: 'Livraison', icon: Truck },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'urgency', label: 'Appel à l\'action', icon: Megaphone },
  { id: 'contact', label: 'WhatsApp & Couleurs', icon: Phone },
  { id: 'facebook', label: 'Facebook Pixel', icon: Target },
]

function ListEditor<T extends { id: string }>({
  items,
  onChange,
  renderFields,
  onAdd,
  addLabel,
}: {
  items: T[]
  onChange: (items: T[]) => void
  renderFields: (item: T, index: number) => ReactNode
  onAdd: () => T
  addLabel: string
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-lg border border-gray-100 p-3 space-y-2">
          {renderFields(item, i)}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            Supprimer
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onChange([...items, onAdd()])}>
        + {addLabel}
      </Button>
    </div>
  )
}

export default function SiteDesigner() {
  const { siteContent, updateSiteContent, products, updateProduct, uploadImage } = useStore()
  const [draft, setDraft] = useState<SiteContent>(() => normalizeSiteContent(siteContent))
  const [activeTab, setActiveTab] = useState<Tab>('product')
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showReference, setShowReference] = useState(false)
  const [viewport, setViewport] = useState<ViewportMode>('mobile')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setDraft(normalizeSiteContent(siteContent))
  }, [siteContent])

  const product = products.find((p) => p.active) ?? products[0]

  const patch = useCallback((updates: Partial<SiteContent>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
    setSaved(false)
  }, [])

  const updateListItem = useCallback(
    (
       key: 'stats' | 'testimonials' | 'whyFeatures' | 'comparisons' | 'faq',
      index: number,
      itemUpdates: Record<string, string | number>
    ) => {
      setDraft((prev) => {
        const list = [...prev[key]]
        list[index] = { ...list[index], ...itemUpdates }
        return { ...prev, [key]: list }
      })
      setSaved(false)
    },
    []
  )

  function handleSave() {
    const normalized = normalizeSiteContent(draft)
    setDraft(normalized)
    updateSiteContent(normalized)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function patchProduct(updates: Partial<Product>) {
    if (product) updateProduct(product.id, updates)
    setSaved(false)
  }

  async function uploadImageField(field: keyof SiteContent, label: string) {
    setUploading(true)
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const url = await uploadImage(file, `site-${label}-${Date.now()}`)
          patch({ [field]: url } as Partial<SiteContent>)
        }
      }
      input.click()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Erreur upload image. Vérifiez le bucket Supabase Storage.')
    } finally {
      setUploading(false)
    }
  }

  function ImageUploadField({
    label,
    value,
    onUpload,
    onClear,
  }: {
    label: string
    value: string
    onUpload: () => void
    onClear: () => void
  }) {
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-gray-700">
          {label}
          <Button variant="secondary" size="sm" onClick={onUpload} disabled={uploading}>
            <Upload size={14} />
            Importer
          </Button>
        </label>
        {value ? (
          <div className="relative w-32 h-32">
            <img src={value} alt="Aperçu" className="w-full h-full object-cover rounded-lg border" />
            <button
              type="button"
              className="absolute top-1 right-1 rounded bg-red-500 text-white p-0.5"
              onClick={onClear}
              title="Supprimer"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            Aucune image
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Header
        title="Designer du site"
        subtitle="Modifiez la landing page NeckCool Pro — aperçu basé sur votre vidéo"
      />

      <div className="flex flex-col gap-6 p-4 xl:flex-row xl:p-8">
        <div className="w-full shrink-0 space-y-4 xl:w-96">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave}>
              <Save size={16} />
              {saved ? 'Enregistré !' : 'Enregistrer'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowReference(!showReference)}
              title="Comparer avec la vidéo"
            >
              <Image size={16} />
            </Button>
          </div>

          {showReference && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">Référence vidéo (23/06/2026)</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                {[
                  { src: '/reference/product-page.png', label: 'Page produit' },
                  { src: '/reference/order-form.png', label: 'Formulaire' },
                  { src: '/reference/why-section.png', label: 'Section Pourquoi' },
                ].map(({ src, label }) => (
                  <div key={src}>
                    <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
                    <img src={src} alt={label} className="w-full rounded-lg border border-gray-200" />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Édition — {tabs.find((t) => t.id === activeTab)?.label}</h3>
            </CardHeader>
            <CardBody className="max-h-[calc(100vh-22rem)] space-y-4 overflow-y-auto">
              {activeTab === 'product' && (
                <>
                  <Input
                    label="Badge urgence"
                    value={draft.urgencyBanner}
                    onChange={(e) => patch({ urgencyBanner: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.urgencyBannerActive}
                      onChange={(e) => patch({ urgencyBannerActive: e.target.checked })}
                    />
                    Afficher le badge
                  </label>
                  <Textarea
                    label="Titre produit"
                    value={draft.productTitle}
                    onChange={(e) => patch({ productTitle: e.target.value })}
                    rows={3}
                  />
                  <Textarea
                    label="Description"
                    value={draft.productDescription}
                    onChange={(e) => patch({ productDescription: e.target.value })}
                    rows={4}
                  />
                  <Input
                    label="Prix affiché"
                    value={draft.priceLabel}
                    onChange={(e) => patch({ priceLabel: e.target.value })}
                    placeholder="24 990 FCFA"
                  />
                  <Input
                    label="Stock restant"
                    type="number"
                    value={draft.stockCount}
                    onChange={(e) => patch({ stockCount: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Message stock (utilisez {stock})"
                    value={draft.stockWarning}
                    onChange={(e) => patch({ stockWarning: e.target.value })}
                  />
                </>
              )}

               {activeTab === 'media' && product && (
                 <>
                   <ImageUploadField
                     label="Image principale"
                     value={product.image}
                     onUpload={async () => {
                       setUploading(true)
                       const input = document.createElement('input')
                       input.type = 'file'
                       input.accept = 'image/*'
                       input.onchange = async (e) => {
                         const file = (e.target as HTMLInputElement).files?.[0]
                         if (file) {
                           const url = await uploadImage(file, `product-${Date.now()}-main`)
                           patchProduct({ image: url })
                         }
                       }
                       input.click()
                       setUploading(false)
                     }}
                     onClear={() => patchProduct({ image: '' })}
                   />
                   <p className="text-xs font-medium text-gray-500 mt-4">Galerie d'images</p>
                   <div className="flex gap-2 overflow-x-auto">
                     {product.images.map((img, i) => (
                       <div key={i} className="relative w-20 h-20">
                         <img src={img} alt={`Galerie ${i + 1}`} className="w-full h-full object-cover rounded-lg border" />
                       </div>
                     ))}
                     <div className="relative w-20 h-20">
                       <input
                         type="file"
                         accept="image/*"
                         multiple
                         className="hidden"
                         id="gallery-upload"
                         onChange={async (e) => {
                           const files = Array.from(e.target.files ?? [])
                           setUploading(true)
                           try {
                             const urls = await Promise.all(
                               files.map((f) => uploadImage(f, `product-${Date.now()}-gallery`))
                             )
                             patchProduct({ images: [...product.images, ...urls] })
                           } catch {
                             alert('Erreur upload galerie')
                           } finally {
                             setUploading(false)
                           }
                         }}
                       />
                       <label
                         htmlFor="gallery-upload"
                         className="flex h-20 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 hover:border-brand-500"
                       >
                         <Upload size={16} />
                       </label>
                     </div>
                      {product.images.map((_, i) => (
                        <Button
                          key={`remove-${i}`}
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 w-4 h-4 p-0 text-red-600"
                          onClick={() =>
                            patchProduct({ images: product.images.filter((_, j) => j !== i) })
                          }
                        >
                          ×
                        </Button>
                      ))}
                   </div>
                   <p className="text-xs font-medium text-gray-500">Note / Rating</p>
                   <Input
                     label="Note / Rating"
                     type="number"
                     step="0.1"
                     min="0"
                     max="5"
                     value={product.rating}
                     onChange={(e) => patchProduct({ rating: parseFloat(e.target.value) || 0 })}
                   />
                  <p className="text-xs font-medium text-gray-500">Caractéristiques produit</p>
                  <ListEditor<ProductFeature>
                    items={product.features}
                    onChange={(features) => patchProduct({ features })}
                    onAdd={() => ({ id: `f-${Date.now()}`, text: '' })}
                    addLabel="Ajouter une caractéristique"
                    renderFields={(item, i) => (
                      <Textarea
                        label={`Caractéristique ${i + 1}`}
                        value={item.text}
                        onChange={(e) => {
                          const next = [...product.features]
                          next[i] = { ...item, text: e.target.value }
                          patchProduct({ features: next })
                        }}
                        rows={2}
                      />
                    )}
                  />
                  <p className="text-xs font-medium text-gray-500">Variantes (NOIR, BLANC…)</p>
                  <ListEditor<ProductVariant>
                    items={product.variants}
                    onChange={(variants) => patchProduct({ variants })}
                    onAdd={() => ({
                      id: `v-${Date.now()}`,
                      name: 'NOUVEAU',
                      color: '#cccccc',
                      image: product.image,
                    })}
                    addLabel="Ajouter une variante"
                    renderFields={(item, i) => (
                      <>
                        <Input
                          label="Nom"
                          value={item.name}
                          onChange={(e) => {
                            const next = [...product.variants]
                            next[i] = { ...item, name: e.target.value }
                            patchProduct({ variants: next })
                          }}
                        />
                        <div className="flex-1">
                          <p className="mb-1 text-xs font-medium text-gray-500">Image</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`variant-img-${i}`}
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setUploading(true)
                                try {
                                  const url = await uploadImage(file, `product-${Date.now()}-variant-${i}`)
                                  const next = [...product.variants]
                                  next[i] = { ...item, image: url }
                                  patchProduct({ variants: next })
                                } catch {
                                  alert('Erreur upload image')
                                } finally {
                                  setUploading(false)
                                }
                              }}
                            />
                            <label
                              htmlFor={`variant-img-${i}`}
                              className="flex h-16 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 hover:border-brand-500"
                            >
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded" />
                              ) : (
                                <Upload size={16} />
                              )}
                            </label>
                            {item.image && (
                              <button
                                type="button"
                                className="text-xs text-red-600 hover:text-red-800"
                                onClick={() => {
                                  const next = [...product.variants]
                                  next[i] = { ...item, image: '' }
                                  patchProduct({ variants: next })
                                }}
                              >
                                Suppr
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  />
                </>
              )}

              {activeTab === 'order' && (
                <>
                  <Input
                    label="Titre du formulaire"
                    value={draft.orderFormTitle}
                    onChange={(e) => patch({ orderFormTitle: e.target.value })}
                  />
                  <Input
                    label="Sous-titre"
                    value={draft.orderFormSubtitle}
                    onChange={(e) => patch({ orderFormSubtitle: e.target.value })}
                  />
                  <Input
                    label="Texte du bouton"
                    value={draft.orderButtonText}
                    onChange={(e) => patch({ orderButtonText: e.target.value })}
                  />
                </>
              )}

              {activeTab === 'why' && (
                <>
                  <Input
                    label="Titre de section"
                    value={draft.whyTitle}
                    onChange={(e) => patch({ whyTitle: e.target.value })}
                  />
                  <ImageUploadField
                    label="Image (section gauche)"
                    value={draft.whyImage}
                    onUpload={() => uploadImageField('whyImage', 'why')}
                    onClear={() => patch({ whyImage: '' })}
                  />
                  <Input
                    label="Texte bouton CTA"
                    value={draft.whyCta}
                    onChange={(e) => patch({ whyCta: e.target.value })}
                  />
                  <p className="text-xs font-medium text-gray-500">Points forts</p>
                  <ListEditor<WhyFeature>
                    items={draft.whyFeatures}
                    onChange={(whyFeatures) => patch({ whyFeatures })}
                    onAdd={() => ({ id: `w-${Date.now()}`, text: '' })}
                    addLabel="Ajouter un point"
                    renderFields={(item, i) => (
                      <Textarea
                        label={`Point ${i + 1}`}
                        value={item.text}
                        onChange={(e) => updateListItem('whyFeatures', i, { text: e.target.value })}
                        rows={2}
                      />
                    )}
                  />
                </>
              )}

               {activeTab === 'hero' && (
                 <>
                   <Input
                     label="Titre"
                     value={draft.heroTitle}
                     onChange={(e) => patch({ heroTitle: e.target.value })}
                   />
                   <Textarea
                     label="Texte descriptif"
                     value={draft.heroText}
                     onChange={(e) => patch({ heroText: e.target.value })}
                     rows={5}
                   />
                    <ImageUploadField
                     label="Image (droite)"
                     value={draft.heroImage}
                     onUpload={() => uploadImageField('heroImage', 'hero')}
                     onClear={() => patch({ heroImage: '' })}
                   />
                   <Input
                     label="Texte du bouton"
                     value={draft.heroCta}
                     onChange={(e) => patch({ heroCta: e.target.value })}
                     placeholder="Achetez maintenant !"
                   />
                 </>
               )}

               {activeTab === 'compare' && (
                 <>
                   <Input
                     label="Titre de section"
                     value={draft.compareTitle}
                     onChange={(e) => patch({ compareTitle: e.target.value })}
                   />
                   <ImageUploadField
                    label="Image produit (gauche)"
                    value={draft.showcaseImage}
                    onUpload={() => uploadImageField('showcaseImage', 'showcase')}
                    onClear={() => patch({ showcaseImage: '' })}
                  />
                  <p className="text-xs font-medium text-gray-500">Cartes comparaison</p>
                  <ListEditor<ComparisonItem>
                    items={draft.comparisons}
                    onChange={(comparisons) => patch({ comparisons })}
                    onAdd={() => ({
                      id: `c-${Date.now()}`,
                      title: '',
                      positive: '',
                      negative: '',
                    })}
                    addLabel="Ajouter une comparaison"
                    renderFields={(item, i) => (
                      <>
                        <Input
                          label="Titre"
                          value={item.title}
                          onChange={(e) => updateListItem('comparisons', i, { title: e.target.value })}
                        />
                        <Input
                          label="Notre produit ✓"
                          value={item.positive}
                          onChange={(e) => updateListItem('comparisons', i, { positive: e.target.value })}
                        />
                        <Input
                          label="Concurrent ✕"
                          value={item.negative}
                          onChange={(e) => updateListItem('comparisons', i, { negative: e.target.value })}
                        />
                      </>
                    )}
                  />
                </>
              )}

              {activeTab === 'stats' && (
                <>
                  <Input
                    label="Titre section stats"
                    value={draft.statsTitle}
                    onChange={(e) => patch({ statsTitle: e.target.value })}
                  />
                  <ImageUploadField
                    label="Image section statistiques"
                    value={draft.statsImage}
                    onUpload={() => uploadImageField('statsImage', 'stats')}
                    onClear={() => patch({ statsImage: '' })}
                  />
                  <Input
                    label="Titre carte avis (monde)"
                    value={draft.reviewsMapTitle}
                    onChange={(e) => patch({ reviewsMapTitle: e.target.value })}
                  />
                  <ImageUploadField
                    label="Image section avis (monde)"
                    value={draft.reviewsMapImage}
                    onUpload={() => uploadImageField('reviewsMapImage', 'reviews')}
                    onClear={() => patch({ reviewsMapImage: '' })}
                  />
                  <p className="text-xs font-medium text-gray-500">Statistiques</p>
                  <ListEditor<StatItem>
                    items={draft.stats}
                    onChange={(stats) => patch({ stats })}
                    onAdd={() => ({ id: `s-${Date.now()}`, value: '', label: '' })}
                    addLabel="Ajouter une stat"
                    renderFields={(item, i) => (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Valeur"
                          value={item.value}
                          onChange={(e) => updateListItem('stats', i, { value: e.target.value })}
                        />
                        <Input
                          label="Label"
                          value={item.label}
                          onChange={(e) => updateListItem('stats', i, { label: e.target.value })}
                        />
                      </div>
                    )}
                  />
                  <p className="text-xs font-medium text-gray-500">
                    Témoignages (le 1er s&apos;affiche sous le formulaire, les autres dans la section stats)
                  </p>
                  <ListEditor<Testimonial>
                    items={draft.testimonials}
                    onChange={(testimonials) => patch({ testimonials })}
                    onAdd={() => ({
                      id: `t-${Date.now()}`,
                      name: '',
                      text: '',
                      avatar: 'https://i.pravatar.cc/80',
                      rating: 5,
                    })}
                    addLabel="Ajouter un avis"
                    renderFields={(item, i) => (
                      <>
                        <Input
                          label="Nom"
                          value={item.name}
                          onChange={(e) => updateListItem('testimonials', i, { name: e.target.value })}
                        />
                        <Textarea
                          label="Avis"
                          value={item.text}
                          onChange={(e) => updateListItem('testimonials', i, { text: e.target.value })}
                          rows={3}
                        />
                        <Input
                          label="Avatar URL"
                          value={item.avatar}
                          onChange={(e) => updateListItem('testimonials', i, { avatar: e.target.value })}
                        />
                        <Input
                          label="Note (1-5)"
                          type="number"
                          min="1"
                          max="5"
                          value={item.rating}
                          onChange={(e) =>
                            updateListItem('testimonials', i, {
                              rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)),
                            })
                          }
                        />
                      </>
                    )}
                  />
                </>
              )}

              {activeTab === 'delivery' && (
                <>
                  <Input
                    label="Titre"
                    value={draft.deliveryTitle}
                    onChange={(e) => patch({ deliveryTitle: e.target.value })}
                  />
                  <Textarea
                    label="Texte descriptif"
                    value={draft.deliveryText}
                    onChange={(e) => patch({ deliveryText: e.target.value })}
                    rows={6}
                  />
                  <Input
                    label="Texte du bouton"
                    value={draft.deliveryCta}
                    onChange={(e) => patch({ deliveryCta: e.target.value })}
                    placeholder="Commander maintenant"
                  />
                  <ImageUploadField
                    label="Image"
                    value={draft.deliveryImage}
                    onUpload={() => uploadImageField('deliveryImage', 'delivery')}
                    onClear={() => patch({ deliveryImage: '' })}
                  />
                </>
              )}

              {activeTab === 'faq' && (
                <>
                  <Input
                    label="Titre FAQ"
                    value={draft.faqTitle}
                    onChange={(e) => patch({ faqTitle: e.target.value })}
                  />
                  <p className="text-xs font-medium text-gray-500">Questions fréquentes</p>
                  <ListEditor<FaqItem>
                    items={draft.faq}
                    onChange={(faq) => patch({ faq })}
                    onAdd={() => ({ id: `faq-${Date.now()}`, question: '', answer: '' })}
                    addLabel="Ajouter une question"
                    renderFields={(item, i) => (
                      <>
                        <Input
                          label={`Question ${i + 1}`}
                          value={item.question}
                          onChange={(e) => updateListItem('faq', i, { question: e.target.value })}
                        />
                        <Textarea
                          label={`Réponse ${i + 1}`}
                          value={item.answer}
                          onChange={(e) =>
                            updateListItem('faq', i, { answer: e.target.value })
                          }
                          rows={3}
                        />
                      </>
                    )}
                  />
                </>
              )}

              {activeTab === 'urgency' && (
                <>
                  <Input
                    label="Titre urgence"
                    value={draft.urgencyTitle}
                    onChange={(e) => patch({ urgencyTitle: e.target.value })}
                  />
                  <Input
                    label="Texte bouton final"
                    value={draft.urgencyCta}
                    onChange={(e) => patch({ urgencyCta: e.target.value })}
                  />
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <Input
                    label="Numéro WhatsApp"
                    value={draft.whatsappNumber}
                    onChange={(e) => patch({ whatsappNumber: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.whatsappActive}
                      onChange={(e) => patch({ whatsappActive: e.target.checked })}
                    />
                    Afficher le bouton WhatsApp flottant
                  </label>
                  <Input
                    label="Couleur principale"
                    type="color"
                    value={draft.primaryColor}
                    onChange={(e) => patch({ primaryColor: e.target.value })}
                  />
                   <Input
                     label="Couleur des boutons"
                     type="color"
                     value={draft.buttonColor}
                     onChange={(e) => patch({ buttonColor: e.target.value })}
                   />
                 </>
               )}

               {activeTab === 'facebook' && (
                 <>
                   <Input
                     label="ID Pixel Facebook"
                     value={draft.facebookPixelId}
                     onChange={(e) => patch({ facebookPixelId: e.target.value })}
                     placeholder="Ex: 1234567890"
                   />
                   <p className="text-xs text-gray-500">
                     Collez ici votre ID de pixel Facebook pour activer le suivi des conversions sur la boutique.
                   </p>
                 </>
               )}
             </CardBody>
          </Card>
        </div>

        {showPreview && product && (
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-gray-500">
                  Aperçu live — {viewport === 'mobile' ? 'Mobile' : viewport === 'tablet' ? 'Tablette' : 'Desktop'}
                </p>
                <DeviceToggle value={viewport} onChange={setViewport} />
              </div>
              <div
                className={`bg-gray-100 ${
                  viewport === 'desktop'
                    ? 'max-h-[calc(100vh-10rem)] overflow-y-auto'
                    : 'overflow-x-auto overflow-y-hidden py-2'
                }`}
              >
                <DevicePreviewFrame mode={viewport}>
                  <StorefrontPreview
                    key={`${draft.statsTitle}-${draft.stats.map((s) => s.id + s.value).join('|')}-${draft.testimonials.map((t) => t.id + t.text).join('|')}`}
                    content={draft}
                    product={product}
                    viewport={viewport}
                  />
                </DevicePreviewFrame>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
