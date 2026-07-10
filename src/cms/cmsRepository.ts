import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { getFirebaseClient } from './firebaseClient'
import { defaultCmsInsights, defaultCmsPages, defaultCmsSiteSettings } from './defaultContent'
import { mergeCmsSiteSettings } from './siteSettings'
import type { CmsInsightContent, CmsPageContent, CmsSiteSettings } from './types'

const PAGE_COLLECTION = 'sitePages'
const INSIGHT_COLLECTION = 'insights'
const SITE_SETTINGS_COLLECTION = 'siteSettings'
const SITE_SETTINGS_DOC = 'global'

function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

async function saveThroughAdminApi(action: string, data?: unknown, confirmation?: string) {
  const { auth } = getFirebaseClient()
  const token = await auth.currentUser?.getIdToken(true)
  if (!token) throw new Error('Please sign in to the CMS before saving content.')

  const response = await fetch('/api/admin/content', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data: data === undefined ? undefined : stripUndefined(data), confirmation }),
  })
  const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'The CMS change could not be saved.')
  }
}

export async function listCmsPages() {
  const { db } = getFirebaseClient()
  const snapshot = await getDocs(query(collection(db, PAGE_COLLECTION), orderBy('title')))
  const pages = snapshot.docs.map((item) => item.data() as CmsPageContent)
  return pages.length ? pages : defaultCmsPages
}

export async function getCmsPage(id: string) {
  const { db } = getFirebaseClient()
  const snapshot = await getDoc(doc(db, PAGE_COLLECTION, id))
  return snapshot.exists() ? (snapshot.data() as CmsPageContent) : defaultCmsPages.find((page) => page.id === id)
}

export async function saveCmsPage(page: CmsPageContent) {
  await saveThroughAdminApi('save-page', page)
}

export async function listCmsInsights() {
  const { db } = getFirebaseClient()
  const snapshot = await getDocs(query(collection(db, INSIGHT_COLLECTION), orderBy('dateModified', 'desc')))
  const posts = snapshot.docs.map((item) => item.data() as CmsInsightContent)
  return posts.length ? posts : defaultCmsInsights
}

export async function getCmsInsight(slug: string) {
  const { db } = getFirebaseClient()
  const snapshot = await getDoc(doc(db, INSIGHT_COLLECTION, slug))
  return snapshot.exists()
    ? (snapshot.data() as CmsInsightContent)
    : defaultCmsInsights.find((post) => post.slug === slug)
}

export async function saveCmsInsight(post: CmsInsightContent) {
  await saveThroughAdminApi('save-insight', post)
}

export async function getCmsSiteSettings() {
  const { db } = getFirebaseClient()
  const snapshot = await getDoc(doc(db, SITE_SETTINGS_COLLECTION, SITE_SETTINGS_DOC))
  return snapshot.exists()
    ? mergeCmsSiteSettings(snapshot.data() as CmsSiteSettings)
    : defaultCmsSiteSettings
}

export async function saveCmsSiteSettings(settings: CmsSiteSettings) {
  await saveThroughAdminApi('save-settings', mergeCmsSiteSettings(settings))
}

export async function seedDefaultContent(confirmation: string) {
  await saveThroughAdminApi('seed', undefined, confirmation)
}
