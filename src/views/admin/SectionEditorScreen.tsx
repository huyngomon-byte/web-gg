'use client'

import { useEffect, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ImageIcon, Plus, Save, Trash2, UploadCloud } from 'lucide-react'
import { useAdminData } from '../../admin/AdminDataContext'
import {
  BackLink,
  Breadcrumbs,
  Card,
  EmptyState,
  Field,
  ImageUploadButton,
  IconPicker,
  MediaPreview,
  TextArea,
  TextInput,
  VideoUploadButton,
} from '../../admin/ui'
import { CmsIcon } from '../../components/CmsIcon'
import { getAdminSectionLabel } from '../../cms/adminSectionLabels'
import { uploadCmsAsset } from '../../cms/mediaRepository'
import type { BrandLang } from '../../brandContent'
import type { CmsBlock, CmsBlockItem, CmsLocalizedBlockFields, CmsLocalizedBlockItemFields, CmsStatChip } from '../../cms/types'
import { getUnsupportedPreviewVideoMessage } from '../../cms/videoValidation'

type UpdateBlockItem = (pageId: string, blockId: string, itemIndex: number, patch: Partial<CmsBlockItem>) => void
type BlockTextKey = Exclude<keyof CmsLocalizedBlockFields, 'statChips'>
type ItemTextKey = Exclude<keyof CmsLocalizedBlockItemFields, 'services' | 'keyMetrics' | 'featuredStats' | 'storyDetail'>

const storyMetricSlots = Array.from({ length: 10 }, (_, index) => index)
const packageDetailPageIds = new Set(['the-one-start', 'the-one-system', 'the-one-scale'])
const languages: Array<{ label: string; value: BrandLang; caption: string }> = [
  { label: 'VI', value: 'vi', caption: 'Vietnamese copy' },
  { label: 'EN', value: 'en', caption: 'English copy' },
]

function listToText(items: string[] | undefined) {
  return (items ?? []).join('\n')
}

function isPackageListBlock(pageId: string, blockId: string) {
  return (pageId === 'homepage' || pageId === 'packages') && blockId === 'packages'
}

function isPackageDetailCardsBlock(pageId: string, blockId: string) {
  return packageDetailPageIds.has(pageId) && (blockId === 'cards' || blockId === 'process')
}

function isBasicCardsBlock(pageId: string, blockId: string) {
  return (pageId === 'about' && blockId === 'cards') || isPackageDetailCardsBlock(pageId, blockId)
}

function textToDraftList(value: string) {
  return value.split('\n')
}

function uniqueUrls(urls: Array<string | undefined>) {
  return Array.from(new Set(urls.map((url) => url?.trim()).filter(Boolean) as string[]))
}

function getPeopleAvatarUrls(item: CmsBlockItem) {
  const carouselUrls = uniqueUrls(item.avatarImages ?? [])
  if (carouselUrls.length) return carouselUrls.slice(0, 4)
  return uniqueUrls([item.imageUrl, item.funPhotoUrl, item.photoUrl, item.backgroundImageUrl]).slice(0, 4)
}

function getItemPreviewImage(item: CmsBlockItem, isPeopleBlock: boolean) {
  return isPeopleBlock ? getPeopleAvatarUrls(item)[0] : item.imageUrl
}

function getMetricFrom(items: CmsLocalizedBlockItemFields['keyMetrics'] | undefined, index: number) {
  return items?.[index] ?? { value: '', label: '', featured: false }
}

function getStatChip(items: CmsStatChip[] | undefined, index: number): CmsStatChip {
  return items?.[index] ?? { value: '', label: '', icon: '' }
}

function patchStatChip(items: CmsStatChip[] | undefined, index: number, patch: Partial<CmsStatChip>) {
  const next = [...(items ?? [])]
  while (next.length <= index) next.push({ value: '', label: '', icon: '' })
  next[index] = { ...next[index], ...patch }
  return next.filter((item, itemIndex) => itemIndex <= index || item.value.trim() || item.label.trim() || item.icon?.trim())
}

function moveUrl(items: string[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return items
  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

function getBlockTextValue(block: CmsBlock, lang: BrandLang, key: BlockTextKey) {
  const value = lang === 'vi' ? block[key as keyof CmsBlock] : block.locales?.[lang]?.[key]
  return typeof value === 'string' ? value : ''
}

function getBlockStatChips(block: CmsBlock, lang: BrandLang) {
  return lang === 'vi' ? block.statChips : block.locales?.[lang]?.statChips
}

function patchBlockText(block: CmsBlock, lang: BrandLang, patch: CmsLocalizedBlockFields): Partial<CmsBlock> {
  if (lang === 'vi') return patch as Partial<CmsBlock>
  return {
    locales: {
      ...(block.locales ?? {}),
      [lang]: {
        ...(block.locales?.[lang] ?? {}),
        ...patch,
      },
    },
  }
}

function getItemTextValue(item: CmsBlockItem, lang: BrandLang, key: ItemTextKey) {
  const value = lang === 'vi' ? item[key as keyof CmsBlockItem] : item.locales?.[lang]?.[key]
  return typeof value === 'string' ? value : ''
}

function getItemServices(item: CmsBlockItem, lang: BrandLang) {
  return lang === 'vi' ? item.services : item.locales?.[lang]?.services
}

function getItemKeyMetrics(item: CmsBlockItem, lang: BrandLang) {
  return lang === 'vi' ? item.keyMetrics : item.locales?.[lang]?.keyMetrics
}

function getItemFeaturedStats(item: CmsBlockItem, lang: BrandLang) {
  return lang === 'vi' ? item.featuredStats : item.locales?.[lang]?.featuredStats
}

function getItemStoryDetail(item: CmsBlockItem, lang: BrandLang) {
  return lang === 'vi' ? item.storyDetail : item.locales?.[lang]?.storyDetail
}

function patchItemText(item: CmsBlockItem, lang: BrandLang, patch: CmsLocalizedBlockItemFields): Partial<CmsBlockItem> {
  if (lang === 'vi') return patch as Partial<CmsBlockItem>
  return {
    locales: {
      ...(item.locales ?? {}),
      [lang]: {
        ...(item.locales?.[lang] ?? {}),
        ...patch,
      },
    },
  }
}

function BackgroundCarouselUploader({
  urls,
  onChange,
  folder,
  onUploadError,
  max = 5,
  uploadLabel = 'Upload images',
  emptyLabel = 'No carousel images yet',
  hint,
  aspectClassName = 'aspect-[4/5]',
}: {
  urls: string[]
  onChange: (urls: string[]) => void
  folder: string
  onUploadError: (message: string) => void
  max?: number
  uploadLabel?: string
  emptyLabel?: string
  hint?: string
  aspectClassName?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const remainingSlots = Math.max(0, max - urls.length)

  async function uploadFiles(files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'))
    if (!selected.length) return
    if (!remainingSlots) {
      onUploadError(`Carousel chi toi da ${max} anh.`)
      return
    }

    const limited = selected.slice(0, remainingSlots)
    if (limited.length < selected.length) onUploadError(`Chi upload them duoc ${remainingSlots} anh de giu toi da ${max} anh.`)
    else onUploadError('')

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of limited) {
        uploaded.push(await uploadCmsAsset(file, folder, 'image'))
      }
      onChange([...urls, ...uploaded].slice(0, max))
    } catch (uploadError) {
      onUploadError(uploadError instanceof Error ? uploadError.message : 'Khong upload duoc anh carousel.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault()
    if (dragIndex === null) return
    onChange(moveUrl(urls, dragIndex, targetIndex))
    setDragIndex(null)
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {urls.map((url, imageIndex) => (
          <div
            key={`${url}-${imageIndex}`}
            draggable
            onDragStart={() => setDragIndex(imageIndex)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, imageIndex)}
            onDragEnd={() => setDragIndex(null)}
            className="group overflow-hidden rounded-xl border border-outline-variant/45 bg-surface shadow-sm"
          >
            <div className={`${aspectClassName} bg-surface-container-low`}>
              <img src={url} alt={`Carousel image ${imageIndex + 1}`} className="h-full w-full object-cover" />
            </div>
            <div className="grid gap-2 p-2">
              <p className="truncate text-[11px] font-bold text-on-surface-variant">{imageIndex + 1}. {url}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(moveUrl(urls, imageIndex, imageIndex - 1))}
                  disabled={imageIndex === 0}
                  className="rounded-lg border border-outline-variant px-2 py-1.5 text-on-surface-variant disabled:opacity-40"
                  aria-label="Move image up"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveUrl(urls, imageIndex, imageIndex + 1))}
                  disabled={imageIndex === urls.length - 1}
                  className="rounded-lg border border-outline-variant px-2 py-1.5 text-on-surface-variant disabled:opacity-40"
                  aria-label="Move image down"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(urls.filter((_, index) => index !== imageIndex))}
                  className="ml-auto rounded-lg border border-red-200 px-2 py-1.5 text-red-700"
                  aria-label="Remove carousel image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {urls.length === 0 && (
          <div className={`flex ${aspectClassName} items-center justify-center rounded-xl border border-dashed border-outline-variant/60 bg-surface text-center text-xs font-bold text-on-surface-variant`}>
            {emptyLabel}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant px-3 text-xs font-extrabold text-primary transition-colors hover:bg-primary/10 ${remainingSlots ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
          <UploadCloud size={15} />
          {uploading ? 'Uploading...' : `${uploadLabel} (${urls.length}/${max})`}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || !remainingSlots}
            className="sr-only"
            onChange={(event) => {
              void uploadFiles(event.target.files)
              event.currentTarget.value = ''
            }}
          />
        </label>
        <p className="text-xs font-semibold text-on-surface-variant">{hint || `Drag thumbnails to reorder. Recommended 1080x1350, max ${max} images.`}</p>
      </div>
    </div>
  )
}

function PeopleItemEditor({
  pageId,
  blockId,
  index,
  item,
  activeLang,
  updateBlockItem,
  onUploadError,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  activeLang: BrandLang
  updateBlockItem: UpdateBlockItem
  onUploadError: (message: string) => void
}) {
  const avatarUrls = getPeopleAvatarUrls(item)
  const name = getItemTextValue(item, activeLang, 'title')
  const role = getItemTextValue(item, activeLang, 'label')
  const quote = getItemTextValue(item, activeLang, 'body')
  const proofPoint = getItemTextValue(item, activeLang, 'proofPoint')

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  function updateAvatarImages(urls: string[]) {
    const nextUrls = uniqueUrls(urls).slice(0, 4)
    updateBlockItem(pageId, blockId, index, {
      avatarImages: nextUrls,
      imageUrl: nextUrls[0] ?? '',
      funPhotoUrl: nextUrls[1] ?? '',
    })
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Avatar carousel</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
            Upload toi da 4 anh cho moi nguoi. Trang chu se tu dong chay carousel trong avatar card.
          </p>
        </div>
        <BackgroundCarouselUploader
          urls={avatarUrls}
          onChange={updateAvatarImages}
          folder={`cms/pages/${pageId}/${blockId}/people/${index + 1}/avatars`}
          onUploadError={onUploadError}
          max={4}
          uploadLabel="Upload avatar"
          emptyLabel="Chua co avatar"
          hint="Keo thumbnail de doi thu tu. Anh 1 la fallback/preview chinh, toi da 4 anh."
          aspectClassName="aspect-square"
        />
      </section>

      <label className="inline-flex w-fit items-center gap-2 rounded-xl border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
        <input
          type="checkbox"
          checked={item.published !== false}
          onChange={(event) => updateBlockItem(pageId, blockId, index, { published: event.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        Show this person
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ten">
          <TextInput value={name} onChange={(value) => updateText({ title: value })} />
        </Field>
        <Field label="Title / Vai tro">
          <TextInput value={role} onChange={(value) => updateText({ label: value })} />
        </Field>
      </div>

      <Field label="Description / Quote">
        <TextArea value={quote} onChange={(value) => updateText({ body: value })} minHeight={96} />
      </Field>
      <Field label="Proof point" hint="Mot bang chung so ngan, vi du: 5 nam cung INKAHOLIC, 0->326K don.">
        <TextInput value={proofPoint} onChange={(value) => updateText({ proofPoint: value })} />
      </Field>
    </div>
  )
}

function PackageItemEditor({
  pageId,
  blockId,
  index,
  item,
  activeLang,
  updateBlockItem,
  onUploadError,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  activeLang: BrandLang
  updateBlockItem: UpdateBlockItem
  onUploadError: (message: string) => void
}) {
  const title = getItemTextValue(item, activeLang, 'title')
  const label = getItemTextValue(item, activeLang, 'label')
  const ctaText = getItemTextValue(item, activeLang, 'ctaText')
  const caseStudyLabel = getItemTextValue(item, activeLang, 'caseStudyLabel')
  const body = getItemTextValue(item, activeLang, 'body')

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold leading-relaxed text-on-surface-variant">
        Body format đang render trên front-end: dòng 1 = mô tả ngắn; dòng có “content units/month” = metric highlight; các dòng task = deliverable cards; dòng cuối “Price:” = Monthly setup.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Package name">
          <TextInput value={title} onChange={(value) => updateText({ title: value })} />
        </Field>
        <Field label="Badge / label">
          <TextInput value={label} onChange={(value) => updateText({ label: value })} placeholder="Most Popular" />
        </Field>
        <Field label="Package anchor / href">
          <TextInput value={item.href ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} placeholder="/packages#the-one-system" />
        </Field>
        <Field label="CTA text">
          <TextInput value={ctaText} onChange={(value) => updateText({ ctaText: value })} placeholder="Choose this package" />
        </Field>
        <Field label="Case study link">
          <TextInput value={item.caseStudyLink ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { caseStudyLink: value })} placeholder="/the-one#curnon" />
        </Field>
        <Field label="Case study button text">
          <TextInput value={caseStudyLabel} onChange={(value) => updateText({ caseStudyLabel: value })} placeholder="See case studies" />
        </Field>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="grid gap-4">
          <Field label="Icon">
            <IconPicker value={item.icon ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { icon: value })} />
          </Field>
          <Field label="Package icon/image URL">
            <div className="grid gap-2">
              <TextInput value={item.imageUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageUrl: value })} />
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/packages`}
                onUploaded={(url) => updateBlockItem(pageId, blockId, index, { imageUrl: url })}
                onError={onUploadError}
                label={item.imageUrl ? 'Thay image' : 'Upload image'}
              />
            </div>
          </Field>
          <Field label="Image alt">
            <TextInput value={item.imageAlt ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageAlt: value })} />
          </Field>
        </div>
        <MediaPreview url={item.imageUrl} alt={item.imageAlt} />
      </div>
      <Field label="Package content">
        <TextArea value={body} onChange={(value) => updateText({ body: value })} minHeight={180} />
      </Field>
    </div>
  )
}

function FaqItemEditor({
  pageId,
  blockId,
  index,
  item,
  activeLang,
  updateBlockItem,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  activeLang: BrandLang
  updateBlockItem: UpdateBlockItem
}) {
  const question = getItemTextValue(item, activeLang, 'title')
  const answer = getItemTextValue(item, activeLang, 'body')

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  return (
    <div className="grid gap-4">
      <label className="inline-flex w-fit items-center gap-2 rounded-xl border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
        <input
          type="checkbox"
          checked={item.published !== false}
          onChange={(event) => updateBlockItem(pageId, blockId, index, { published: event.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        Show this FAQ
      </label>
      <Field label="Question">
        <TextInput value={question} onChange={(value) => updateText({ title: value })} />
      </Field>
      <Field label="Answer">
        <TextArea value={answer} onChange={(value) => updateText({ body: value })} minHeight={120} />
      </Field>
    </div>
  )
}

function BasicCardItemEditor({
  pageId,
  blockId,
  index,
  item,
  activeLang,
  updateBlockItem,
  onUploadError,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  activeLang: BrandLang
  updateBlockItem: UpdateBlockItem
  onUploadError: (message: string) => void
}) {
  const isProcess = blockId === 'process'
  const title = getItemTextValue(item, activeLang, 'title')
  const body = getItemTextValue(item, activeLang, 'body')

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={isProcess ? 'Step title' : 'Card title'}>
          <TextInput value={title} onChange={(value) => updateText({ title: value })} />
        </Field>
        <Field label={isProcess ? 'Step marker' : 'Icon'}>
          {isProcess ? (
            <TextInput value={item.icon ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { icon: value })} placeholder={String(index + 1).padStart(2, '0')} />
          ) : (
            <IconPicker value={item.icon ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { icon: value })} />
          )}
        </Field>
      </div>
      <Field label={isProcess ? 'Step description' : 'Card body'}>
        <TextArea value={body} onChange={(value) => updateText({ body: value })} minHeight={110} />
      </Field>
      {!isProcess && (
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-4">
            <Field label="Optional image URL">
              <div className="grid gap-2">
                <TextInput value={item.imageUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageUrl: value })} />
                <ImageUploadButton
                  folder={`cms/pages/${pageId}/${blockId}/cards`}
                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { imageUrl: url })}
                  onError={onUploadError}
                  label={item.imageUrl ? 'Thay image' : 'Upload image'}
                />
              </div>
            </Field>
            <Field label="Image alt">
              <TextInput value={item.imageAlt ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageAlt: value })} />
            </Field>
          </div>
          <MediaPreview url={item.imageUrl} alt={item.imageAlt} />
        </div>
      )}
    </div>
  )
}

function StoryItemEditor({
  pageId,
  blockId,
  index,
  item,
  activeLang,
  updateBlockItem,
  onUploadError,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  activeLang: BrandLang
  updateBlockItem: UpdateBlockItem
  onUploadError: (message: string) => void
}) {
  const title = getItemTextValue(item, activeLang, 'title')
  const category = getItemTextValue(item, activeLang, 'label')
  const period = getItemTextValue(item, activeLang, 'period')
  const headline = getItemTextValue(item, activeLang, 'body')
  const shortDescription = getItemTextValue(item, activeLang, 'shortDescription')
  const caption = getItemTextValue(item, activeLang, 'caption')
  const services = getItemServices(item, activeLang)
  const keyMetrics = getItemKeyMetrics(item, activeLang)
  const featuredStats = getItemFeaturedStats(item, activeLang)
  const storyDetail = getItemStoryDetail(item, activeLang)
  const testimonialQuote = getItemTextValue(item, activeLang, 'testimonialQuote')
  const testimonialAuthor = getItemTextValue(item, activeLang, 'testimonialAuthor')
  const testimonialRole = getItemTextValue(item, activeLang, 'testimonialRole')
  const testimonialAvatar = getItemTextValue(item, activeLang, 'testimonialAvatar')
  const filledMetricCount = storyMetricSlots.filter((metricIndex) => {
    const metric = getMetricFrom(keyMetrics, metricIndex)
    return metric.value.trim() || metric.label.trim()
  }).length
  const featuredMetricCount = storyMetricSlots.filter((metricIndex) => Boolean(getMetricFrom(keyMetrics, metricIndex).featured)).length
  const metricWarning = filledMetricCount !== 10 || featuredMetricCount !== 2

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  function updateMetric(metricIndex: number, patch: { value?: string; label?: string; featured?: boolean }) {
    const nextMetrics = [...(keyMetrics ?? [])]
    while (nextMetrics.length <= metricIndex) nextMetrics.push({ value: '', label: '', featured: false })
    nextMetrics[metricIndex] = { ...nextMetrics[metricIndex], ...patch }
    updateText({ keyMetrics: nextMetrics })
  }

  function updateSocialLink(field: 'instagram' | 'facebook' | 'tiktok' | 'website', value: string) {
    updateBlockItem(pageId, blockId, index, {
      socialLinks: {
        ...item.socialLinks,
        [field]: value,
      },
    })
  }

  function updateBackgroundImageUrl(value: string) {
    updateBlockItem(pageId, blockId, index, { backgroundImageUrl: value })
  }

  function updateScreenBackground(patch: { imageUrl?: string; gradient?: string }) {
    updateBlockItem(pageId, blockId, index, {
      screenBackground: {
        ...item.screenBackground,
        ...patch,
      },
    })
  }

  function handleBackgroundUploaded(url: string) {
    onUploadError('')
    updateBackgroundImageUrl(url)
  }

  function updateBackgroundImages(urls: string[]) {
    updateBlockItem(pageId, blockId, index, {
      backgroundImages: urls.map((url) => url.trim()).filter(Boolean).slice(0, 5),
    })
  }

  function updateHomepageGalleryImages(urls: string[]) {
    updateBlockItem(pageId, blockId, index, {
      homepageGalleryImages: urls.map((url) => url.trim()).filter(Boolean).slice(0, 3),
    })
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brand name">
          <TextInput value={title} onChange={(value) => updateText({ title: value })} />
        </Field>
        <Field label="Story ID" hint="Giữ ID này để public page map đúng brand.">
          <TextInput value={item.href ?? item.id ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} />
        </Field>
        <Field label="Category">
          <TextInput value={category} onChange={(value) => updateText({ label: value })} />
        </Field>
        <Field label="Period">
          <TextInput value={period} onChange={(value) => updateText({ period: value })} />
        </Field>
        <Field label="Instagram handle">
          <TextInput value={item.accountName ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { accountName: value })} placeholder="brand.handle" />
        </Field>
        <Field label="Story display name">
          <TextInput value={item.displayName ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { displayName: value })} placeholder="Name under story circle" />
        </Field>
      </div>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Instagram profile</p>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div className="grid gap-4">
            <Field label="Avatar / logo URL">
              <div className="grid gap-2">
                <TextInput value={item.logoUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { logoUrl: value })} />
                <ImageUploadButton
                  folder={`cms/pages/${pageId}/${blockId}/avatars`}
                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { logoUrl: url })}
                  onError={onUploadError}
                  label={item.logoUrl ? 'Thay avatar' : 'Upload avatar'}
                />
              </div>
            </Field>
            <label className="inline-flex w-fit items-center gap-2 rounded-xl border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
              <input
                type="checkbox"
                checked={Boolean(item.verified)}
                onChange={(event) => updateBlockItem(pageId, blockId, index, { verified: event.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Verified account
            </label>
          </div>
          <div className="flex items-center justify-center rounded-xl border border-outline-variant/45 bg-surface p-4">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={`${item.title || 'Brand'} avatar preview`} className="h-28 w-28 rounded-full object-contain" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-outline-variant/60 text-xs font-bold text-on-surface-variant">
                Avatar
              </div>
            )}
          </div>
        </div>
      </section>

      <Field label="Headline">
        <TextArea value={headline} onChange={(value) => updateText({ body: value })} minHeight={78} />
      </Field>

      <Field label="Short description">
        <TextArea
          value={shortDescription}
          onChange={(value) => updateText({ shortDescription: value })}
          minHeight={110}
        />
      </Field>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Story detail blocks</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Challenge">
            <TextArea
              value={storyDetail?.challenge ?? ''}
              onChange={(value) => updateText({ storyDetail: { ...(storyDetail ?? {}), challenge: value } })}
              minHeight={104}
            />
          </Field>
          <Field label="Solution">
            <TextArea
              value={storyDetail?.solution ?? ''}
              onChange={(value) => updateText({ storyDetail: { ...(storyDetail ?? {}), solution: value } })}
              minHeight={104}
            />
          </Field>
          <Field label="Result">
            <TextArea
              value={storyDetail?.result ?? ''}
              onChange={(value) => updateText({ storyDetail: { ...(storyDetail ?? {}), result: value } })}
              minHeight={104}
            />
          </Field>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Instagram caption">
          <TextArea
            value={caption}
            onChange={(value) => updateText({ caption: value })}
            minHeight={90}
          />
        </Field>
        <Field label="Likes seed">
          <TextInput value={item.likesSeed ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { likesSeed: value })} placeholder="2486" />
        </Field>
      </div>

      <Field label="Services" hint="Mỗi dòng là một service tag trên story zone.">
        <TextArea
          value={listToText(services)}
          onChange={(value) => updateText({ services: textToDraftList(value) })}
          minHeight={96}
        />
      </Field>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Story metrics</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
            Chinh cac metric hien thi nhu app icon trong man hinh iPhone cua Instagram post.
          </p>
          {metricWarning && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-relaxed text-red-700">
              Can dung 10 metric co noi dung va dung 2 metric Featured. Hien tai: {filledMetricCount}/10 metric, {featuredMetricCount}/2 Featured.
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {storyMetricSlots.map((metricIndex, displayIndex) => {
            const metric = getMetricFrom(keyMetrics, metricIndex)
            return (
              <div key={metricIndex} className="rounded-xl border border-outline-variant/45 bg-surface p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
                  Metric {String(displayIndex + 1).padStart(2, '0')}
                </p>
                <div className="grid gap-3">
                  <Field label="Value">
                    <TextInput value={metric.value} onChange={(value) => updateMetric(metricIndex, { value })} />
                  </Field>
                  <Field label="Label">
                    <TextInput value={metric.label} onChange={(value) => updateMetric(metricIndex, { label: value })} />
                  </Field>
                  <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/45 px-3 py-2 text-xs font-extrabold text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={Boolean(metric.featured)}
                      onChange={(event) => updateMetric(metricIndex, { featured: event.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    Featured metric
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Homepage featured stats</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
            Toi da 2 chip so hien tren featured case va popup hover homepage.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1].map((statIndex) => {
            const stat = getStatChip(featuredStats, statIndex)
            return (
              <div key={statIndex} className="rounded-xl border border-outline-variant/45 bg-surface p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Featured stat {statIndex + 1}</p>
                <div className="grid gap-3">
                  <Field label="Value">
                    <TextInput value={stat.value} onChange={(value) => updateText({ featuredStats: patchStatChip(featuredStats, statIndex, { value }) })} />
                  </Field>
                  <Field label="Label">
                    <TextInput value={stat.label} onChange={(value) => updateText({ featuredStats: patchStatChip(featuredStats, statIndex, { label: value }) })} />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Client testimonial</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Quote">
            <TextArea value={testimonialQuote} onChange={(value) => updateText({ testimonialQuote: value })} minHeight={88} />
          </Field>
          <div className="grid gap-4">
            <Field label="Author">
              <TextInput value={testimonialAuthor} onChange={(value) => updateText({ testimonialAuthor: value })} />
            </Field>
            <Field label="Role">
              <TextInput value={testimonialRole} onChange={(value) => updateText({ testimonialRole: value })} />
            </Field>
            <Field label="Avatar URL">
              <TextInput value={testimonialAvatar} onChange={(value) => updateText({ testimonialAvatar: value })} />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Homepage showcase / media</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Homepage order" hint="Lower numbers appear first in the homepage case-study showcase.">
            <TextInput value={item.homepageOrder ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { homepageOrder: value })} />
          </Field>
          <label className="inline-flex h-fit w-fit items-center gap-2 rounded-xl border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
            <input
              type="checkbox"
              checked={item.showOnHomepage !== false}
              onChange={(event) => updateBlockItem(pageId, blockId, index, { showOnHomepage: event.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            Show on homepage
          </label>
          <Field label="Homepage thumbnail URL" hint="Main 16:9 thumbnail for the homepage top banner and case rail.">
            <div className="grid gap-2">
              <TextInput value={item.thumbnailUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { thumbnailUrl: value })} />
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/homepage-thumbnails`}
                onUploaded={(url) => updateBlockItem(pageId, blockId, index, { thumbnailUrl: url })}
                onError={onUploadError}
                label={item.thumbnailUrl ? 'Thay thumbnail' : 'Upload thumbnail'}
              />
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Homepage gallery images" hint="Upload 3 rectangular images for the homepage hover popup. The thumbnail above is used as image 1.">
              <BackgroundCarouselUploader
                urls={item.homepageGalleryImages ?? []}
                onChange={updateHomepageGalleryImages}
                folder={`cms/pages/${pageId}/${blockId}/homepage-gallery`}
                onUploadError={onUploadError}
                max={3}
                uploadLabel="Upload gallery"
                emptyLabel="Chua co anh gallery"
                hint="Keo thumbnail de doi thu tu. Toi da 3 anh bo sung; thumbnail chinh nam o field Homepage thumbnail URL."
                aspectClassName="aspect-[16/9]"
              />
            </Field>
          </div>
          <Field label="Background image URL" hint="Dùng làm ảnh nền phía sau brand story card.">
            <div className="grid gap-2">
              <TextInput value={item.backgroundImageUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { backgroundImageUrl: value })} />
              <p className="text-xs leading-relaxed text-on-surface-variant/75">
                Upload thumbnail/poster here. This image appears before homepage hover and remains the story background.
              </p>
              {item.backgroundImageUrl ? (
                <div className="overflow-hidden rounded-xl border border-outline-variant/45 bg-surface">
                  <img src={item.backgroundImageUrl} alt={`${item.title || 'Brand'} background preview`} className="h-40 w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-outline-variant/60 bg-surface text-xs font-bold text-on-surface-variant">
                  Chưa có ảnh nền
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/backgrounds`}
                onUploaded={handleBackgroundUploaded}
                onError={onUploadError}
                label={item.backgroundImageUrl ? 'Thay ảnh' : 'Upload ảnh'}
              />
                {item.backgroundImageUrl && (
                  <button
                    type="button"
                    onClick={() => updateBackgroundImageUrl('')}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-extrabold text-red-700 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </Field>
          <Field label="iPhone screen background" hint="Gradient CSS hoặc ảnh nền riêng cho màn hình iPhone trong post.">
            <div className="grid gap-2">
              <TextInput
                value={item.screenBackground?.gradient ?? ''}
                onChange={(value) => updateScreenBackground({ gradient: value })}
                placeholder="linear-gradient(145deg,#ffe4ec,#ff6f91,#ffd166)"
              />
              <TextInput
                value={item.screenBackground?.imageUrl ?? ''}
                onChange={(value) => updateScreenBackground({ imageUrl: value })}
                placeholder="https://.../screen-bg.jpg"
              />
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/screen-backgrounds`}
                onUploaded={(url) => updateScreenBackground({ imageUrl: url })}
                onError={onUploadError}
                label={item.screenBackground?.imageUrl ? 'Thay iPhone bg' : 'Upload iPhone bg'}
              />
            </div>
          </Field>
          <Field label="Background carousel images" hint="Upload 1080x1350 images. Max 5. Drag thumbnails to reorder.">
            <BackgroundCarouselUploader
              urls={item.backgroundImages ?? []}
              onChange={updateBackgroundImages}
              folder={`cms/pages/${pageId}/${blockId}/background-carousel`}
              onUploadError={onUploadError}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Social links</p>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Instagram URL">
            <TextInput value={item.socialLinks?.instagram ?? ''} onChange={(value) => updateSocialLink('instagram', value)} />
          </Field>
          <Field label="Facebook URL">
            <TextInput value={item.socialLinks?.facebook ?? ''} onChange={(value) => updateSocialLink('facebook', value)} />
          </Field>
          <Field label="TikTok URL">
            <TextInput value={item.socialLinks?.tiktok ?? ''} onChange={(value) => updateSocialLink('tiktok', value)} />
          </Field>
          <Field label="Website URL">
            <TextInput value={item.socialLinks?.website ?? ''} onChange={(value) => updateSocialLink('website', value)} />
          </Field>
        </div>
      </section>
    </div>
  )
}

export default function SectionEditorScreen({ pageId, blockId }: { pageId: string; blockId: string }) {
  const router = useRouter()
  const {
    getPage,
    updateBlock,
    updateBlockId,
    removeBlock,
    addBlockItem,
    removeBlockItem,
    moveBlockItem,
    updateBlockItem,
    savePage,
    saving,
  } = useAdminData()
  const page = getPage(pageId)
  const blockIndex = page?.blocks.findIndex((item) => item.id === blockId) ?? -1
  const block = blockIndex >= 0 ? page?.blocks[blockIndex] : undefined
  const [idDraft, setIdDraft] = useState(blockId)
  const [activeLang, setActiveLang] = useState<BrandLang>('vi')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    setIdDraft(blockId)
  }, [blockId])

  if (!page || !block) {
    return (
      <div className="space-y-4">
        <BackLink href={`/admin/pages/${pageId}`} label="Về trang" />
        <EmptyState title="Không tìm thấy section" description={`Section "${blockId}" không tồn tại trong trang này.`} />
      </div>
    )
  }

  const currentBlock = block
  const prevBlock = blockIndex > 0 ? page.blocks[blockIndex - 1] : undefined
  const nextBlock = blockIndex < page.blocks.length - 1 ? page.blocks[blockIndex + 1] : undefined
  const adminSectionLabel = getAdminSectionLabel(pageId, block, blockIndex)
  const isStoryBlock = pageId === 'the-one' && block.id === 'stories'
  const isPeopleBlock = pageId === 'homepage' && block.id === 'people'
  const isHomepageHero = pageId === 'homepage' && block.id === 'hero'
  const isHomepageClosing = pageId === 'homepage' && block.id === 'closing'
  const isPackageList = isPackageListBlock(pageId, block.id)
  const isFaqBlock = isHomepageClosing
  const isBasicCards = isBasicCardsBlock(pageId, block.id)
  const isTheOneHero = pageId === 'the-one' && block.id === 'hero'
  const canEditBlockMedia = !isStoryBlock && (isHomepageHero || isHomepageClosing || (pageId === 'about' && block.id === 'hero'))
  const canEditItemMedia = !isStoryBlock && !isPackageList && !isBasicCards && !isFaqBlock && Boolean((block.items ?? []).some((item) => item.icon || item.imageUrl || item.imageAlt))
  const showBlockCtaLabel = isHomepageHero || isTheOneHero
  const showBlockCtaHref = false
  const showBlockHeading = !isPackageList
  const showBlockItems = !isHomepageHero && !isTheOneHero && !(block.id === 'intro' && !block.items?.length)
  const blockHeading = getBlockTextValue(currentBlock, activeLang, 'heading')
  const blockBody = getBlockTextValue(currentBlock, activeLang, 'body')
  const blockCtaLabel = getBlockTextValue(currentBlock, activeLang, 'ctaLabel')
  const blockCtaSubtext = getBlockTextValue(currentBlock, activeLang, 'ctaSubtext')
  const blockPricingNote = getBlockTextValue(currentBlock, activeLang, 'pricingNote')
  const blockSubtitle = getBlockTextValue(currentBlock, activeLang, 'subtitle')
  const blockClosingLine1 = getBlockTextValue(currentBlock, activeLang, 'closingLine1')
  const blockClosingLine2 = getBlockTextValue(currentBlock, activeLang, 'closingLine2')
  const blockStatChips = getBlockStatChips(currentBlock, activeLang)

  function updateBlockText(patch: CmsLocalizedBlockFields) {
    updateBlock(pageId, blockId, patchBlockText(currentBlock, activeLang, patch))
  }

  function commitId() {
    const nextId = updateBlockId(pageId, blockId, idDraft)
    if (nextId !== blockId) router.replace(`/admin/pages/${pageId}/sections/${nextId}`)
  }

  function handleRemove() {
    if (!window.confirm('Xóa section này khỏi trang?')) return
    removeBlock(pageId, blockId)
    router.push(`/admin/pages/${pageId}`)
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Pages', href: '/admin/pages' },
          { label: page.title, href: `/admin/pages/${pageId}` },
          { label: adminSectionLabel },
        ]}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/45 bg-surface/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Section {blockIndex + 1}/{page.blocks.length}</p>
          <h1 className="text-2xl font-extrabold text-on-surface">{adminSectionLabel}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => prevBlock && router.push(`/admin/pages/${pageId}/sections/${prevBlock.id}`)}
            disabled={!prevBlock}
            className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2.5 text-xs font-extrabold text-on-surface-variant disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Trước
          </button>
          <button
            onClick={() => nextBlock && router.push(`/admin/pages/${pageId}/sections/${nextBlock.id}`)}
            disabled={!nextBlock}
            className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2.5 text-xs font-extrabold text-on-surface-variant disabled:opacity-40"
          >
            Sau <ChevronRight size={15} />
          </button>
          <button
            onClick={() => void savePage(pageId)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary disabled:opacity-60"
          >
            <Save size={17} /> {saving ? 'Đang lưu...' : 'Save page'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Manual bilingual copy</p>
          <p className="mt-1 text-sm font-semibold text-on-surface-variant">
            Chon ngon ngu de sua text rieng. Media, gallery, link ky thuat, order va publish status van dung chung cho ca hai version.
          </p>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-outline-variant/45 bg-surface p-1">
          {languages.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setActiveLang(item.value)}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-colors ${
                activeLang === item.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
              title={item.caption}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="mb-4 flex justify-end">
          <button onClick={handleRemove} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">
            <Trash2 size={13} /> Xóa section
          </button>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Block ID" hint="Giữ đúng ID để trang public render đúng vị trí.">
              <TextInput value={idDraft} onChange={setIdDraft} placeholder={block.id} />
              {idDraft !== blockId && (
                <button onClick={commitId} className="mt-2 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-extrabold text-primary">
                  Áp dụng ID mới
                </button>
              )}
            </Field>
            {showBlockCtaHref && (
              <Field label="CTA link">
                <TextInput value={block.ctaHref ?? ''} onChange={(value) => updateBlock(pageId, blockId, { ctaHref: value })} placeholder="/contact" />
              </Field>
            )}
            {showBlockCtaLabel && (
              <Field label="CTA button text" hint="Text hiển thị trên button, ví dụ: Call Your Shot.">
                <TextInput value={blockCtaLabel} onChange={(value) => updateBlockText({ ctaLabel: value })} placeholder="Call Your Shot" />
              </Field>
            )}
            {isHomepageHero && (
              <Field label="CTA subtext">
                <TextInput value={blockCtaSubtext} onChange={(value) => updateBlockText({ ctaSubtext: value })} placeholder="Free 30-min call" />
              </Field>
            )}
          </div>

          {showBlockHeading && (
          <Field label={isFaqBlock ? 'FAQ title' : 'Heading'}>
            <TextInput value={blockHeading} onChange={(value) => updateBlockText({ heading: value })} />
          </Field>
          )}
          <Field label="Body / mô tả">
            <TextArea value={blockBody} onChange={(value) => updateBlockText({ body: value })} minHeight={130} />
          </Field>

          {isHomepageHero && (
            <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Hero stat chips</p>
              <div className="grid gap-3 md:grid-cols-3">
                {[0, 1, 2].map((statIndex) => {
                  const stat = getStatChip(blockStatChips, statIndex)
                  return (
                    <div key={statIndex} className="rounded-xl border border-outline-variant/45 bg-surface p-4">
                      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Chip {statIndex + 1}</p>
                      <div className="grid gap-3">
                        <Field label="Value">
                          <TextInput value={stat.value} onChange={(value) => updateBlockText({ statChips: patchStatChip(blockStatChips, statIndex, { value }) })} />
                        </Field>
                        <Field label="Label">
                          <TextInput value={stat.label} onChange={(value) => updateBlockText({ statChips: patchStatChip(blockStatChips, statIndex, { label: value }) })} />
                        </Field>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {isPackageList && (
            <Field label="Pricing note" hint="Dòng minh bạch dưới các package cards.">
              <TextArea value={blockPricingNote} onChange={(value) => updateBlockText({ pricingNote: value })} minHeight={86} />
            </Field>
          )}

          {pageId === 'homepage' && block.id === 'what-is' && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-on-surface-variant">
              Media for these Explore tiles is paired with the same brand items in{' '}
              <a href="/admin/pages/the-one/sections/stories" className="font-extrabold text-primary underline underline-offset-4">
                The One Stories - Story order
              </a>
              . Keep each Explore item href equal to the story id, then edit video, thumbnail, carousel and social links in that story item.
            </div>
          )}

          {pageId === 'homepage' && block.id === 'closing' && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-on-surface-variant">
              Items in this Closing section are rendered as homepage FAQ. Use item title as the question and item body as the answer.
            </div>
          )}

          {isPeopleBlock && (
            <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <Field label="Closing line 1">
                <TextInput value={blockClosingLine1} onChange={(value) => updateBlockText({ closingLine1: value })} />
              </Field>
              <Field label="Closing line 2">
                <TextInput value={blockClosingLine2} onChange={(value) => updateBlockText({ closingLine2: value })} />
              </Field>
            </div>
          )}

          {canEditBlockMedia && (
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="grid gap-4">
              <Field label="Icon section">
                <IconPicker value={block.icon ?? ''} onChange={(value) => updateBlock(pageId, blockId, { icon: value })} />
              </Field>
              <Field label="Image URL">
                <div className="grid gap-2">
                  <TextInput value={block.imageUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { imageUrl: value })} placeholder="/logo-gg.png hoặc https://..." />
                  <ImageUploadButton
                    folder={`cms/pages/${pageId}/${blockId}`}
                    onUploaded={(url) => updateBlock(pageId, blockId, { imageUrl: url })}
                    onError={setUploadError}
                  />
                </div>
              </Field>
              <Field label="Image alt">
                <TextInput value={block.imageAlt ?? ''} onChange={(value) => updateBlock(pageId, blockId, { imageAlt: value })} />
              </Field>
              <Field label="Background image URL">
                <div className="grid gap-2">
                  <TextInput value={block.backgroundImageUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundImageUrl: value })} placeholder="Hero background image URL" />
                  <ImageUploadButton
                    folder={`cms/pages/${pageId}/${blockId}/background`}
                    onUploaded={(url) => updateBlock(pageId, blockId, { backgroundImageUrl: url })}
                    onError={setUploadError}
                    label={block.backgroundImageUrl ? 'Thay background' : 'Upload background'}
                  />
                </div>
              </Field>
              <Field label="Background gradient">
                <TextInput value={block.backgroundGradient ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundGradient: value })} placeholder="linear-gradient(180deg,#FFF5F7 0%,#FFE4EC 55%,#FFD9E4 100%)" />
              </Field>
              <Field label="Overlay opacity">
                <TextInput value={block.backgroundOverlayOpacity ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundOverlayOpacity: value })} placeholder="0.15" />
              </Field>
              <Field label="Subtitle">
                <TextInput value={blockSubtitle} onChange={(value) => updateBlockText({ subtitle: value })} />
              </Field>
              {block.id === 'hero' && (
                <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <Field label="Text color mode">
                    <TextInput value={block.textColor ?? ''} onChange={(value) => updateBlock(pageId, blockId, { textColor: value as 'light' | 'dark' | 'gradient' })} placeholder="light / dark / gradient" />
                  </Field>
                  <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={block.dividerShow !== false}
                      onChange={(event) => updateBlock(pageId, blockId, { dividerShow: event.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    Show hero divider
                  </label>
                </div>
              )}
              {block.id === 'people' && (
                <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <Field label="Closing line 1">
                    <TextInput value={blockClosingLine1} onChange={(value) => updateBlockText({ closingLine1: value })} />
                  </Field>
                  <Field label="Closing line 2">
                    <TextInput value={blockClosingLine2} onChange={(value) => updateBlockText({ closingLine2: value })} />
                  </Field>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <MediaPreview url={block.imageUrl} alt={block.imageAlt} />
              {uploadError && <p className="text-xs font-bold text-red-700">{uploadError}</p>}
              {!block.imageUrl && (
                <div className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CmsIcon name={block.icon} size={20} />
                  </div>
                  <p className="text-sm font-extrabold text-on-surface">{blockHeading || 'Preview icon + text'}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-on-surface-variant">{blockBody}</p>
                </div>
              )}
            </div>
          </div>
          )}

          {showBlockItems && (
          <section className="min-w-0 overflow-hidden rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-on-surface">Items / cards</h3>
                <p className="text-xs text-on-surface-variant">Mỗi item là một card/icon/text trong section này.</p>
              </div>
              <button
                onClick={() => addBlockItem(pageId, blockId)}
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-extrabold text-primary"
              >
                <Plus size={15} /> Thêm item
              </button>
            </div>

            <div className="space-y-3">
              {(block.items ?? []).map((item, index) => {
                const itemTitle = getItemTextValue(item, activeLang, 'title')
                const itemLabel = getItemTextValue(item, activeLang, 'label')
                const itemBody = getItemTextValue(item, activeLang, 'body')
                const itemCaseStudyLabel = getItemTextValue(item, activeLang, 'caseStudyLabel')
                const itemSummaryTitle = itemTitle || item.title || `Item ${index + 1}`
                const itemSummaryText = item.href || itemLabel || itemBody || item.label || item.body || 'Icon + text item'

                function updateGenericItemText(patch: CmsLocalizedBlockItemFields) {
                  updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
                }

                return (
                <details key={`${blockId}-item-${index}`} className="group min-w-0 overflow-hidden rounded-xl border border-outline-variant/45 bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                      {!isStoryBlock && (getItemPreviewImage(item, isPeopleBlock) || item.icon) && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          {getItemPreviewImage(item, isPeopleBlock) ? (
                            <img src={getItemPreviewImage(item, isPeopleBlock) || ''} alt={item.imageAlt || item.title} className="h-6 w-6 object-contain" />
                          ) : (
                            <CmsIcon name={item.icon} size={18} />
                          )}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold">{itemSummaryTitle}</span>
                        <span className="block truncate text-xs text-on-surface-variant">{itemSummaryText}</span>
                      </span>
                    </span>
                    <ChevronDown size={16} className="shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-outline-variant/30 p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => moveBlockItem(pageId, blockId, index, -1)}
                          disabled={index === 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant disabled:opacity-40"
                        >
                          <ArrowUp size={13} /> Lên
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlockItem(pageId, blockId, index, 1)}
                          disabled={index === (block.items?.length ?? 0) - 1}
                          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant disabled:opacity-40"
                        >
                          <ArrowDown size={13} /> Xuống
                        </button>
                      </div>
                      <button
                        onClick={() => removeBlockItem(pageId, blockId, index)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700"
                      >
                        <Trash2 size={13} /> Xóa item
                      </button>
                    </div>
                    {isStoryBlock ? (
                      <StoryItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
                    ) : isPeopleBlock ? (
                      <PeopleItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
                    ) : isPackageList ? (
                      <PackageItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
                    ) : isFaqBlock ? (
                      <FaqItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} />
                    ) : isBasicCards ? (
                      <BasicCardItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
                    ) : (
                    <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <TextInput value={itemTitle} onChange={(value) => updateGenericItemText({ title: value })} />
                      </Field>
                      <Field label="Href">
                        <TextInput value={item.href ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} />
                      </Field>
                      <Field label="Case study link">
                        <TextInput value={item.caseStudyLink ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { caseStudyLink: value })} placeholder="/the-one#curnon" />
                      </Field>
                      <Field label="Case study label">
                        <TextInput value={itemCaseStudyLabel} onChange={(value) => updateGenericItemText({ caseStudyLabel: value })} placeholder="See case studies" />
                      </Field>
                      <Field label="Label phụ">
                        <TextInput value={itemLabel} onChange={(value) => updateGenericItemText({ label: value })} />
                      </Field>
                      {canEditItemMedia && (
                        <Field label="Icon">
                          <IconPicker value={item.icon ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { icon: value })} />
                        </Field>
                      )}
                    </div>
                    <div className={`mt-4 grid gap-4 ${canEditItemMedia ? 'md:grid-cols-[1fr_220px]' : ''}`}>
                      <div className="grid gap-4">
                        <Field label="Body">
                          <TextArea value={itemBody} onChange={(value) => updateGenericItemText({ body: value })} minHeight={100} />
                        </Field>
                        {canEditItemMedia && (
                          <>
                            <Field label="Video preview URL" hint="MP4/WebM/OGG Cloudinary URL. YouTube links are blocked because the homepage preview uses an HTML video player.">
                              <div className="grid gap-2">
                                <TextInput value={item.videoUrl ?? item.embedUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { videoUrl: value, embedUrl: '' })} />
                                {getUnsupportedPreviewVideoMessage(item.videoUrl ?? item.embedUrl) && (
                                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                                    {getUnsupportedPreviewVideoMessage(item.videoUrl ?? item.embedUrl)}
                                  </p>
                                )}
                                <VideoUploadButton
                                  folder={`cms/pages/${pageId}/${blockId}/items/previews`}
                                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { videoUrl: url, embedUrl: '' })}
                                  onError={setUploadError}
                                />
                              </div>
                            </Field>
                            <Field label="Preview poster URL">
                              <TextInput value={item.videoPoster ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { videoPoster: value })} />
                            </Field>
                            <Field label="Image URL">
                              <div className="grid gap-2">
                                <TextInput value={item.imageUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageUrl: value })} />
                                <ImageUploadButton
                                  folder={`cms/pages/${pageId}/${blockId}/items`}
                                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { imageUrl: url })}
                                  onError={setUploadError}
                                />
                              </div>
                            </Field>
                            <Field label="Image alt">
                              <TextInput value={item.imageAlt ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { imageAlt: value })} />
                            </Field>
                            <Field label="Thumbnail URL">
                              <TextInput value={item.thumbnailUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { thumbnailUrl: value })} />
                            </Field>
                            <Field label="Fun photo URL" hint="Optional hover photo for The One People polaroid cards.">
                              <TextInput value={item.funPhotoUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { funPhotoUrl: value })} />
                            </Field>
                          </>
                        )}
                      </div>
                      {canEditItemMedia && <MediaPreview url={item.imageUrl} alt={item.imageAlt} />}
                    </div>
                    </>
                    )}
                  </div>
                </details>
                )
              })}
              {(block.items ?? []).length === 0 && (
                <p className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <ImageIcon size={13} /> Chưa có item nào trong section này.
                </p>
              )}
            </div>
          </section>
          )}
        </div>
      </Card>
    </div>
  )
}
