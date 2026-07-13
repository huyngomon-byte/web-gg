import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse, type NextRequest } from 'next/server'
import { authenticateAdminRequest } from '../../../../cms/adminAuth'
import { getFirebaseAdminDb } from '../../../../cms/firebaseAdmin'
import { getImageRequirements, getVideoRequirements } from '../../../../cms/mediaRequirements'
import { checkRateLimit, rateLimitResponse } from '../../../../security/serverRateLimit'

export const runtime = 'nodejs'

const MAX_REQUEST_BYTES = 16_384
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 25 * 1024 * 1024
const MAX_IMAGE_PIXELS = 40_000_000
const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
])
const VIDEO_TYPES = new Map([
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['video/ogg', 'ogg'],
])

type UploadKind = 'image' | 'video'

type UploadIntent = {
  uid: string
  publicId: string
  folder: string
  kind: UploadKind
  expiresAt: number
}

type CloudinaryResource = {
  asset_id?: string
  public_id?: string
  format?: string
  resource_type?: string
  type?: string
  status?: string
  bytes?: number
  width?: number
  height?: number
  pages?: number
  secure_url?: string
}

function responseError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function sanitizeFolder(value: unknown) {
  const folder = typeof value === 'string' ? value : 'cms'
  const path = folder
    .split('/')
    .map((segment) => slugify(segment))
    .filter(Boolean)
    .join('/')
  if (!path || path.length > 180 || path.split('/').length > 10) return 'cms'
  return path === 'cms' || path.startsWith('cms/') ? path : `cms/${path}`
}

function buildPublicId(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.')
  const base = dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName
  return `${Date.now()}-${slugify(base).slice(0, 48) || 'asset'}-${randomUUID().slice(0, 12)}`
}

function createSignature(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
}

function createIntent(value: UploadIntent, secret: string) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function readIntent(value: unknown, secret: string): UploadIntent | null {
  if (typeof value !== 'string' || value.length > 2_048) return null
  const [payload, signature, extra] = value.split('.')
  if (!payload || !signature || extra) return null
  const expected = createHmac('sha256', secret).update(payload).digest()
  let received: Buffer
  try {
    received = Buffer.from(signature, 'base64url')
  } catch {
    return null
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as UploadIntent
    if (!parsed || typeof parsed !== 'object' || parsed.expiresAt < Date.now()) return null
    if (parsed.kind !== 'image' && parsed.kind !== 'video') return null
    if (!parsed.uid || !parsed.publicId || !parsed.folder) return null
    return parsed
  } catch {
    return null
  }
}

async function readJson(request: NextRequest) {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return { ok: false as const, response: responseError(415, 'Content-Type must be application/json.') }
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_REQUEST_BYTES) {
    return { ok: false as const, response: responseError(413, 'Request body is too large.') }
  }
  const raw = await request.text()
  if (Buffer.byteLength(raw, 'utf8') > MAX_REQUEST_BYTES) {
    return { ok: false as const, response: responseError(413, 'Request body is too large.') }
  }
  try {
    return { ok: true as const, value: JSON.parse(raw) as Record<string, unknown> }
  } catch {
    return { ok: false as const, response: responseError(400, 'The upload request is invalid.') }
  }
}

function validatePrepareRequest(body: Record<string, unknown>) {
  const kind: UploadKind = body.kind === 'video' ? 'video' : 'image'
  const fileName = typeof body.fileName === 'string' ? body.fileName.slice(0, 240) : ''
  const fileType = typeof body.fileType === 'string' ? body.fileType.toLowerCase() : ''
  const fileSize = Number(body.fileSize)
  const allowedTypes = kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES
  const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES

  if (!fileName || !Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > maxBytes || !allowedTypes.has(fileType)) {
    return { ok: false as const, error: kind === 'image'
      ? 'Please upload a JPEG, PNG, WebP, or AVIF image up to 10MB.'
      : 'Please upload an MP4, WebM, or OGG video up to 25MB.' }
  }
  return { ok: true as const, kind, fileName, fileType, fileSize, formats: [...allowedTypes.values()].join(',') }
}

async function getCloudinaryResource(assetId: string, cloudName: string, apiKey: string, apiSecret: string) {
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/${encodeURIComponent(assetId)}`,
    {
      headers: { Authorization: `Basic ${authorization}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    },
  )
  const result = (await response.json().catch(() => null)) as CloudinaryResource | null
  return response.ok ? result : null
}

async function destroyCloudinaryResource(publicId: string, kind: UploadKind, cloudName: string, apiKey: string, apiSecret: string) {
  const params = {
    invalidate: 'true',
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  }
  const body = new URLSearchParams({ ...params, api_key: apiKey, signature: createSignature(params, apiSecret) })
  await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${kind}/destroy`, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(10_000),
  }).catch(() => undefined)
}

function validateCloudinaryResource(resource: CloudinaryResource, intent: UploadIntent) {
  const allowedFormats = intent.kind === 'image' ? new Set(IMAGE_TYPES.values()) : new Set(VIDEO_TYPES.values())
  const maxBytes = intent.kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
  // Fixed folder mode returns "<folder>/<id>"; dynamic folder mode keeps public_id as "<id>".
  const expectedPublicIds = new Set([intent.publicId, intent.publicId.split('/').pop() ?? intent.publicId])
  if (
    // The resource-by-asset_id API omits `status` for normal active assets; only reject explicit non-active states.
    (resource.status !== undefined && resource.status !== 'active') ||
    resource.type !== 'upload' ||
    resource.resource_type !== intent.kind ||
    !resource.public_id ||
    !expectedPublicIds.has(resource.public_id) ||
    !resource.secure_url?.startsWith('https://res.cloudinary.com/') ||
    !resource.format ||
    !allowedFormats.has(resource.format) ||
    !Number.isFinite(resource.bytes) ||
    Number(resource.bytes) <= 0 ||
    Number(resource.bytes) > maxBytes
  ) {
    return 'Cloudinary returned an asset that did not match the signed upload request.'
  }

  if (intent.kind === 'image') {
    const width = Number(resource.width)
    const height = Number(resource.height)
    if (!width || !height || width * height > MAX_IMAGE_PIXELS || Number(resource.pages ?? 1) > 1) {
      return 'The uploaded image dimensions are not accepted.'
    }
    const requirements = getImageRequirements(intent.folder)
    if (requirements) {
      const ratio = width / height
      if (width < requirements.minWidth || height < requirements.minHeight) {
        return `${requirements.label} must be at least ${requirements.minWidth}x${requirements.minHeight}px.`
      }
      if (ratio < requirements.minRatio || ratio > requirements.maxRatio) {
        return `${requirements.label} has the wrong aspect ratio.`
      }
    }
  } else {
    const requirements = getVideoRequirements(intent.folder)
    if (requirements) {
      const width = Number(resource.width)
      const height = Number(resource.height)
      const ratio = width / height
      if (!width || !height || width < requirements.minWidth || height < requirements.minHeight) {
        return `${requirements.label} must be at least ${requirements.minWidth}x${requirements.minHeight}px.`
      }
      if (ratio < requirements.minRatio || ratio > requirements.maxRatio) {
        return `${requirements.label} has the wrong aspect ratio.`
      }
    }
  }
  return ''
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkRateLimit(request, { scope: 'admin-upload', limit: 24, windowSeconds: 60 })
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit)
  const authentication = await authenticateAdminRequest(request)
  if (!authentication.ok) return authentication.response
  if (!isCloudinaryConfigured()) return responseError(503, 'Cloudinary is not configured on the server.')

  const parsed = await readJson(request)
  if (!parsed.ok) return parsed.response
  const body = parsed.value
  const action = body.action
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string
  const apiKey = process.env.CLOUDINARY_API_KEY as string
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string

  if (action === 'prepare') {
    const upload = validatePrepareRequest(body)
    if (!upload.ok) return responseError(400, upload.error)
    const folder = sanitizeFolder(body.folder)
    const basePublicId = buildPublicId(upload.fileName)
    const publicId = `${folder}/${basePublicId}`
    const params = {
      allowed_formats: upload.formats,
      folder,
      public_id: basePublicId,
      tags: 'gg99-cms',
      timestamp: String(Math.floor(Date.now() / 1000)),
    }
    const intent = createIntent(
      { uid: authentication.actor.uid, publicId, folder, kind: upload.kind, expiresAt: Date.now() + 5 * 60 * 1000 },
      apiSecret,
    )
    return NextResponse.json(
      {
        ok: true,
        uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${upload.kind}/upload`,
        apiKey,
        params,
        signature: createSignature(params, apiSecret),
        intent,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  if (action === 'complete') {
    const intent = readIntent(body.intent, apiSecret)
    const assetId = typeof body.assetId === 'string' ? body.assetId : ''
    if (!intent || intent.uid !== authentication.actor.uid || !/^[a-zA-Z0-9_-]{16,128}$/.test(assetId)) {
      console.error(JSON.stringify({ event: 'upload_complete_invalid_intent', hasIntent: Boolean(intent), assetIdValid: /^[a-zA-Z0-9_-]{16,128}$/.test(assetId) }))
      return responseError(400, 'The upload confirmation is invalid or expired.')
    }
    const resource = await getCloudinaryResource(assetId, cloudName, apiKey, apiSecret)
    if (!resource) {
      console.error(JSON.stringify({ event: 'upload_verify_fetch_failed', assetId, folder: intent.folder }))
      return responseError(502, 'Cloudinary could not verify the uploaded asset.')
    }
    const validationError = validateCloudinaryResource(resource, intent)
    if (validationError) {
      console.error(JSON.stringify({
        event: 'upload_verification_rejected',
        error: validationError,
        expectedPublicId: intent.publicId,
        actualPublicId: resource.public_id,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
      }))
      await destroyCloudinaryResource(resource.public_id || intent.publicId, intent.kind, cloudName, apiKey, apiSecret)
      return responseError(400, validationError)
    }

    const db = getFirebaseAdminDb()
    await db?.collection('cmsAuditLogs').add({
      actorUid: authentication.actor.uid,
      actorEmail: authentication.actor.email,
      actorRole: authentication.actor.role,
      action: 'upload',
      target: resource.public_id,
      assetId: resource.asset_id,
      fileSize: resource.bytes,
      fileType: `${resource.resource_type}/${resource.format}`,
      createdAt: FieldValue.serverTimestamp(),
    }).catch((error) => {
      console.error(JSON.stringify({ event: 'upload_audit_failed', error: error instanceof Error ? error.message : 'unknown' }))
    })

    return NextResponse.json(
      { ok: true, url: resource.secure_url, publicId: resource.public_id },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return responseError(400, 'Unsupported upload action.')
}
