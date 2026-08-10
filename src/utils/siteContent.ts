import type { SiteContent } from '../types'
import { initialSiteContent } from '../data/mockData'

export function normalizeSiteContent(raw: Partial<SiteContent> | null | undefined): SiteContent {
  const stored = raw ?? {}
  return {
    ...initialSiteContent,
    ...stored,
    productIcon: stored.productIcon ?? initialSiteContent.productIcon,
    whyFeatures:
      Array.isArray(stored.whyFeatures)
        ? stored.whyFeatures
        : initialSiteContent.whyFeatures,
  comparisons:
    Array.isArray(stored.comparisons)
      ? stored.comparisons
      : initialSiteContent.comparisons,
  compareImage:
    typeof stored.compareImage === 'string' && stored.compareImage.length > 0
      ? stored.compareImage
      : initialSiteContent.compareImage,
  compareTitle:
    typeof stored.compareTitle === 'string' && stored.compareTitle.length > 0
      ? stored.compareTitle
      : initialSiteContent.compareTitle,
  faq:
    Array.isArray(stored.faq)
      ? stored.faq
      : initialSiteContent.faq,
  stats:
    Array.isArray(stored.stats)
      ? stored.stats
      : initialSiteContent.stats,
    testimonials:
      Array.isArray(stored.testimonials)
        ? stored.testimonials
        : initialSiteContent.testimonials,
  statsImage:
    typeof stored.statsImage === 'string' && stored.statsImage.length > 0
      ? stored.statsImage
      : initialSiteContent.statsImage,
  }
}
