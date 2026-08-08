import type { Product, SiteContent } from '../../types'
import type { ViewportMode } from './DevicePreviewFrame'
import MobileStorefront from './MobileStorefront'
import DesktopStorefront from './DesktopStorefront'

interface StorefrontPreviewProps {
  content: SiteContent
  product: Product
  viewport?: ViewportMode
}

export default function StorefrontPreview({
  content,
  product,
  viewport = 'desktop',
}: StorefrontPreviewProps) {
  if (viewport === 'mobile') {
    return <MobileStorefront content={content} product={product} />
  }

  return <DesktopStorefront content={content} product={product} viewport={viewport} />
}
