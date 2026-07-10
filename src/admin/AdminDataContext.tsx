'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { getIdTokenResult, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from 'firebase/auth'
import { defaultCmsInsights, defaultCmsPages, defaultCmsSiteSettings } from '../cms/defaultContent'
import { getFirebaseClient, isFirebaseConfigured } from '../cms/firebaseClient'
import { mergeCmsBlockWithTemplate } from '../cms/mergeDefaults'
import { mergeCmsSiteSettings } from '../cms/siteSettings'
import { getCmsSiteSettings, listCmsInsights, listCmsPages, saveCmsInsight, saveCmsPage, saveCmsSiteSettings, seedDefaultContent } from '../cms/cmsRepository'
import { getInsightRevalidatePaths, getPageRevalidatePaths, hiddenCmsPageIds, siteSettingsRevalidatePaths } from '../cms/adminNav'
import type { CmsBlock, CmsBlockItem, CmsInsightContent, CmsPageContent, CmsSiteSettings, CmsStatus } from '../cms/types'

type PageMetaKey = keyof CmsPageContent['meta']
type InsightMetaKey = keyof CmsInsightContent['meta']

const emptyBlock: CmsBlock = {
  id: 'new-block',
  heading: '',
  body: '',
  icon: '',
  imageUrl: '',
  imageAlt: '',
  backgroundImageUrl: '',
  backgroundGradient: '',
  backgroundOverlayOpacity: '',
  ctaLabel: '',
  ctaHref: '',
  items: [],
}

const emptyItem: CmsBlockItem = {
  title: '',
  body: '',
  icon: '',
  accountName: '',
  displayName: '',
  logoUrl: '',
  verified: false,
  caption: '',
  likesSeed: '',
  imageUrl: '',
  imageAlt: '',
  avatarImages: [],
  homepageGalleryImages: [],
  href: '',
  label: '',
}

const emptyInsightSection = { heading: 'Section mới', paragraphs: ['Nội dung section mới.'] }

// Combining diacritical marks (U+0300–U+036F), stripped after NFD normalize for slug generation.
const diacriticsRe = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g')

function createId(input: string, fallback: string) {
  const next = input
    .normalize('NFD')
    .replace(diacriticsRe, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  return next || fallback
}

function normalizePage(page: CmsPageContent): CmsPageContent {
  const template = defaultCmsPages.find((item) => item.id === page.id)
  if (!template) return { ...page, blocks: page.blocks ?? [] }

  const currentBlocks = page.blocks ?? []
  const currentById = new Map(currentBlocks.map((block) => [block.id, block]))
  const templateIds = new Set(template.blocks.map((block) => block.id))
  const mergedBlocks = template.blocks.map((templateBlock) => mergeCmsBlockWithTemplate(templateBlock, currentById.get(templateBlock.id)))
  const extraBlocks = currentBlocks.filter((block) => !templateIds.has(block.id))

  return {
    ...template,
    ...page,
    meta: { ...template.meta, ...page.meta },
    // Single-language content: never pull template metaLocales into the editable page —
    // saving would write stale template overlays back to Firestore, shadowing base edits.
    metaLocales: page.metaLocales,
    blocks: [...mergedBlocks, ...extraBlocks],
  }
}

function normalizePages(pages: CmsPageContent[]) {
  const visiblePages = pages.filter((page) => !hiddenCmsPageIds.has(page.id))
  const currentIds = new Set(visiblePages.map((page) => page.id))
  return [
    ...visiblePages.map(normalizePage),
    ...defaultCmsPages.filter((page) => !hiddenCmsPageIds.has(page.id) && !currentIds.has(page.id)),
  ]
}

function setAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item))
}

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  switch (code) {
    case 'auth/invalid-email':
      return 'Email đăng nhập không hợp lệ.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email hoặc mật khẩu không đúng.'
    case 'auth/too-many-requests':
      return 'Tài khoản bị tạm khóa do thử sai quá nhiều lần. Vui lòng thử lại sau.'
    case 'auth/operation-not-allowed':
      return 'Firebase chưa bật phương thức đăng nhập Email/Password.'
    case 'auth/popup-closed-by-user':
      return 'Bạn đã đóng cửa sổ đăng nhập Google.'
    default:
      return error instanceof Error ? error.message : 'Không đăng nhập được.'
  }
}

function validateTheOneStories(page: CmsPageContent) {
  if (page.id !== 'the-one' || page.status !== 'published') return ''
  const storiesBlock = page.blocks.find((block) => block.id === 'stories')
  const invalidStories = (storiesBlock?.items ?? []).flatMap((item) => {
    const metrics = (item.keyMetrics ?? []).filter((metric) => metric.value.trim() || metric.label.trim())
    const featured = metrics.filter((metric) => metric.featured)
    if (metrics.length === 10 && featured.length === 2) return []
    return `${item.title || item.id || 'Story'} (${metrics.length}/10 metrics, ${featured.length}/2 featured)`
  })

  return invalidStories.length
    ? `Không thể publish The One Stories: ${invalidStories.join('; ')}. Mỗi story cần đúng 10 metrics có nội dung và đúng 2 metrics Featured.`
    : ''
}

function validateBackgroundCarouselImages(page: CmsPageContent) {
  if (page.id !== 'the-one') return ''
  const storiesBlock = page.blocks.find((block) => block.id === 'stories')
  const invalidStories = (storiesBlock?.items ?? []).flatMap((item) => {
    const count = item.backgroundImages?.filter((url) => url.trim()).length ?? 0
    return count > 5 ? `${item.title || item.id || 'Story'} (${count}/5 images)` : []
  })

  return invalidStories.length
    ? `Khong the luu background carousel qua 5 anh: ${invalidStories.join('; ')}.`
    : ''
}

function validateHomepageGalleryImages(page: CmsPageContent) {
  if (page.id !== 'the-one') return ''
  const storiesBlock = page.blocks.find((block) => block.id === 'stories')
  const invalidStories = (storiesBlock?.items ?? []).flatMap((item) => {
    const count = item.homepageGalleryImages?.filter((url) => url.trim()).length ?? 0
    return count > 3 ? `${item.title || item.id || 'Story'} (${count}/3 images)` : []
  })

  return invalidStories.length
    ? `Khong the luu homepage gallery qua 3 anh: ${invalidStories.join('; ')}.`
    : ''
}

function validatePeopleAvatarImages(page: CmsPageContent) {
  if (page.id !== 'homepage') return ''
  const peopleBlock = page.blocks.find((block) => block.id === 'people')
  const invalidPeople = (peopleBlock?.items ?? []).flatMap((item) => {
    const count = item.avatarImages?.filter((url) => url.trim()).length ?? 0
    return count > 4 ? `${item.title || 'Person'} (${count}/4 images)` : []
  })

  return invalidPeople.length
    ? `Khong the luu avatar carousel qua 4 anh: ${invalidPeople.join('; ')}.`
    : ''
}

type AdminDataValue = {
  configured: boolean
  canUseAdmin: boolean
  user: User | null
  isAdmin: boolean
  authLoading: boolean
  contentLoading: boolean
  saving: boolean
  error: string
  message: string
  clearFeedback: () => void
  loginEmail: string
  setLoginEmail: (value: string) => void
  loginPassword: string
  setLoginPassword: (value: string) => void
  signingIn: boolean
  handleEmailSignIn: (event: FormEvent<HTMLFormElement>) => void
  handleGoogleSignIn: () => void
  handleSignOut: () => void

  pages: CmsPageContent[]
  insights: CmsInsightContent[]
  siteSettings: CmsSiteSettings
  getPage: (id: string) => CmsPageContent | undefined
  getInsight: (slug: string) => CmsInsightContent | undefined

  updatePageField: <K extends keyof CmsPageContent>(id: string, key: K, value: CmsPageContent[K]) => void
  updatePageMeta: (id: string, key: PageMetaKey, value: string) => void
  addBlock: (pageId: string) => string
  removeBlock: (pageId: string, blockId: string) => void
  updateBlock: (pageId: string, blockId: string, patch: Partial<CmsBlock>) => void
  updateBlockId: (pageId: string, blockId: string, nextRawId: string) => string
  addBlockItem: (pageId: string, blockId: string) => void
  removeBlockItem: (pageId: string, blockId: string, itemIndex: number) => void
  moveBlockItem: (pageId: string, blockId: string, itemIndex: number, direction: -1 | 1) => void
  updateBlockItem: (pageId: string, blockId: string, itemIndex: number, patch: Partial<CmsBlockItem>) => void
  savePage: (id: string) => Promise<void>

  updateInsightField: <K extends keyof CmsInsightContent>(slug: string, key: K, value: CmsInsightContent[K]) => void
  updateInsightMeta: (slug: string, key: InsightMetaKey, value: string) => void
  updateInsightSlug: (slug: string, nextRawSlug: string) => string
  addInsightSection: (slug: string) => number
  removeInsightSection: (slug: string, index: number) => void
  updateInsightSection: (slug: string, index: number, patch: { heading?: string; paragraphs?: string[] }) => void
  saveInsight: (slug: string) => Promise<void>

  updateSiteSettings: (updater: (settings: CmsSiteSettings) => CmsSiteSettings) => void
  saveSiteSettings: () => Promise<void>

  seed: () => Promise<void>
}

const AdminDataCtx = createContext<AdminDataValue | null>(null)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(configured)
  const [contentLoading, setContentLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pages, setPages] = useState<CmsPageContent[]>(normalizePages(defaultCmsPages))
  const [insights, setInsights] = useState<CmsInsightContent[]>(defaultCmsInsights)
  const [siteSettings, setSiteSettings] = useState<CmsSiteSettings>(defaultCmsSiteSettings)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  const canUseAdmin = configured

  useEffect(() => {
    if (!configured) return
    const { auth } = getFirebaseClient()
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsAdmin(false)
      if (!nextUser) {
        setAuthLoading(false)
        return
      }

      setAuthLoading(true)
      void getIdTokenResult(nextUser, true)
        .then((token) => {
          const role = token.claims.role
          setIsAdmin(role === 'admin' || role === 'superadmin')
        })
        .catch(() => setIsAdmin(false))
        .finally(() => setAuthLoading(false))
    })
  }, [configured])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false

    async function loadContent() {
      setError('')
      setContentLoading(true)
      try {
        const [nextPages, nextInsights, nextSiteSettings] = await Promise.all([listCmsPages(), listCmsInsights(), getCmsSiteSettings()])
        if (cancelled) return
        setPages(normalizePages(nextPages))
        setInsights(nextInsights)
        setSiteSettings(mergeCmsSiteSettings(nextSiteSettings))
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Không tải được nội dung CMS.')
      } finally {
        if (!cancelled) setContentLoading(false)
      }
    }

    void loadContent()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const clearFeedback = useCallback(() => {
    setError('')
    setMessage('')
  }, [])

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearFeedback()
    setSigningIn(true)
    try {
      const { auth } = getFirebaseClient()
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
      setLoginPassword('')
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError))
    } finally {
      setSigningIn(false)
    }
  }

  async function handleGoogleSignIn() {
    clearFeedback()
    setSigningIn(true)
    try {
      const { auth, provider } = getFirebaseClient()
      await signInWithPopup(auth, provider)
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError))
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSignOut() {
    const { auth } = getFirebaseClient()
    await signOut(auth)
  }

  const getPage = useCallback((id: string) => pages.find((page) => page.id === id), [pages])
  const getInsight = useCallback((slug: string) => insights.find((post) => post.slug === slug), [insights])

  function updatePage(id: string, updater: (page: CmsPageContent) => CmsPageContent) {
    setPages((items) => items.map((page) => (page.id === id ? updater(page) : page)))
  }

  function updatePageField<K extends keyof CmsPageContent>(id: string, key: K, value: CmsPageContent[K]) {
    updatePage(id, (page) => ({ ...page, [key]: value }))
  }

  function updatePageMeta(id: string, key: PageMetaKey, value: string) {
    updatePage(id, (page) => ({ ...page, meta: { ...page.meta, [key]: value } }))
  }

  function addBlock(pageId: string) {
    const page = pages.find((item) => item.id === pageId)
    const id = `block-${(page?.blocks.length ?? 0) + 1}`
    const block = { ...emptyBlock, id }
    updatePage(pageId, (current) => ({ ...current, blocks: [...current.blocks, block] }))
    return id
  }

  function removeBlock(pageId: string, blockId: string) {
    updatePage(pageId, (page) => ({ ...page, blocks: page.blocks.filter((block) => block.id !== blockId) }))
  }

  function updateBlock(pageId: string, blockId: string, patch: Partial<CmsBlock>) {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    }))
  }

  function updateBlockId(pageId: string, blockId: string, nextRawId: string) {
    const nextId = createId(nextRawId, blockId)
    updateBlock(pageId, blockId, { id: nextId })
    return nextId
  }

  function addBlockItem(pageId: string, blockId: string) {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        return { ...block, items: [...(block.items ?? []), { ...emptyItem, title: `Item ${(block.items?.length ?? 0) + 1}` }] }
      }),
    }))
  }

  function removeBlockItem(pageId: string, blockId: string, itemIndex: number) {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        return { ...block, items: (block.items ?? []).filter((_, index) => index !== itemIndex) }
      }),
    }))
  }

  function moveBlockItem(pageId: string, blockId: string, itemIndex: number, direction: -1 | 1) {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block

        const items = [...(block.items ?? [])]
        const nextIndex = itemIndex + direction
        if (itemIndex < 0 || itemIndex >= items.length || nextIndex < 0 || nextIndex >= items.length) return block

        const [item] = items.splice(itemIndex, 1)
        items.splice(nextIndex, 0, item)
        return { ...block, items }
      }),
    }))
  }

  function updateBlockItem(pageId: string, blockId: string, itemIndex: number, patch: Partial<CmsBlockItem>) {
    updatePage(pageId, (page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block
        const items = block.items ?? []
        return { ...block, items: setAt(items, itemIndex, { ...items[itemIndex], ...patch }) }
      }),
    }))
  }

  async function triggerRevalidate(paths: string[]) {
    if (!user || !paths.length) return
    try {
      const token = await user.getIdToken()
      await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paths }),
      })
    } catch {
      // Non-fatal: content is already saved, ISR will still refresh within its window.
    }
  }

  async function savePage(id: string) {
    const page = pages.find((item) => item.id === id)
    if (!page) return
    clearFeedback()
    setSaving(true)
    try {
      const validationError = validateTheOneStories(page)
      if (validationError) throw new Error(validationError)
      const carouselValidationError = validateBackgroundCarouselImages(page)
      if (carouselValidationError) throw new Error(carouselValidationError)
      const homepageGalleryValidationError = validateHomepageGalleryImages(page)
      if (homepageGalleryValidationError) throw new Error(homepageGalleryValidationError)
      const peopleAvatarValidationError = validatePeopleAvatarImages(page)
      if (peopleAvatarValidationError) throw new Error(peopleAvatarValidationError)
      await saveCmsPage(page)
      await triggerRevalidate(getPageRevalidatePaths(id))
      setMessage(`Đã lưu trang "${page.title}" và cập nhật trên web.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không lưu được trang.')
    } finally {
      setSaving(false)
    }
  }

  function updateInsight(slug: string, updater: (post: CmsInsightContent) => CmsInsightContent) {
    setInsights((items) => items.map((post) => (post.slug === slug ? updater(post) : post)))
  }

  function updateInsightField<K extends keyof CmsInsightContent>(slug: string, key: K, value: CmsInsightContent[K]) {
    updateInsight(slug, (post) => ({ ...post, [key]: value }))
  }

  function updateInsightMeta(slug: string, key: InsightMetaKey, value: string) {
    updateInsight(slug, (post) => ({ ...post, meta: { ...post.meta, [key]: value } }))
  }

  function updateInsightSlug(slug: string, nextRawSlug: string) {
    const nextSlug = createId(nextRawSlug, slug)
    updateInsight(slug, (post) => ({ ...post, slug: nextSlug, meta: { ...post.meta, path: `/insights/${nextSlug}` } }))
    return nextSlug
  }

  function addInsightSection(slug: string) {
    const post = insights.find((item) => item.slug === slug)
    const index = post?.sections.length ?? 0
    updateInsight(slug, (current) => ({ ...current, sections: [...current.sections, { ...emptyInsightSection }] }))
    return index
  }

  function removeInsightSection(slug: string, index: number) {
    updateInsight(slug, (post) => ({ ...post, sections: post.sections.filter((_, sectionIndex) => sectionIndex !== index) }))
  }

  function updateInsightSection(slug: string, index: number, patch: { heading?: string; paragraphs?: string[] }) {
    updateInsight(slug, (post) => ({
      ...post,
      sections: setAt(post.sections, index, { ...post.sections[index], ...patch }),
    }))
  }

  async function saveInsight(slug: string) {
    const post = insights.find((item) => item.slug === slug)
    if (!post) return
    clearFeedback()
    setSaving(true)
    try {
      await saveCmsInsight(post)
      await triggerRevalidate(getInsightRevalidatePaths(slug))
      setMessage(`Đã lưu insight "${post.title}" và cập nhật trên web.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không lưu được insight.')
    } finally {
      setSaving(false)
    }
  }

  function updateSiteSettings(updater: (settings: CmsSiteSettings) => CmsSiteSettings) {
    setSiteSettings((current) => mergeCmsSiteSettings(updater(current)))
  }

  async function saveSiteSettings() {
    clearFeedback()
    setSaving(true)
    try {
      const normalized = mergeCmsSiteSettings(siteSettings)
      await saveCmsSiteSettings(normalized)
      setSiteSettings(normalized)
      await triggerRevalidate(siteSettingsRevalidatePaths)
      setMessage('Da luu Header/Footer va cap nhat tren web.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Khong luu duoc Header/Footer.')
    } finally {
      setSaving(false)
    }
  }

  async function seed() {
    const confirmation = window.prompt('Type SEED GG99 to replace all CMS content with the code defaults.')
    if (confirmation !== 'SEED GG99') {
      setError('Seed cancelled. The confirmation phrase did not match.')
      return
    }
    clearFeedback()
    setSaving(true)
    try {
      await seedDefaultContent(confirmation)
      const [nextPages, nextInsights, nextSiteSettings] = await Promise.all([listCmsPages(), listCmsInsights(), getCmsSiteSettings()])
      setPages(normalizePages(nextPages))
      setInsights(nextInsights)
      setSiteSettings(mergeCmsSiteSettings(nextSiteSettings))
      setMessage('Đã seed lại nội dung mặc định lên Firestore.')
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : 'Không seed được nội dung.')
    } finally {
      setSaving(false)
    }
  }

  const value: AdminDataValue = {
    configured,
    canUseAdmin,
    user,
    isAdmin,
    authLoading,
    contentLoading,
    saving,
    error,
    message,
    clearFeedback,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    signingIn,
    handleEmailSignIn,
    handleGoogleSignIn,
    handleSignOut,
    pages,
    insights,
    siteSettings,
    getPage,
    getInsight,
    updatePageField,
    updatePageMeta,
    addBlock,
    removeBlock,
    updateBlock,
    updateBlockId,
    addBlockItem,
    removeBlockItem,
    moveBlockItem,
    updateBlockItem,
    savePage,
    updateInsightField,
    updateInsightMeta,
    updateInsightSlug,
    addInsightSection,
    removeInsightSection,
    updateInsightSection,
    saveInsight,
    updateSiteSettings,
    saveSiteSettings,
    seed,
  }

  return <AdminDataCtx.Provider value={value}>{children}</AdminDataCtx.Provider>
}

export function useAdminData() {
  const ctx = useContext(AdminDataCtx)
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider')
  return ctx
}

export type { CmsStatus }
