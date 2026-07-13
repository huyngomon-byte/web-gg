import type { CSSProperties } from 'react'

export type StoryBrandLogoTone = 'brand' | 'light'
export type StoryBrandLogoVariant = 'ring' | 'compact' | 'header' | 'suggested' | 'profile'

type StoryBrandLogoAsset = {
  alt: string
  src: string
  tone: StoryBrandLogoTone
}

/**
 * Story avatars use normalized 384px transparent derivatives. They stay sharp
 * through DPR 3 while avoiding decode of multi-thousand-pixel source logos.
 */
export const storyBrandLogoAssets: Readonly<Record<string, StoryBrandLogoAsset>> = {
  phinoi: { alt: 'PHINƠI', src: '/story-logos/phinoi.webp', tone: 'brand' },
  'cota-cuti': { alt: 'cota.cuti', src: '/story-logos/cotacuti.webp', tone: 'light' },
  inkaholic: { alt: 'INKAHOLIC', src: '/story-logos/inkaholic.webp', tone: 'light' },
  'qanda-books': { alt: 'QANDA Books', src: '/story-logos/qandabook.webp', tone: 'brand' },
  curnon: { alt: 'CURNON', src: '/story-logos/curnon.webp', tone: 'light' },
  'annita-studios': { alt: 'ANNITA STUDIOS', src: '/story-logos/annita.webp', tone: 'brand' },
  gg99: { alt: 'The One - GG99', src: '/story-logos/gg.webp', tone: 'brand' },
}

const storyBrandLogoAliases: Readonly<Record<string, string>> = {
  annita: 'annita-studios',
  annitastudios: 'annita-studios',
  cotacuti: 'cota-cuti',
  'cota.cuti': 'cota-cuti',
  gg: 'gg99',
  qanda: 'qanda-books',
  'qanda books': 'qanda-books',
  qandabook: 'qanda-books',
  qandabooks: 'qanda-books',
}

const variantSizes: Readonly<Record<StoryBrandLogoVariant, number>> = {
  ring: 88,
  compact: 40,
  header: 44,
  suggested: 40,
  profile: 48,
}

function normalizeStoryBrandId(value: string) {
  const normalized = value
    .trim()
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
  return storyBrandLogoAliases[normalized] ?? normalized
}

export function getStoryBrandLogoAsset(storyId: string) {
  return storyBrandLogoAssets[normalizeStoryBrandId(storyId)]
}

export type StoryBrandLogoProps = {
  storyId: string
  brandName?: string
  /** Fallback for future CMS-only brands without a normalized local asset. */
  src?: string
  /** Overrides the per-brand light-knockout/original-colour treatment. */
  tone?: StoryBrandLogoTone
  variant?: StoryBrandLogoVariant
  size?: number
  alt?: string
  decorative?: boolean
  eager?: boolean
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
  imageClassName?: string
}

export function StoryBrandLogo({
  storyId,
  brandName,
  src,
  tone,
  variant = 'header',
  size,
  alt,
  decorative = false,
  eager = false,
  loading,
  fetchPriority,
  className = '',
  imageClassName = '',
}: StoryBrandLogoProps) {
  const normalizedStoryId = normalizeStoryBrandId(storyId)
  const asset = storyBrandLogoAssets[normalizedStoryId]
  const resolvedSize = Math.max(1, Math.round(size ?? variantSizes[variant]))
  // QANDA and GG99 use bundled circular derivatives so their complete marks
  // remain centered and uncropped in profile-avatar contexts.
  const cmsSrc = src?.trim()
  const usesBundledCircularAvatar = (normalizedStoryId === 'qanda-books' || normalizedStoryId === 'gg99') && Boolean(asset)
  const resolvedTone = tone ?? (usesBundledCircularAvatar ? asset?.tone ?? 'brand' : cmsSrc ? 'brand' : asset?.tone ?? 'brand')
  const resolvedSrc = usesBundledCircularAvatar ? asset?.src ?? storyBrandLogoAssets.gg99.src : cmsSrc || asset?.src || storyBrandLogoAssets.gg99.src
  const label = brandName?.trim() || asset?.alt || 'Brand'
  const accessibleAlt = decorative ? '' : alt?.trim() || `${label} logo`
  const shellStyle = { '--story-logo-size': `${resolvedSize}px` } as CSSProperties

  return (
    <span
      className={`story-brand-logo-shell story-brand-logo-shell--${variant} ${className}`.trim()}
      data-logo-tone={resolvedTone}
      data-logo-source={usesBundledCircularAvatar || !cmsSrc ? 'asset' : 'cms'}
      data-story-brand={normalizedStoryId}
      style={shellStyle}
      aria-hidden={decorative || undefined}
    >
      <img
        src={resolvedSrc}
        alt={accessibleAlt}
        width={resolvedSize}
        height={resolvedSize}
        className={`story-brand-logo ${imageClassName}`.trim()}
        loading={loading ?? (eager ? 'eager' : 'lazy')}
        fetchPriority={fetchPriority ?? (eager ? 'high' : 'auto')}
        decoding="async"
        draggable={false}
      />
    </span>
  )
}
