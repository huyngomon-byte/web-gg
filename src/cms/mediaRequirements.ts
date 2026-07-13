export type MediaDimensionRequirements = {
  label: string
  minWidth: number
  minHeight: number
  minRatio: number
  maxRatio: number
}

export function getImageRequirements(folder: string): MediaDimensionRequirements | null {
  const value = folder.toLowerCase()
  if (value.includes('background-carousel')) return { label: '4K portrait story image', minWidth: 3072, minHeight: 3840, minRatio: 0.72, maxRatio: 0.9 }
  if (value.includes('homepage-banner-desktop')) return { label: 'Homepage desktop banner', minWidth: 3840, minHeight: 1370, minRatio: 2, maxRatio: 2.8 }
  if (value.includes('homepage-banner-mobile') || value.includes('banner-mobile')) return { label: 'Mobile banner', minWidth: 1080, minHeight: 810, minRatio: 1.1, maxRatio: 1.6 }
  if (value.includes('homepage-thumbnails')) return { label: 'Homepage thumbnail', minWidth: 1080, minHeight: 608, minRatio: 1.55, maxRatio: 1.95 }
  if (value.includes('/avatars')) return { label: 'Avatar card image', minWidth: 640, minHeight: 360, minRatio: 1.4, maxRatio: 1.9 }
  if (value.includes('background-mobile') || value.includes('video-mobile')) return { label: 'Mobile hero/poster', minWidth: 1080, minHeight: 1440, minRatio: 0.5, maxRatio: 1.05 }
  if (/\/hero\/background$/.test(value)) return { label: 'Desktop hero background', minWidth: 3840, minHeight: 2160, minRatio: 1.5, maxRatio: 2.1 }
  if (/\/people\/[^/]+\/banner$/.test(value)) return { label: 'People desktop banner', minWidth: 3840, minHeight: 1200, minRatio: 1.8, maxRatio: 3.2 }
  if (/\/people\/[^/]+\/thumbnail$/.test(value)) return { label: 'People thumbnail', minWidth: 640, minHeight: 400, minRatio: 1.4, maxRatio: 1.9 }
  if (/\/homepage\/(?:hero|closing)\/video$/.test(value)) return { label: 'Desktop video poster', minWidth: 3840, minHeight: 2160, minRatio: 1.5, maxRatio: 2.1 }
  return null
}

export function getVideoRequirements(folder: string): MediaDimensionRequirements | null {
  const value = folder.toLowerCase()
  if (/\/homepage\/(?:hero|closing)\/video-mobile$/.test(value)) {
    return { label: 'Mobile background video', minWidth: 1440, minHeight: 810, minRatio: 0.55, maxRatio: 1.9 }
  }
  if (/\/homepage\/(?:hero|closing)\/video$/.test(value)) {
    return { label: 'Desktop background video', minWidth: 3840, minHeight: 2160, minRatio: 1.5, maxRatio: 2.1 }
  }
  return null
}
