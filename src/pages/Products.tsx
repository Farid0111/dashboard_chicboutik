import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react'
import Header from '../components/layout/Header'
import Card from '../components/ui/Card'
import { ActiveBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input, Textarea, Select } from '../components/ui/Input'
import { useStore } from '../context/StoreContext'
import type { Product, ProductFeature, ProductVariant } from '../types'
import { formatFcfa } from '../utils/format'

const categories = [
  { value: 'Ventilateur', label: 'Ventilateur' },
  { value: 'Accessoires', label: 'Accessoires' },
  { value: 'Autre', label: 'Autre' },
]

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  comparePrice: undefined as number | undefined,
  category: 'Ventilateur',
  stock: 0,
  image: '',
  images: [] as string[],
  variants: [] as ProductVariant[],
  features: [] as ProductFeature[],
  rating: 4.5,
  reviewCount: 0,
  active: true,
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, uploadImage } = useStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [variantFiles, setVariantFiles] = useState<(File | null)[]>([])
  const mainImageRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditingProduct(null)
    setForm(emptyProduct)
    setMainImageFile(null)
    setGalleryFiles([])
    setVariantFiles([])
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      category: product.category,
      stock: product.stock,
      image: product.image,
      images: product.images,
      variants: product.variants,
      features: product.features,
      rating: product.rating,
      reviewCount: product.reviewCount,
      active: product.active,
    })
    setMainImageFile(null)
    setGalleryFiles([])
    setVariantFiles([])
    setModalOpen(true)
  }

  function handleSave() {
    setSaveStatus('saving')
    setSaveMessage('')
    const saveProduct = async () => {
      try {
        let imageUrl = form.image

        if (mainImageFile) {
          try {
            imageUrl = await uploadImage(mainImageFile, `product-${Date.now()}-main`)
          } catch (uploadErr) {
            console.warn('Main image upload failed, using existing URL:', uploadErr)
          }
        }

        let imageUrls = form.images.filter((url) => url && !url.startsWith('blob:'))

        if (galleryFiles.length > 0) {
          try {
            const uploadedUrls = await Promise.all(
              galleryFiles.map((f) => uploadImage(f, `product-${Date.now()}-gallery`))
            )
            imageUrls = uploadedUrls
          } catch (uploadErr) {
            console.warn('Gallery upload failed:', uploadErr)
          }
        }

        const variantsWithImages = await Promise.all(
          form.variants.map(async (v, i) => {
            if (variantFiles[i]) {
              try {
                const url = await uploadImage(variantFiles[i]!, `product-${Date.now()}-variant-${i}`)
                return { ...v, image: url }
              } catch (uploadErr) {
                console.warn(`Variant ${i} upload failed:`, uploadErr)
                return v
              }
            }
            return v
          })
        )

        const finalImage = imageUrl || 'https://images.unsplash.com/photo-1505740106531-4243f3831c05?w=400&h=400&fit=crop'

        const data = {
          ...form,
          image: finalImage,
          images: imageUrls.length > 0 ? imageUrls : [finalImage],
          variants: variantsWithImages,
        }

        if (editingProduct) {
          await updateProduct(editingProduct.id, data)
        } else {
          await addProduct(data)
        }
        setSaveStatus('success')
        setSaveMessage('Produit sauvegardé avec succès !')
        setModalOpen(false)
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch (err) {
        console.error('Save error:', err)
        setSaveStatus('error')
        setSaveMessage(`Erreur: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setSaveStatus('idle')
      }
    }
    saveProduct()
  }

  function handleDelete(id: string) {
    deleteProduct(id)
    setDeleteConfirm(null)
  }

  return (
    <>
      <Header title="Produits" subtitle={`${products.length} produit(s) au catalogue`} />

      <div className="space-y-6 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-72"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus size={18} />
            Ajouter un produit
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute right-2 top-2">
                  <ActiveBadge active={product.active} />
                </div>
                {product.stock <= 10 && product.active && (
                  <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                    Stock faible
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {product.category}
                </p>
                <h3 className="mt-1 font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatFcfa(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatFcfa(product.comparePrice)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Stock : {product.stock}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                    <Pencil size={14} />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(product.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-500">Aucun produit trouvé.</p>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nom du produit"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Sneakers Urban Pro"
            />
            <Select
              label="Catégorie"
              options={categories}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez le produit..."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Prix (FCFA)"
              type="number"
              step="0.01"
              min="0"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Prix barré (FCFA)"
              type="number"
              step="0.01"
              min="0"
              value={form.comparePrice || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  comparePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Image principale</p>
            <input
              ref={mainImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setMainImageFile(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setForm({ ...form, image: url })
                }
              }}
            />
            <div
              className="flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50"
              onClick={() => mainImageRef.current?.click()}
            >
              {form.image ? (
                <img src={form.image} alt="Aperçu" className="h-full w-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={24} />
                  <span className="text-xs">Cliquez pour importer</span>
                </div>
              )}
            </div>
            {form.image && !mainImageFile && (
              <button
                type="button"
                className="mt-2 text-xs text-red-600 hover:text-red-800"
                onClick={() => {
                  setForm({ ...form, image: '' })
                  if (mainImageRef.current) mainImageRef.current.value = ''
                }}
              >
                Supprimer
              </button>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Galerie d'images</p>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setGalleryFiles(files)
                const urls = files.map((f) => URL.createObjectURL(f))
                setForm({ ...form, images: urls })
              }}
            />
            <div
              className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50"
              onClick={() => galleryRef.current?.click()}
            >
              {form.images.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {form.images.map((url, i) => (
                    <img key={i} src={url} alt={`Galerie ${i + 1}`} className="h-full w-16 object-cover rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={20} />
                  <span className="text-xs">Ajouter des images</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Note (sur 5)"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating || ''}
              onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Nombre d'avis"
              type="number"
              min="0"
              value={form.reviewCount || ''}
              onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Caractéristiques</p>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    value={f.text}
                    onChange={(e) => {
                      const next = [...form.features]
                      next[i] = { ...f, text: e.target.value }
                      setForm({ ...form, features: next })
                    }}
                    placeholder="Ex: Rotation à 360 degrés..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-red-600"
                    onClick={() =>
                      setForm({ ...form, features: form.features.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    features: [...form.features, { id: `f-${Date.now()}`, text: '' }],
                  })
                }
              >
                + Caractéristique
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Variantes (NOIR, BLANC…)</p>
            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={v.id} className="rounded-lg border border-gray-100 p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      label="Nom"
                      value={v.name}
                      onChange={(e) => {
                        const next = [...form.variants]
                        next[i] = { ...v, name: e.target.value }
                        setForm({ ...form, variants: next })
                      }}
                    />
                    <div className="flex-1">
                      <p className="mb-1 text-xs font-medium text-gray-500">Image</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`variant-file-${i}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            const nextFiles = [...variantFiles]
                            nextFiles[i] = file
                            setVariantFiles(nextFiles)
                            if (file) {
                              const url = URL.createObjectURL(file)
                              const nextVariants = [...form.variants]
                              nextVariants[i] = { ...v, image: url }
                              setForm({ ...form, variants: nextVariants })
                            }
                          }}
                        />
                        <label
                          htmlFor={`variant-file-${i}`}
                          className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 hover:border-brand-500 hover:bg-brand-50"
                        >
                          {v.image ? (
                            <img src={v.image} alt={v.name} className="h-full w-full object-cover rounded" />
                          ) : (
                            <span>Importer</span>
                          )}
                        </label>
                        {v.image && (
                          <button
                            type="button"
                            className="shrink-0 text-xs text-red-600 hover:text-red-800"
                            onClick={() => {
                              const nextFiles = [...variantFiles]
                              nextFiles[i] = null
                              setVariantFiles(nextFiles)
                              const nextVariants = [...form.variants]
                              nextVariants[i] = { ...v, image: '' }
                              setForm({ ...form, variants: nextVariants })
                            }}
                          >
                            Suppr
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() =>
                      setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })
                    }
                  >
                    Supprimer la variante
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    variants: [
                      ...form.variants,
                      {
                        id: `v-${Date.now()}`,
                        name: 'NOUVEAU',
                        color: '#ccc',
                        image: form.image,
                      },
                    ],
                  })
                }
              >
                + Variante
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Produit actif (visible sur la boutique)
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!form.name || !form.price || saveStatus === 'saving'}>
              {saveStatus === 'saving'
                ? 'Sauvegarde...'
                : editingProduct
                  ? 'Enregistrer'
                  : 'Créer le produit'}
            </Button>
            {saveStatus === 'success' && (
              <span className="text-sm font-medium text-green-600 ml-4">{saveMessage}</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm font-medium text-red-600 ml-4">{saveMessage}</span>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer le produit"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </>
  )
}
