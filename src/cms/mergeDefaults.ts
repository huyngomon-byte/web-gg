import type { CmsBlock, CmsBlockItem } from './types'

function normalizedKey(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function itemKeys(item: CmsBlockItem) {
  return [item.href, item.id, item.title, item.label].map(normalizedKey).filter(Boolean)
}

function itemsMatch(left: CmsBlockItem, right: CmsBlockItem) {
  const leftKeys = itemKeys(left)
  const rightKeys = new Set(itemKeys(right))
  return leftKeys.some((key) => rightKeys.has(key))
}

function mergeStoryItem(templateItem: CmsBlockItem, currentItem: CmsBlockItem): CmsBlockItem {
  return {
    ...templateItem,
    ...currentItem,
    backgroundImages: currentItem.backgroundImages ?? templateItem.backgroundImages,
    homepageGalleryImages: currentItem.homepageGalleryImages ?? templateItem.homepageGalleryImages,
    services: currentItem.services ?? templateItem.services,
    keyMetrics: currentItem.keyMetrics ?? templateItem.keyMetrics,
    socialLinks: {
      ...templateItem.socialLinks,
      ...currentItem.socialLinks,
    },
    screenBackground: {
      ...templateItem.screenBackground,
      ...currentItem.screenBackground,
    },
    storyDetail: {
      ...templateItem.storyDetail,
      ...currentItem.storyDetail,
    },
    // Same rule as the block-level merge (Round 8): never inherit stale template locale overlays.
    locales: currentItem.locales,
  }
}

function mergeStoryItems(templateItems: CmsBlockItem[] = [], currentItems: CmsBlockItem[] = []) {
  const usedTemplateIndexes = new Set<number>()
  const mergedItems = currentItems.map((currentItem) => {
    const templateIndex = templateItems.findIndex((templateItem, index) => !usedTemplateIndexes.has(index) && itemsMatch(currentItem, templateItem))
    if (templateIndex < 0) return currentItem

    usedTemplateIndexes.add(templateIndex)
    return mergeStoryItem(templateItems[templateIndex], currentItem)
  })

  // Round 10 fix: the CMS doc is the single source of truth for content. Unmatched
  // template items must NOT be appended — they resurrect stale seed posts (old metrics,
  // pre-cleanup money figures) alongside the real ones whenever key matching drifts.
  if (currentItems.length) return mergedItems

  return templateItems
}

export function mergeCmsBlockWithTemplate(templateBlock: CmsBlock, currentBlock: CmsBlock | undefined): CmsBlock {
  if (!currentBlock) return templateBlock

  const templateItems = templateBlock.items ?? []
  const currentItems = currentBlock.items ?? []
  const items = templateBlock.id === 'stories'
    ? mergeStoryItems(templateItems, currentItems)
    : currentItems.length
      ? currentItems
      : templateItems

  return {
    ...templateBlock,
    ...currentBlock,
    items,
    // Single-language content: never inherit bilingual overlays from the template.
    // Stale template locales would otherwise shadow freshly edited base fields
    // at render time (the CMS docs dropped their locale maps in the EN migration).
    locales: currentBlock.locales,
  }
}
