// Central Cloudinary delivery helpers. Keep originals in Cloudinary and let the
// browser select the smallest candidate that is sharp for its layout width and
// device pixel ratio.

const CLOUDINARY_IMAGE_URL = /res\.cloudinary\.com\/[^/]+\/image\/upload\//
const CLOUDINARY_DELIVERY_TRANSFORM = /\/upload\/[^/]*\b[wcqf]_[^/]*\//

export const CLOUDINARY_IMAGE_MAX_WIDTH = 3840

export const CLOUDINARY_RESPONSIVE_WIDTHS = {
  // A 360px phone at DPR 3 and the widest common mobile layout are covered by
  // 1080px without downloading a desktop-sized source.
  mobile: [360, 540, 720, 900, 1080],
  // Browser width-descriptor selection is DPR-aware when the caller supplies an
  // accurate `sizes` attribute. The 4K candidate is therefore only requested
  // for a genuinely large/high-DPR rendered image.
  desktop: [1080, 1440, 1920, 2560, 3200, 3840],
  full: [360, 540, 720, 900, 1080, 1440, 1920, 2560, 3200, 3840],
} as const

// Story cards top out at 660 CSS pixels. These candidates cover a 3x phone
// and a Retina desktop card without shipping a wasteful 4K derivative.
// The original 3072×3840 master remains untouched in Cloudinary.
export const CLOUDINARY_STORY_MEDIA_WIDTHS = [360, 540, 720, 900, 1080, 1280, 1440, 1720, 1920, 2160] as const

export type CloudinaryImageQuality = 'good' | 'best'
export type CloudinaryResponsiveProfile = keyof typeof CLOUDINARY_RESPONSIVE_WIDTHS

function isTransformableCloudinaryUrl(url: string) {
  if (!CLOUDINARY_IMAGE_URL.test(url)) return false
  // Do not stack delivery transforms on top of a URL intentionally transformed
  // in the CMS. Raw upload URLs and URLs produced by this helper remain stable.
  if (CLOUDINARY_DELIVERY_TRANSFORM.test(url)) return false
  return true
}

function normalizeWidth(width: number) {
  if (!Number.isFinite(width) || width <= 0) return 0
  return Math.min(CLOUDINARY_IMAGE_MAX_WIDTH, Math.round(width))
}

function normalizeWidths(widths: readonly number[]) {
  return [...new Set(widths.map(normalizeWidth).filter(Boolean))].sort((left, right) => left - right)
}

export function cldWidth(
  url: string | undefined,
  width: number,
  quality: CloudinaryImageQuality = 'good',
) {
  const value = (url ?? '').trim()
  const safeWidth = normalizeWidth(width)
  if (!value || !safeWidth || !isTransformableCloudinaryUrl(value)) return value
  if (quality === 'best') {
    return value.replace(
      '/upload/',
      `/upload/c_limit,w_${safeWidth}/e_sharpen:40/f_auto,q_auto:best/`,
    )
  }
  return value.replace('/upload/', `/upload/f_auto,q_auto:${quality},c_limit,w_${safeWidth}/`)
}

export function cldSrcSet(
  url: string | undefined,
  widths: readonly number[],
  quality: CloudinaryImageQuality = 'good',
) {
  const value = (url ?? '').trim()
  if (!value || !isTransformableCloudinaryUrl(value)) return undefined
  const candidates = normalizeWidths(widths)
  if (!candidates.length) return undefined
  return candidates.map((width) => `${cldWidth(value, width, quality)} ${width}w`).join(', ')
}

export function cldResponsiveSrcSet(
  url: string | undefined,
  profile: CloudinaryResponsiveProfile = 'full',
  quality: CloudinaryImageQuality = 'good',
) {
  return cldSrcSet(url, CLOUDINARY_RESPONSIVE_WIDTHS[profile], quality)
}

export function cldStoryMediaWidth(url: string | undefined, width: number) {
  const value = (url ?? '').trim()
  const safeWidth = normalizeWidth(width)
  if (!value || !safeWidth || !isTransformableCloudinaryUrl(value)) return value
  return value.replace(
    '/upload/',
    `/upload/c_limit,w_${safeWidth}/e_sharpen:30/f_auto,q_auto:good/`,
  )
}

export function cldStoryMediaSrcSet(url: string | undefined) {
  const value = (url ?? '').trim()
  if (!value || !isTransformableCloudinaryUrl(value)) return undefined
  return CLOUDINARY_STORY_MEDIA_WIDTHS
    .map((width) => `${cldStoryMediaWidth(value, width)} ${width}w`)
    .join(', ')
}

export function cldResponsiveImage(
  url: string | undefined,
  options: {
    profile?: CloudinaryResponsiveProfile
    quality?: CloudinaryImageQuality
    sizes: string
    fallbackWidth?: number
  },
) {
  const profile = options.profile ?? 'full'
  const widths = CLOUDINARY_RESPONSIVE_WIDTHS[profile]
  const fallbackWidth = options.fallbackWidth ?? (profile === 'mobile' ? 1080 : 1920)

  return {
    src: cldWidth(url, fallbackWidth, options.quality),
    srcSet: cldSrcSet(url, widths, options.quality),
    sizes: options.sizes,
  }
}
