import { getFirebaseClient } from './firebaseClient'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 25 * 1024 * 1024

export type CmsUploadKind = 'image' | 'video'

type PrepareUploadResponse = {
  ok?: boolean
  error?: string
  uploadUrl?: string
  apiKey?: string
  params?: Record<string, string>
  signature?: string
  intent?: string
}

type CloudinaryUploadResponse = {
  asset_id?: string
  error?: { message?: string }
}

type CompleteUploadResponse = {
  ok?: boolean
  error?: string
  url?: string
}

type ImageRequirements = {
  label: string
  minWidth: number
  minHeight: number
  minRatio: number
  maxRatio: number
}

function getImageRequirements(folder: string): ImageRequirements | null {
  const value = folder.toLowerCase()
  if (value.includes('background-carousel')) return { label: 'Story image', minWidth: 1080, minHeight: 1350, minRatio: 0.72, maxRatio: 0.9 }
  if (value.includes('homepage-banner-desktop')) return { label: 'Homepage desktop banner', minWidth: 1600, minHeight: 650, minRatio: 2, maxRatio: 2.8 }
  if (value.includes('homepage-banner-mobile') || value.includes('banner-mobile')) return { label: 'Mobile banner', minWidth: 900, minHeight: 675, minRatio: 1.1, maxRatio: 1.6 }
  if (value.includes('homepage-thumbnails')) return { label: 'Homepage thumbnail', minWidth: 960, minHeight: 540, minRatio: 1.55, maxRatio: 1.95 }
  if (value.includes('/avatars')) return { label: 'Avatar', minWidth: 176, minHeight: 176, minRatio: 0.8, maxRatio: 1.25 }
  if (value.includes('background-mobile') || value.includes('video-mobile')) return { label: 'Mobile hero/poster', minWidth: 720, minHeight: 960, minRatio: 0.5, maxRatio: 1.05 }
  if (/\/hero\/background$/.test(value)) return { label: 'Desktop hero background', minWidth: 1600, minHeight: 900, minRatio: 1.5, maxRatio: 2.1 }
  if (/\/people\/[^/]+\/banner$/.test(value)) return { label: 'People desktop banner', minWidth: 1600, minHeight: 600, minRatio: 1.8, maxRatio: 3.2 }
  if (/\/people\/[^/]+\/thumbnail$/.test(value)) return { label: 'People thumbnail', minWidth: 640, minHeight: 400, minRatio: 1.4, maxRatio: 1.9 }
  return null
}

async function getImageDimensions(file: File) {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    const dimensions = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return dimensions
  }

  return await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions.'))
    }
    image.src = url
  })
}

async function validateUploadFile(file: File, kind: CmsUploadKind, folder: string) {
  if (kind === 'video') {
    if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
      throw new Error('Please upload an MP4, WebM, or OGG video.')
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error('Video files must be 25MB or smaller.')
    }
    return
  }

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, WebP, or AVIF image.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Images must be 10MB or smaller.')
  }

  const requirements = getImageRequirements(folder)
  if (requirements) {
    const { width, height } = await getImageDimensions(file)
    const ratio = width / Math.max(1, height)
    if (width < requirements.minWidth || height < requirements.minHeight) {
      throw new Error(`${requirements.label} must be at least ${requirements.minWidth}x${requirements.minHeight}px. Selected image is ${width}x${height}px.`)
    }
    if (ratio < requirements.minRatio || ratio > requirements.maxRatio) {
      throw new Error(`${requirements.label} has the wrong aspect ratio. Please use the crop guidance shown in the editor.`)
    }
  }
}

export async function uploadCmsAsset(file: File, folder = 'cms', kind: CmsUploadKind = 'image') {
  await validateUploadFile(file, kind, folder)

  const { auth } = getFirebaseClient()
  const token = await auth.currentUser?.getIdToken()
  if (!token) {
    throw new Error('Please sign in to the admin before uploading files.')
  }

  const prepareResponse = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'prepare',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
      kind,
    }),
  })

  const prepared = (await prepareResponse.json().catch(() => null)) as PrepareUploadResponse | null
  if (
    !prepareResponse.ok ||
    !prepared?.ok ||
    !prepared.uploadUrl ||
    !prepared.apiKey ||
    !prepared.params ||
    !prepared.signature ||
    !prepared.intent
  ) {
    throw new Error(prepared?.error || 'Could not prepare a secure Cloudinary upload.')
  }

  const uploadBody = new FormData()
  uploadBody.append('file', file, file.name)
  uploadBody.append('api_key', prepared.apiKey)
  for (const [key, value] of Object.entries(prepared.params)) uploadBody.append(key, value)
  uploadBody.append('signature', prepared.signature)

  const cloudinaryResponse = await fetch(prepared.uploadUrl, { method: 'POST', body: uploadBody })
  const cloudinaryResult = (await cloudinaryResponse.json().catch(() => null)) as CloudinaryUploadResponse | null
  if (!cloudinaryResponse.ok || !cloudinaryResult?.asset_id) {
    throw new Error(cloudinaryResult?.error?.message || 'Cloudinary could not store the uploaded file.')
  }

  const freshToken = await auth.currentUser?.getIdToken()
  if (!freshToken) throw new Error('The admin session expired before the upload could be verified.')
  const completeResponse = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${freshToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'complete', intent: prepared.intent, assetId: cloudinaryResult.asset_id }),
  })
  const completed = (await completeResponse.json().catch(() => null)) as CompleteUploadResponse | null
  if (!completeResponse.ok || !completed?.ok || !completed.url) {
    throw new Error(completed?.error || 'The uploaded file could not be verified.')
  }

  return completed.url
}
