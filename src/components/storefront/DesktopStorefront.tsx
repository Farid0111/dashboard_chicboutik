import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, Star, MessageCircle } from 'lucide-react'
import type { Product, SiteContent } from '../../types'
import { supabase } from '../../lib/supabase'
import type { ViewportMode } from './DevicePreviewFrame'

const FORM_FIELDS = [
  { label: 'Nom Complet', placeholder: 'Entrez votre nom complet', key: 'name' },
  { label: 'Email', placeholder: 'Entrez votre email', key: 'email' },
  { label: 'Numéro de téléphone', placeholder: 'Entrez votre numéro de téléphone', key: 'phone' },
  { label: 'Ville', placeholder: 'Entrez votre ville', key: 'city' },
  { label: 'Adresse', placeholder: 'Entrez votre adresse', key: 'address' },
] as const

interface DesktopStorefrontProps {
  content: SiteContent
  product: Product
  viewport: ViewportMode
}

export default function DesktopStorefront({ content, product, viewport }: DesktopStorefrontProps) {
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    if (!content.facebookPixelId) return
    if (document.getElementById('fb-pixel-script')) return

    const script = document.createElement('script')
    script.id = 'fb-pixel-script'
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${content.facebookPixelId}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)
  }, [content.facebookPixelId])

  const isTablet = viewport === 'tablet'
  const images = product.images.length > 0 ? product.images : [product.image]
  const stockText = content.stockWarning.replace('{stock}', String(content.stockCount))
  const variant = product.variants[selectedVariant]
  const itemPrice = product.price
  const itemTotal = itemPrice * quantity

  return (
    <div className="bg-[#f1f5f9] text-gray-900">
      <div className={`mx-auto grid max-w-6xl ${isTablet ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-6 px-4 py-6 ${!isTablet ? 'lg:gap-10 lg:py-10' : ''}`}>
        <div className={!isTablet ? 'lg:sticky lg:top-4 lg:self-start' : ''}>
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <img src={images[galleryIndex]} alt={product.name} className="aspect-square w-full object-cover" />
            <button
              type="button"
              onClick={() => setGalleryIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setGalleryIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGalleryIndex(i)}
                className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 ${
                  galleryIndex === i ? 'border-slate-800' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {content.urgencyBannerActive && (
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              {content.urgencyBanner}
            </span>
          )}

          <div>
            <h1 className="text-xl font-bold leading-snug lg:text-[1.35rem]">
              {content.productIcon && <span className="mr-1.5">{content.productIcon}</span>}
              {content.productTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{content.productDescription}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating} / 5</span>
            </div>
            <p className="mt-3 text-sm font-medium text-red-600">{stockText}</p>
            <p className="mt-2 text-3xl font-bold">{content.priceLabel}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <div key={f.id} className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <span className="text-xs leading-relaxed text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Quantité</p>
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-xl text-gray-500">−</button>
              <span className="flex h-10 min-w-[3rem] items-center justify-center border-x border-gray-200 font-semibold">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center text-xl text-gray-500">+</button>
            </div>
          </div>

          {product.variants.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Options</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(i)}
                    className={`flex flex-col items-center rounded-xl border-2 bg-white p-1.5 ${
                      selectedVariant === i ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={v.image} alt={v.name} className="h-16 w-16 rounded-lg object-cover" />
                    <span className="mt-1 text-[11px] font-semibold uppercase">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">{content.orderFormTitle}</h2>
            <p className="mt-1 text-sm text-gray-500">{content.orderFormSubtitle}</p>
            {submitted ? (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-800">
                Commande envoyée avec succès ! Nous vous contacterons bientôt.
              </div>
            ) : (
              <form
                className="mt-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!formData.name || !formData.phone || !formData.city || !formData.address) return
                  setSubmitting(true)
                  const order = {
                    customer_name: formData.name,
                    customer_email: formData.email || '',
                    customer_phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    product: product.name,
                    color: variant?.name || '',
                    quantity,
                    items: [
                      {
                        productId: product.id,
                        name: product.name,
                        quantity,
                        price: itemPrice,
                        image: product.image,
                        variant: variant?.name || '',
                      },
                    ],
                    total: itemTotal,
                    status: 'pending',
                  }
                  const { error } = await supabase.from('orders').insert(order)
                  if (!error) {
                    setSubmitted(true)
                  } else {
                    console.error('Error creating order:', error)
                    alert('Erreur lors de la commande. Veuillez réessayer.')
                  }
                  setSubmitting(false)
                }}
              >
                {FORM_FIELDS.map(({ label, placeholder, key }) => (
                  <div key={label}>
                    <label className="text-sm font-medium">{label} <span className="text-red-500">*</span></label>
                    <input
                      type={key === 'email' ? 'email' : 'text'}
                      required
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: content.buttonColor }}
                >
                  {submitting ? 'Envoi...' : content.orderButtonText}
                </button>
              </form>
            )}
            <p className="mt-3 text-center text-xs text-gray-500">
              Besoin d&apos;aide ? Contactez-nous via WhatsApp au {content.whatsappNumber}
            </p>
          </div>

          {content.testimonials[0] && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <img src={content.testimonials[0].avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: content.testimonials[0].rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold">{content.testimonials[0].name}</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-gray-600">&ldquo;{content.testimonials[0].text}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* Sections marketing */}
      {[
        { img: content.whyImage, title: content.whyTitle, features: content.whyFeatures, cta: content.whyCta, bg: 'bg-white' },
      ].map((section) => (
        <div key={section.title} className={`border-t border-gray-200 ${section.bg} py-12`}>
          <div className={`mx-auto grid max-w-6xl ${isTablet ? 'grid-cols-1' : 'lg:grid-cols-2'} items-center gap-8 px-4`}>
            <img src={section.img} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
            <div>
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <div className="mt-5 space-y-3">
                {section.features.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Check size={18} className="mt-0.5 shrink-0 text-blue-600" />
                    <span className="text-sm text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white" style={{ backgroundColor: content.buttonColor }}>
                {section.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-[#f1f5f9] py-12">
        <div className={`mx-auto grid max-w-6xl ${isTablet ? 'grid-cols-1' : 'lg:grid-cols-2'} items-center gap-8 px-4`}>
          <div>
            <h2 className="text-2xl font-bold">{content.heroTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{content.heroText}</p>
            <button type="button" className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white" style={{ backgroundColor: content.buttonColor }}>
              {content.heroCta}
            </button>
          </div>
          <img src={content.heroImage} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white py-12">
          <div className={`mx-auto grid max-w-6xl ${isTablet ? 'grid-cols-1' : 'lg:grid-cols-2'} items-start gap-8 px-4`}>
          {(content.compareImage || content.showcaseImage) && (
            <img src={content.compareImage || content.showcaseImage} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
          )}
          <div className="space-y-4">
            {content.compareTitle && (
              <h2 className="text-2xl font-bold">{content.compareTitle}</h2>
            )}
            {content.comparisons.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="font-semibold">{c.title}</p>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-800">{c.positive}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5">
                  <span className="text-sm font-bold text-red-500">✕</span>
                  <span className="text-sm text-red-700">{c.negative}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f1f5f9] py-12">
        <div className="mx-auto max-w-6xl px-4">
          {content.statsImage && (
            <img src={content.statsImage} alt="" className="mb-6 w-full rounded-2xl object-cover shadow-sm" />
          )}
          <h2 className="text-center text-2xl font-bold">{content.statsTitle}</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {content.stats.map((s) => (
              <div key={s.id} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <p className="text-3xl font-bold" style={{ color: content.primaryColor }}>{s.value}</p>
                <p className="mt-1 text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
          {content.testimonials.length > 1 && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.testimonials.slice(1).map((t) => (
                <div key={t.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="mt-1 text-sm italic text-gray-600">&ldquo;{t.text}&rdquo;</p>
                      <p className="mt-2 text-sm font-bold">{t.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Livraison Rapide Assuré */}
      <div className="border-t border-gray-200 bg-white py-12">
        <div className={`mx-auto grid max-w-6xl ${isTablet ? 'grid-cols-1' : 'lg:grid-cols-2'} items-center gap-8 px-4`}>
          <div>
            <h2 className="text-2xl font-bold">{content.deliveryTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 whitespace-pre-line">{content.deliveryText}</p>
            <button type="button" className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white" style={{ backgroundColor: content.buttonColor }}>
              {content.deliveryCta}
            </button>
          </div>
          <img src={content.deliveryImage} alt="" className="w-full rounded-2xl object-cover shadow-sm" />
        </div>
      </div>

      {/* Questions Fréquemment Posées */}
      <div className="border-t border-gray-200 bg-[#f1f5f9] py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold">{content.faqTitle}</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {content.faq.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-lg font-medium text-gray-900"
                >
                  <span>{item.question}</span>
                  <span className="text-gray-400">{openFaq === item.id ? '▲' : '▼'}</span>
                </button>
                {openFaq === item.id && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white py-12 text-center">
        <h2 className="text-2xl font-bold">{content.urgencyTitle}</h2>
        <button type="button" className="mt-6 rounded-full px-10 py-3.5 text-sm font-semibold text-white" style={{ backgroundColor: content.buttonColor }}>
          {content.urgencyCta}
        </button>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold">{content.reviewsMapTitle}</h2>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-sky-100" style={{ height: 280 }}>
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 800 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <rect fill="#bae6fd" width="800" height="400" />
                <ellipse cx="200" cy="180" rx="120" ry="80" fill="#7dd3fc" />
                <ellipse cx="400" cy="160" rx="90" ry="100" fill="#7dd3fc" />
                <ellipse cx="580" cy="190" rx="130" ry="85" fill="#7dd3fc" />
              </svg>
            </div>
            {[
              { top: '35%', left: '22%' },
              { top: '42%', left: '48%' },
              { top: '38%', left: '72%' },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
                style={{ top: pos.top, left: pos.left }}
              />
            ))}
          </div>
        </div>
      </div>

      {content.whatsappActive && (
        <div className="sticky bottom-4 flex justify-end px-4 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-4 ring-white">
            <MessageCircle size={28} className="text-white" />
          </div>
        </div>
      )}
    </div>
  )
}
