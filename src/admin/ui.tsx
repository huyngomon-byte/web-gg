'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { CmsIcon, cmsIconOptions } from '../components/CmsIcon'
import { uploadCmsAsset, type CmsUploadKind } from '../cms/mediaRepository'
import type { CmsStatus } from '../cms/types'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-on-surface-variant/75">{hint}</span>}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  readOnly = false,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  readOnly?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      className="h-11 w-full rounded-xl border border-outline-variant/55 bg-surface px-3 text-sm font-semibold text-on-surface outline-none transition-colors focus:border-primary read-only:bg-surface-container-low read-only:text-on-surface-variant"
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      style={{ minHeight }}
      className="w-full resize-y rounded-xl border border-outline-variant/55 bg-surface px-3 py-3 text-sm font-medium leading-relaxed text-on-surface outline-none transition-colors focus:border-primary"
    />
  )
}

export function StatusSelect({ value, onChange }: { value: CmsStatus; onChange: (value: CmsStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as CmsStatus)}
      className="h-11 w-full rounded-xl border border-outline-variant/55 bg-surface px-3 text-sm font-bold text-on-surface outline-none focus:border-primary"
    >
      <option value="published">Published</option>
      <option value="draft">Draft</option>
    </select>
  )
}

export function StatusBadge({ value }: { value: CmsStatus }) {
  const isPublished = value === 'published'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
        isPublished ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-on-surface-variant'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-primary' : 'bg-on-surface-variant'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

export function Card({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-outline-variant/45 bg-surface/90 p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-extrabold text-on-surface">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Panel({
  title,
  icon,
  children,
  defaultOpen = true,
  summary,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  summary?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-outline-variant/45 bg-surface/90 shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold text-on-surface">{title}</span>
            {summary && <span className="mt-0.5 block truncate text-xs font-semibold text-on-surface-variant">{summary}</span>}
          </span>
        </span>
        <ChevronDown size={17} className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-outline-variant/30 p-4">{children}</div>
    </details>
  )
}

export function MediaPreview({ url, alt }: { url?: string; alt?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/45 bg-surface-container-low">
      {url ? (
        <img src={url} alt={alt || ''} className="h-36 w-full object-contain p-3" />
      ) : (
        <div className="flex h-36 items-center justify-center text-sm font-bold text-on-surface-variant">Chưa có ảnh</div>
      )}
    </div>
  )
}

export function MediaUploadButton({
  folder,
  onUploaded,
  onError,
  kind = 'image',
  accept,
  label = 'Upload ảnh',
}: {
  folder: string
  onUploaded: (url: string) => void
  onError: (message: string) => void
  label?: string
  kind?: CmsUploadKind
  accept?: string
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadCmsAsset(file, folder, kind)
      onUploaded(url)
    } catch (uploadError) {
      onError(uploadError instanceof Error ? uploadError.message : 'Không upload được ảnh.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-outline-variant px-3 text-xs font-extrabold text-primary transition-colors hover:bg-primary/10">
      <UploadCloud size={15} />
      {uploading ? 'Đang upload...' : label}
      <input
        type="file"
        accept={accept || (kind === 'video' ? 'video/mp4,video/webm,video/ogg' : 'image/*')}
        disabled={uploading}
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.currentTarget.value = ''
        }}
      />
    </label>
  )
}

export function ImageUploadButton(props: Omit<Parameters<typeof MediaUploadButton>[0], 'kind' | 'accept'>) {
  return <MediaUploadButton {...props} kind="image" accept="image/*" />
}

export function VideoUploadButton(props: Omit<Parameters<typeof MediaUploadButton>[0], 'kind' | 'accept'>) {
  return <MediaUploadButton {...props} kind="video" accept="video/mp4,video/webm,video/ogg" label={props.label || 'Upload video preview'} />
}

export function IconPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-3">
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
        <TextInput value={value} onChange={onChange} placeholder="Chọn icon hoặc nhập emoji" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="h-11 rounded-xl border border-outline-variant px-3 text-xs font-extrabold text-on-surface-variant"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
        {cmsIconOptions.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center transition-colors ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant/35 bg-surface text-on-surface-variant hover:border-primary/45'
              }`}
            >
              <CmsIcon name={option.value} size={21} className={active ? 'text-primary' : 'text-on-surface'} />
              <span className="text-[10px] font-extrabold leading-tight">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-xs font-bold text-on-surface-variant">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-on-surface-variant/50">/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-on-surface">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-extrabold text-on-surface-variant transition-colors hover:text-primary"
    >
      <ChevronLeft size={16} /> {label}
    </Link>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low p-8 text-center">
      <p className="text-sm font-extrabold text-on-surface">{title}</p>
      {description && <p className="mt-1 text-xs text-on-surface-variant">{description}</p>}
    </div>
  )
}
