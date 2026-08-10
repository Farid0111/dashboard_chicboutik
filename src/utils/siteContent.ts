import type { SiteContent } from '../types'
import { initialSiteContent } from '../data/mockData'

export function normalizeSiteContent(raw: Partial<SiteContent> | null | undefined): SiteContent {
  const stored = raw ?? {}
  return {
    ...initialSiteContent,
    ...stored,
    productIcon: stored.productIcon ?? initialSiteContent.productIcon,
    whyFeatures:
      Array.isArray(stored.whyFeatures) && stored.whyFeatures.length > 0
        ? stored.whyFeatures
        : initialSiteContent.whyFeatures,
  comparisons:
    Array.isArray(stored.comparisons) && stored.comparisons.length > 0
      ? stored.comparisons
      : initialSiteContent.comparisons,
  compareTitle:
    typeof stored.compareTitle === 'string' && stored.compareTitle.length > 0
      ? stored.compareTitle
      : initialSiteContent.compareTitle,
  faq:
    Array.isArray(stored.faq) && stored.faq.length > 0
      ? stored.faq
      : initialSiteContent.faq,
  stats:
    Array.isArray(stored.stats) && stored.stats.length > 0
      ? stored.stats
      : initialSiteContent.stats,
    testimonials:
      Array.isArray(stored.testimonials) && stored.testimonials.length > 0
        ? stored.testimonials
        : initialSiteContent.testimonials,
  statsImage:
    typeof stored.statsImage === 'string' && stored.statsImage.length > 0
      ? stored.statsImage
      : initialSiteContent.statsImage,
  reviewsMapImage:
    typeof stored.reviewsMapImage === 'string' && stored.reviewsMapImage.length > 0
      ? stored.reviewsMapImage
      : initialSiteContent.reviewsMapImage,
  }
}
