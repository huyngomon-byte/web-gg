import 'server-only'

import type { CmsInsightContent, CmsPageContent, CmsSiteSettings } from './types'

const MAX_JSON_BYTES = 1_500_000
const MAX_DEPTH = 20
const MAX_ARRAY_ITEMS = 300
const MAX_OBJECT_KEYS = 300
const MAX_STRING_LENGTH = 50_000
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])
const FORBIDDEN_PROTOCOL = /^(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validateTree(value: unknown, path = 'payload', depth = 0): string {
  if (depth > MAX_DEPTH) return `${path} is nested too deeply.`
  if (value == null || typeof value === 'boolean' || typeof value === 'number') return ''

  if (typeof value === 'string') {
    if (value.length > MAX_STRING_LENGTH) return `${path} is too long.`
    if (FORBIDDEN_PROTOCOL.test(value.trim())) return `${path} uses a forbidden URL protocol.`
    return ''
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) return `${path} contains too many items.`
    for (let index = 0; index < value.length; index += 1) {
      const error = validateTree(value[index], `${path}[${index}]`, depth + 1)
      if (error) return error
    }
    return ''
  }

  if (!isPlainObject(value)) return `${path} contains an unsupported value.`
  const keys = Object.keys(value)
  if (keys.length > MAX_OBJECT_KEYS) return `${path} contains too many fields.`
  for (const key of keys) {
    if (FORBIDDEN_KEYS.has(key)) return `${path} contains a forbidden field.`
    const error = validateTree(value[key], `${path}.${key}`, depth + 1)
    if (error) return error
  }
  return ''
}

function validateCommon(value: unknown): string {
  let serialized = ''
  try {
    serialized = JSON.stringify(value)
  } catch {
    return 'Payload is not serializable.'
  }
  if (Buffer.byteLength(serialized, 'utf8') > MAX_JSON_BYTES) return 'Payload is too large.'
  return validateTree(value)
}

export function validateCmsPagePayload(value: unknown): ValidationResult<CmsPageContent> {
  const commonError = validateCommon(value)
  if (commonError) return { ok: false, error: commonError }
  if (!isPlainObject(value)) return { ok: false, error: 'Page payload must be an object.' }
  if (typeof value.id !== 'string' || !SAFE_ID.test(value.id)) return { ok: false, error: 'Page ID is invalid.' }
  if (typeof value.title !== 'string' || value.title.length > 200) return { ok: false, error: 'Page title is invalid.' }
  if (value.status !== 'published' && value.status !== 'draft') return { ok: false, error: 'Page status is invalid.' }
  if (!Array.isArray(value.blocks) || value.blocks.length > 80) return { ok: false, error: 'Page blocks are invalid.' }
  return { ok: true, value: value as unknown as CmsPageContent }
}

export function validateCmsInsightPayload(value: unknown): ValidationResult<CmsInsightContent> {
  const commonError = validateCommon(value)
  if (commonError) return { ok: false, error: commonError }
  if (!isPlainObject(value)) return { ok: false, error: 'Insight payload must be an object.' }
  if (typeof value.slug !== 'string' || !SAFE_ID.test(value.slug)) return { ok: false, error: 'Insight slug is invalid.' }
  if (typeof value.title !== 'string' || value.title.length > 240) return { ok: false, error: 'Insight title is invalid.' }
  if (value.status !== 'published' && value.status !== 'draft') return { ok: false, error: 'Insight status is invalid.' }
  if (!Array.isArray(value.sections) || value.sections.length > 100) return { ok: false, error: 'Insight sections are invalid.' }
  return { ok: true, value: value as unknown as CmsInsightContent }
}

export function validateCmsSiteSettingsPayload(value: unknown): ValidationResult<CmsSiteSettings> {
  const commonError = validateCommon(value)
  if (commonError) return { ok: false, error: commonError }
  if (!isPlainObject(value)) return { ok: false, error: 'Site settings payload must be an object.' }
  return { ok: true, value: value as unknown as CmsSiteSettings }
}
