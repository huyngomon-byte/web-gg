import type { BrandLang, PageMeta } from '../brandContent'
import type { CmsBlock, CmsBlockItem, CmsPageContent } from './types'

export function getCmsBlock(page: CmsPageContent | null | undefined, id: string) {
  return page?.blocks.find((block) => block.id === id)
}

function hasText(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null
}

function mergeLocalizedFields<T extends Record<string, unknown>>(base: T, localized?: Partial<T>): T {
  if (!localized) return base
  const next = { ...base }
  Object.entries(localized).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length) (next as Record<string, unknown>)[key] = value
      return
    }
    if (value && typeof value === 'object') {
      (next as Record<string, unknown>)[key] = {
        ...((next as Record<string, unknown>)[key] as Record<string, unknown> | undefined),
        ...value,
      }
      return
    }
    if (hasText(value)) (next as Record<string, unknown>)[key] = value
  })
  return next
}

export function localizeCmsBlockItem(item: CmsBlockItem, lang: BrandLang): CmsBlockItem {
  return mergeLocalizedFields(item, item.locales?.[lang] as Partial<CmsBlockItem> | undefined)
}

export function localizeCmsBlock(block: CmsBlock, lang: BrandLang): CmsBlock {
  const localized = mergeLocalizedFields(block, block.locales?.[lang] as Partial<CmsBlock> | undefined)
  return {
    ...localized,
    items: localized.items?.map((item) => localizeCmsBlockItem(item, lang)),
  }
}

export function getLocalizedCmsBlock(page: CmsPageContent | null | undefined, id: string, lang: BrandLang) {
  const block = getCmsBlock(page, id)
  return block ? localizeCmsBlock(block, lang) : undefined
}

export function getCmsBlocks(page: CmsPageContent | null | undefined, excludeIds: string[] = []) {
  const excluded = new Set(excludeIds)
  return page?.blocks.filter((block) => !excluded.has(block.id)) ?? []
}

export function getLocalizedCmsBlocks(page: CmsPageContent | null | undefined, lang: BrandLang, excludeIds: string[] = []) {
  const excluded = new Set(excludeIds)
  return page?.blocks.filter((block) => !excluded.has(block.id)).map((block) => localizeCmsBlock(block, lang)) ?? []
}

export function getLocalizedPageMeta(page: CmsPageContent | null | undefined, lang: BrandLang, fallback: PageMeta) {
  if (!page) return fallback
  if (lang === 'vi') return { ...fallback, ...page.meta }
  return { ...fallback, ...(page.metaLocales?.[lang] ?? {}) }
}

export function splitCmsParagraphs(body: string | null | undefined) {
  return String(body || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
