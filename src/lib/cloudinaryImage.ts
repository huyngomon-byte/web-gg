// Round 11 P0-A: the single Cloudinary delivery helper. The frontend must never
// render a raw upload URL — every Cloudinary image goes through here.
//
// Quality guardrails (Round 11 §2, PO constraint):
// - q_auto:good minimum (never eco/low), f_auto (AVIF/WebP are sharper per byte)
// - widths in the role table are already ×2 DPR; callers pass 1x/2x pairs via srcset
// - c_limit: never upscale beyond the original — originals stay untouched in Cloudinary

const CLOUDINARY_IMAGE_URL = /res\.cloudinary\.com\/[^/]+\/image\/upload\//

function isTransformableCloudinaryUrl(url: string) {
  if (!CLOUDINARY_IMAGE_URL.test(url)) return false
  // Already carries a transform (w_/c_/q_ segment right after /upload/) — leave it alone.
  if (/\/upload\/[^/]*\b[wcq]_[^/]*\//.test(url)) return false
  return true
}

export function cldWidth(url: string | undefined, width: number, quality: 'good' | 'best' = 'good') {
  const value = (url ?? '').trim()
  if (!value || !isTransformableCloudinaryUrl(value)) return value
  return value.replace('/upload/', `/upload/f_auto,q_auto:${quality},c_limit,w_${width}/`)
}

export function cldSrcSet(url: string | undefined, widths: number[], quality: 'good' | 'best' = 'good') {
  const value = (url ?? '').trim()
  if (!value || !isTransformableCloudinaryUrl(value)) return undefined
  return widths.map((width) => `${cldWidth(value, width, quality)} ${width}w`).join(', ')
}
