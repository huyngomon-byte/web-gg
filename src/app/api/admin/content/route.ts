import { createHash, randomUUID } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { authenticateAdminRequest, type AdminActor } from '../../../../cms/adminAuth'
import { defaultCmsInsights, defaultCmsPages, defaultCmsSiteSettings } from '../../../../cms/defaultContent'
import { getFirebaseAdminDb } from '../../../../cms/firebaseAdmin'
import {
  validateCmsInsightPayload,
  validateCmsPagePayload,
  validateCmsSiteSettingsPayload,
} from '../../../../cms/serverContentValidation'
import { checkRateLimit, rateLimitResponse } from '../../../../security/serverRateLimit'

export const runtime = 'nodejs'

const MAX_REQUEST_BYTES = 1_600_000

type ContentAction = 'save-page' | 'save-insight' | 'save-settings' | 'seed'

type ContentRequest = {
  action?: ContentAction
  data?: unknown
  confirmation?: unknown
}

function hash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex')
}

function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function requestError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function writeWithAudit(
  actor: AdminActor,
  collection: string,
  documentId: string,
  action: ContentAction,
  value: Record<string, unknown>,
) {
  const db = getFirebaseAdminDb()
  if (!db) throw new Error('Firestore Admin is not configured.')

  const documentRef = db.collection(collection).doc(documentId)
  const auditRef = db.collection('cmsAuditLogs').doc()
  const requestId = randomUUID()
  const now = new Date().toISOString()

  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(documentRef)
    const next = {
      ...value,
      updatedAt: now,
      updatedAtServer: FieldValue.serverTimestamp(),
    }
    transaction.set(documentRef, next)
    transaction.set(auditRef, {
      requestId,
      actorUid: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      target: `${collection}/${documentId}`,
      beforeHash: hash(current.exists ? current.data() : null),
      afterHash: hash(value),
      createdAt: FieldValue.serverTimestamp(),
    })
  })

  return requestId
}

async function seedContent(actor: AdminActor) {
  const db = getFirebaseAdminDb()
  if (!db) throw new Error('Firestore Admin is not configured.')

  const batch = db.batch()
  const requestId = randomUUID()
  const now = new Date().toISOString()
  for (const page of defaultCmsPages) {
    batch.set(db.collection('sitePages').doc(page.id), {
      ...clean(page),
      updatedAt: now,
      updatedAtServer: FieldValue.serverTimestamp(),
    })
  }
  for (const insight of defaultCmsInsights) {
    batch.set(db.collection('insights').doc(insight.slug), {
      ...clean(insight),
      updatedAt: now,
      updatedAtServer: FieldValue.serverTimestamp(),
    })
  }
  batch.set(db.collection('siteSettings').doc('global'), {
    ...clean(defaultCmsSiteSettings),
    updatedAt: now,
    updatedAtServer: FieldValue.serverTimestamp(),
  })
  batch.set(db.collection('cmsAuditLogs').doc(), {
    requestId,
    actorUid: actor.uid,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: 'seed',
    target: 'cms/*',
    beforeHash: null,
    afterHash: hash({ defaultCmsPages, defaultCmsInsights, defaultCmsSiteSettings }),
    createdAt: FieldValue.serverTimestamp(),
  })
  await batch.commit()
  return requestId
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { scope: 'admin-content', limit: 30, windowSeconds: 60 })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit)
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) return requestError(413, 'Request body is too large.')
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return requestError(415, 'Content-Type must be application/json.')
  }

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) return requestError(413, 'Request body is too large.')
  let body: ContentRequest | null = null
  try {
    body = JSON.parse(rawBody) as ContentRequest
  } catch {
    return requestError(400, 'The content request is invalid.')
  }
  if (!body?.action) return requestError(400, 'A content action is required.')

  const isSeed = body.action === 'seed'
  const authentication = await authenticateAdminRequest(request, {
    requireSuperadmin: isSeed,
    requireRecentLoginSeconds: isSeed ? 10 * 60 : undefined,
  })
  if (!authentication.ok) return authentication.response

  try {
    let requestId = ''
    if (body.action === 'save-page') {
      const validated = validateCmsPagePayload(body.data)
      if (!validated.ok) return requestError(400, validated.error)
      requestId = await writeWithAudit(
        authentication.actor,
        'sitePages',
        validated.value.id,
        body.action,
        validated.value as unknown as Record<string, unknown>,
      )
    } else if (body.action === 'save-insight') {
      const validated = validateCmsInsightPayload(body.data)
      if (!validated.ok) return requestError(400, validated.error)
      requestId = await writeWithAudit(
        authentication.actor,
        'insights',
        validated.value.slug,
        body.action,
        validated.value as unknown as Record<string, unknown>,
      )
    } else if (body.action === 'save-settings') {
      const validated = validateCmsSiteSettingsPayload(body.data)
      if (!validated.ok) return requestError(400, validated.error)
      requestId = await writeWithAudit(
        authentication.actor,
        'siteSettings',
        'global',
        body.action,
        validated.value as unknown as Record<string, unknown>,
      )
    } else if (body.action === 'seed') {
      if (body.confirmation !== 'SEED GG99') return requestError(400, 'The seed confirmation phrase is invalid.')
      requestId = await seedContent(authentication.actor)
    } else {
      return requestError(400, 'Unsupported content action.')
    }

    return NextResponse.json({ ok: true, requestId }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error(JSON.stringify({ event: 'cms_write_failed', action: body.action, error: error instanceof Error ? error.message : 'unknown' }))
    return requestError(500, 'The CMS change could not be saved.')
  }
}
