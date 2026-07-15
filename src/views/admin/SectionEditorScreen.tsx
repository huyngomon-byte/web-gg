'use client'

import { useEffect, useState, type CSSProperties, type DragEvent } from 'react'
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
import { getStoryBrandLogoAsset } from '../../components/StoryBrandLogo'
import { getAdminSectionLabel } from '../../cms/adminSectionLabels'
import { uploadCmsAsset } from '../../cms/mediaRepository'
import type { BrandLang } from '../../brandContent'
import type { CmsBlock, CmsBlockItem, CmsLocalizedBlockFields, CmsLocalizedBlockItemFields, CmsStatChip } from '../../cms/types'
import { getUnsupportedPreviewVideoMessage } from '../../cms/videoValidation'

type UpdateBlockItem = (pageId: string, blockId: string, itemIndex: number, patch: Partial<CmsBlockItem>) => void
type BlockTextKey = Exclude<keyof CmsLocalizedBlockFields, 'statChips'>
type ItemTextKey = Exclude<keyof CmsLocalizedBlockItemFields, 'services' | 'features' | 'keyMetrics' | 'featuredStats' | 'storyDetail'>

const storyMetricSlots = Array.from({ length: 10 }, (_, index) => index)
const packageDetailPageIds = new Set(['the-one-start', 'the-one-system', 'the-one-scale'])

function SafeCropPreview({
  url,
  alt,
  aspectClassName,
  label,
  position,
}: {
  url?: string
  alt: string
  aspectClassName: string
  label: string
  position?: string
}) {
  if (!url) return null
  return (
    <div className={`relative overflow-hidden rounded-xl border border-outline-variant/45 bg-surface-container-low ${aspectClassName}`}>
      <img src={url} alt={alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position?.trim() || '50% 50%' } as CSSProperties} />
      <div className="pointer-events-none absolute inset-[9%] rounded-lg border border-dashed border-white/90 shadow-[0_0_0_999px_rgba(20,8,16,0.12)]" aria-hidden="true" />
      <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">{label}</span>
    </div>
  )
}

function listToText(items: string[] | undefined) {
  return (items ?? []).join('\n')
}

function isPackageListBlock(pageId: string, blockId: string) {
  return pageId === 'homepage' && blockId === 'packages'
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
  return items?.[index] ?? { value: '', label: '', shortLabel: '', featured: false }
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

function getItemFeatures(item: CmsBlockItem, lang: BrandLang) {
  return lang === 'vi' ? item.features : item.locales?.[lang]?.features
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
  const [localError, setLocalError] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const remainingSlots = Math.max(0, max - urls.length)

  function reportError(message: string) {
    setLocalError(message)
    onUploadError(message)
  }

  async function uploadFiles(files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'))
    if (!selected.length) return
    if (!remainingSlots) {
      reportError(`Carousel chi toi da ${max} anh.`)
      return
    }

    const limited = selected.slice(0, remainingSlots)
    if (limited.length < selected.length) reportError(`Chi upload them duoc ${remainingSlots} anh de giu toi da ${max} anh.`)
    else reportError('')

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of limited) {
        uploaded.push(await uploadCmsAsset(file, folder, 'image'))
      }
      onChange([...urls, ...uploaded].slice(0, max))
    } catch (uploadError) {
      reportError(uploadError instanceof Error ? uploadError.message : 'Khong upload duoc anh carousel.')
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
      {localError && <p className="text-xs font-bold text-red-700">{localError}</p>}
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

  function updateAvatarImagesMobile(urls: string[]) {
    updateBlockItem(pageId, blockId, index, { avatarImagesMobile: uniqueUrls(urls).slice(0, 4) })
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
          hint="Anh ngang 16:9 (toi thieu 640x360). Keo thumbnail de doi thu tu. Anh 1 la fallback/preview chinh, toi da 4 anh."
          aspectClassName="aspect-[16/9]"
        />
        <div className="mt-4 border-t border-outline-variant/45 pt-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Avatar carousel - mobile (4:3)</p>
          <p className="mb-3 text-xs leading-relaxed text-on-surface-variant/75">
            Optional. Anh crop 4:3 rieng de banner mobile hien full khung, khong bi vien mo. Neu de trong se dung lai anh 16:9 o tren.
          </p>
          <BackgroundCarouselUploader
            urls={item.avatarImagesMobile ?? []}
            onChange={updateAvatarImagesMobile}
            folder={`cms/pages/${pageId}/${blockId}/people/${index + 1}/avatars-mobile`}
            onUploadError={onUploadError}
            max={4}
            uploadLabel="Upload avatar mobile"
            emptyLabel="Chua co avatar mobile"
            hint="Anh 4:3 rieng cho mobile. Thu tu khop voi avatar carousel 16:9 o tren."
            aspectClassName="aspect-[4/3]"
          />
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Spotlight images</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
            Banner image hien trong khung lon The One People. Thumbnail image hien tren thanh member ben duoi.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-4">
            <Field label="Banner image URL">
              <div className="grid gap-2">
                <TextInput value={item.bannerImageUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { bannerImageUrl: value })} />
                <ImageUploadButton
                  folder={`cms/pages/${pageId}/${blockId}/people/${index + 1}/banner`}
                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { bannerImageUrl: url })}
                  onError={onUploadError}
                  label={item.bannerImageUrl ? 'Thay banner' : 'Upload banner'}
                />
                <TextInput
                  value={item.bannerImagePosition ?? ''}
                  onChange={(value) => updateBlockItem(pageId, blockId, index, { bannerImagePosition: value })}
                  placeholder="Desktop focal point, e.g. 50% 40%"
                />
                <SafeCropPreview
                  url={item.bannerImageUrl}
                  alt={`${item.title || 'Person'} desktop People banner preview`}
                  aspectClassName="aspect-[8/3]"
                  label="Desktop safe crop"
                  position={item.bannerImagePosition}
                />
              </div>
            </Field>
            <Field label="Mobile banner image URL" hint="Recommended 1200x900 portrait-safe crop.">
              <div className="grid gap-2">
                <TextInput value={item.bannerImageMobileUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { bannerImageMobileUrl: value })} />
                <ImageUploadButton
                  folder={`cms/pages/${pageId}/${blockId}/people/${index + 1}/banner-mobile`}
                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { bannerImageMobileUrl: url })}
                  onError={onUploadError}
                  label={item.bannerImageMobileUrl ? 'Replace mobile banner' : 'Upload mobile banner'}
                />
                <TextInput
                  value={item.bannerImageMobilePosition ?? ''}
                  onChange={(value) => updateBlockItem(pageId, blockId, index, { bannerImageMobilePosition: value })}
                  placeholder="Mobile focal point, e.g. 50% 35%"
                />
                <SafeCropPreview
                  url={item.bannerImageMobileUrl || item.bannerImageUrl}
                  alt={`${item.title || 'Person'} mobile People banner preview`}
                  aspectClassName="aspect-[4/3]"
                  label="Mobile safe crop"
                  position={item.bannerImageMobilePosition || item.bannerImagePosition}
                />
              </div>
            </Field>
            <Field label="Thumbnail image URL">
              <div className="grid gap-2">
                <TextInput value={item.thumbnailUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { thumbnailUrl: value })} />
                <ImageUploadButton
                  folder={`cms/pages/${pageId}/${blockId}/people/${index + 1}/thumbnail`}
                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { thumbnailUrl: url })}
                  onError={onUploadError}
                  label={item.thumbnailUrl ? 'Thay thumbnail' : 'Upload thumbnail'}
                />
              </div>
            </Field>
          </div>
          <MediaPreview url={item.bannerImageUrl || item.thumbnailUrl || item.imageUrl} alt={item.imageAlt || item.title} />
        </div>
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
  const subtitle = getItemTextValue(item, activeLang, 'subtitle')
  const label = getItemTextValue(item, activeLang, 'label')
  const ctaText = getItemTextValue(item, activeLang, 'ctaText')
  const caseStudyLabel = getItemTextValue(item, activeLang, 'caseStudyLabel')
  const priceLabel = getItemTextValue(item, activeLang, 'priceLabel')
  const priceValue = getItemTextValue(item, activeLang, 'priceValue')
  const body = getItemTextValue(item, activeLang, 'body')
  const features = getItemFeatures(item, activeLang) ?? []

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  function updateFeature(featureIndex: number, patch: { label?: string; text?: string; group?: string; featured?: boolean }) {
    const next = [...features]
    while (next.length <= featureIndex) next.push({ text: '' })
    next[featureIndex] = { ...next[featureIndex], ...patch }
    updateText({ features: next })
  }

  function moveFeature(featureIndex: number, direction: -1 | 1) {
    const targetIndex = featureIndex + direction
    if (targetIndex < 0 || targetIndex >= features.length) return
    const next = [...features]
    const [feature] = next.splice(featureIndex, 1)
    next.splice(targetIndex, 0, feature)
    updateText({ features: next })
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
        <Field label="Subtitle">
          <TextInput value={subtitle} onChange={(value) => updateText({ subtitle: value })} />
        </Field>
        <Field label="Badge / label">
          <TextInput value={label} onChange={(value) => updateText({ label: value })} placeholder="Most Popular" />
        </Field>
        <Field label="Package anchor / href">
          <TextInput value={item.href ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} placeholder="/#packages" />
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
        <Field label="Price label">
          <TextInput value={priceLabel} onChange={(value) => updateText({ priceLabel: value })} placeholder="MONTHLY SETUP" />
        </Field>
        <Field label="Price value">
          <TextInput value={priceValue} onChange={(value) => updateText({ priceValue: value })} placeholder="15,000,000 VND/month" />
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
          <Field label="Left panel background URL">
            <div className="grid gap-2">
              <TextInput value={item.leftBackgroundUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { leftBackgroundUrl: value })} />
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/packages/${index + 1}/left-background`}
                onUploaded={(url) => updateBlockItem(pageId, blockId, index, { leftBackgroundUrl: url })}
                onError={onUploadError}
                label={item.leftBackgroundUrl ? 'Thay left bg' : 'Upload left bg'}
              />
            </div>
          </Field>
          <Field label="Right panel background URL">
            <div className="grid gap-2">
              <TextInput value={item.rightBackgroundUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { rightBackgroundUrl: value })} />
              <ImageUploadButton
                folder={`cms/pages/${pageId}/${blockId}/packages/${index + 1}/right-background`}
                onUploaded={(url) => updateBlockItem(pageId, blockId, index, { rightBackgroundUrl: url })}
                onError={onUploadError}
                label={item.rightBackgroundUrl ? 'Thay right bg' : 'Upload right bg'}
              />
            </div>
          </Field>
          <Field label="Overlay opacity" hint="0.18 - 0.78. De trong = auto.">
            <TextInput value={item.overlayOpacity ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { overlayOpacity: value })} placeholder="0.46" />
          </Field>
        </div>
        <MediaPreview url={item.imageUrl} alt={item.imageAlt} />
      </div>
      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Feature rows</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
              Each row: text + optional group + Featured flag. Rows stay exactly where you place them (no auto-grouping). Featured rows (max 4) show on the compact card; everything else lives in the expander, grouped by the Group field.
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateText({ features: [...features, { text: '', group: '', featured: false }] })}
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-xs font-extrabold text-primary"
          >
            <Plus size={15} /> Add row
          </button>
        </div>
        <div className="grid gap-3">
          {features.map((feature, featureIndex) => (
            <div key={featureIndex} className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface p-3 md:grid-cols-[1.4fr_0.7fr_auto_auto]">
              <TextInput value={feature.text} onChange={(value) => updateFeature(featureIndex, { text: value })} placeholder="Feature detail" />
              <TextInput
                value={feature.group ?? feature.label ?? ''}
                onChange={(value) => updateFeature(featureIndex, { group: value })}
                placeholder="Group (optional)"
              />
              <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-outline-variant px-2.5 text-xs font-extrabold text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={feature.featured === true}
                  onChange={(event) => updateFeature(featureIndex, { featured: event.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Featured
              </label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveFeature(featureIndex, -1)} disabled={featureIndex === 0} className="rounded-lg border border-outline-variant px-2.5 py-2 text-on-surface-variant disabled:opacity-40" aria-label="Move feature up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => moveFeature(featureIndex, 1)} disabled={featureIndex === features.length - 1} className="rounded-lg border border-outline-variant px-2.5 py-2 text-on-surface-variant disabled:opacity-40" aria-label="Move feature down">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => updateText({ features: features.filter((_, itemIndex) => itemIndex !== featureIndex) })} className="rounded-lg border border-red-200 px-2.5 py-2 text-red-700" aria-label="Remove feature">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {features.length === 0 && (
            <p className="rounded-xl border border-dashed border-outline-variant/50 bg-surface px-4 py-3 text-xs font-semibold text-on-surface-variant">
              Chua co feature row. Neu de trong, front-end tam parse tu Body cu.
            </p>
          )}
        </div>
      </section>
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

function RedFlagItemEditor({
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
  const body = getItemTextValue(item, activeLang, 'body')

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  // Round 7 A3: red-flags items are Threads-style replies (handle + role + complaint + likes).
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Handle" hint="e.g. fnb.chain.owner">
          <TextInput value={item.handle ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { handle: value })} placeholder="fnb.chain.owner" />
        </Field>
        <Field label="Role label" hint="Shown next to the handle, e.g. F&B chain owner">
          <TextInput value={item.roleLabel ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { roleLabel: value })} placeholder="F&B chain owner" />
        </Field>
        <Field label="Likes (display only)">
          <TextInput value={item.likes ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { likes: value })} placeholder="156" />
        </Field>
        <Field label="Avatar URL" hint="Empty = colored circle with the first letter of the handle.">
          <div className="grid gap-2">
            <TextInput value={item.avatarUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { avatarUrl: value })} />
            <ImageUploadButton
              folder={`cms/pages/${pageId}/${blockId}/avatars`}
              onUploaded={(url) => updateBlockItem(pageId, blockId, index, { avatarUrl: url })}
              onError={onUploadError}
              label={item.avatarUrl ? 'Replace avatar' : 'Upload avatar'}
            />
          </div>
        </Field>
      </div>
      <Field label="Complaint text">
        <TextArea value={body} onChange={(value) => updateText({ body: value })} minHeight={80} />
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
  // Two featured metrics form the hero slide; the remaining eight metrics
  // fill four chart slides at two tiles each. Media therefore has five slots.
  const filledMetrics = storyMetricSlots
    .map((metricIndex) => getMetricFrom(keyMetrics, metricIndex))
    .filter((metric) => metric.value.trim() || metric.label.trim())
  const metricsWithoutSlide = filledMetrics.filter((metric) => !metric.featured && !metric.slide).length
  const chartSlideNumbers = [2, 3, 4, 5]
  const slideTileCounts = chartSlideNumbers.map((slide) => filledMetrics.filter((metric) => metric.slide === slide).length)
  const slideBalanceWarning = slideTileCounts.some((count) => count > 0 && count !== 2)
  const backgroundImageCount = (item.backgroundImages ?? []).filter((url) => url.trim()).length
  const avatarPreviewAsset = getStoryBrandLogoAsset(String(item.href || item.id || title || item.title || ''))
  const avatarPreviewSrc = ['/story-logos/qandabook.webp', '/story-logos/gg.webp'].includes(avatarPreviewAsset?.src ?? '')
    ? avatarPreviewAsset?.src
    : item.logoUrl

  function updateText(patch: CmsLocalizedBlockItemFields) {
    updateBlockItem(pageId, blockId, index, patchItemText(item, activeLang, patch))
  }

  function updateMetric(
    metricIndex: number,
    patch: {
      value?: string
      label?: string
      shortLabel?: string
      featured?: boolean
      slide?: number
      display?: 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'trend'
      tileAnchor?: 'auto' | 'left-stack' | 'right-stack' | 'top-band' | 'split-diagonal' | 'center-low'
      from?: string
      to?: string
      benchmarkLabel?: string
      benchmarkValue?: string
      percent?: number
      series?: string
      chartCaption?: string
    },
  ) {
    const nextMetrics = [...(keyMetrics ?? [])]
    while (nextMetrics.length <= metricIndex) nextMetrics.push({ value: '', label: '', shortLabel: '', featured: false })
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

  function updateBackgroundImages(urls: string[]) {
    updateBlockItem(pageId, blockId, index, {
      backgroundImages: urls.map((url) => url.trim()).filter(Boolean).slice(0, 5),
    })
  }

  function updateHomepageGalleryImages(urls: string[]) {
    updateBlockItem(pageId, blockId, index, {
      homepageGalleryImages: urls.map((url) => url.trim()).filter(Boolean).slice(0, 4),
    })
  }

  function updateHomepageGalleryImagesMobile(urls: string[]) {
    updateBlockItem(pageId, blockId, index, {
      homepageGalleryImagesMobile: urls.map((url) => url.trim()).filter(Boolean).slice(0, 4),
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
        <Field label="Layout variant" hint="auto hoac 1-8. Dung de ep map bento khi anh co subject can khoe.">
          <TextInput value={item.layoutVariant ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { layoutVariant: value })} placeholder="auto / 1 / 2 / ... / 8" />
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
            {avatarPreviewSrc ? (
              <img src={avatarPreviewSrc} alt={`${item.title || 'Brand'} avatar preview`} className="h-28 w-28 rounded-full object-contain" />
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
          {metricsWithoutSlide > 0 && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800">
              {metricsWithoutSlide} metric chua gan Slide — se tu roi vao slide it tile nhat. Nen gan slide thu cong theo y do noi dung.
            </p>
          )}
          {slideBalanceWarning && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800">
              Moi slide 2-5 nen co 2 tile. Hien tai: {chartSlideNumbers.map((slide, slideIndex) => `slide ${slide} = ${slideTileCounts[slideIndex]}`).join(', ')}.
            </p>
          )}
          {backgroundImageCount < 5 && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800">
              Carousel co 5 slide nhung story chi co {backgroundImageCount} anh nen — anh cuoi se lap lai. Nen upload du 5 anh (muc Background images).
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
                  <Field label="Short label" hint="Optional. Dung khi metric roi vao o nho 1x1/1x2 de tranh cat chu.">
                    <TextInput value={metric.shortLabel ?? ''} onChange={(value) => updateMetric(metricIndex, { shortLabel: value })} />
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
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Slide (carousel)" hint="Empty = auto: drops into the emptiest chart slide.">
                      <select
                        value={metric.slide ?? ''}
                        onChange={(event) => updateMetric(metricIndex, { slide: event.target.value ? Number(event.target.value) : undefined })}
                        className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface"
                      >
                        <option value="">Auto</option>
                        {[1, 2, 3, 4, 5].map((slide) => (
                          <option key={slide} value={slide}>Slide {slide}{slide === 1 ? ' (hero)' : ''}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Display as">
                      <select
                        value={metric.display ?? 'bignum'}
                        onChange={(event) => updateMetric(metricIndex, { display: event.target.value as 'bignum' | 'beforeafter' | 'donut' | 'bars' | 'trend' })}
                        className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface"
                      >
                        <option value="bignum">Big number</option>
                        <option value="beforeafter">Before → After bars</option>
                        <option value="donut">Donut %</option>
                        <option value="bars">Bars vs benchmark</option>
                        <option value="trend">Trend line</option>
                      </select>
                    </Field>
                    <Field label="Tile anchor" hint="Auto = layout sequence. Set this on one metric in a slide to override the whole slide.">
                      <select
                        value={metric.tileAnchor ?? 'auto'}
                        onChange={(event) => updateMetric(metricIndex, { tileAnchor: event.target.value as 'auto' | 'left-stack' | 'right-stack' | 'top-band' | 'split-diagonal' | 'center-low' })}
                        className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface"
                      >
                        <option value="auto">Auto</option>
                        <option value="left-stack">Left stack</option>
                        <option value="right-stack">Right stack</option>
                        <option value="top-band">Top band</option>
                        <option value="split-diagonal">Split diagonal</option>
                        <option value="center-low">Center low</option>
                      </select>
                    </Field>
                  </div>
                  {(metric.display === 'beforeafter' || metric.display === 'trend') && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="From" hint='e.g. "70%" or "1.5"'>
                        <TextInput value={metric.from ?? ''} onChange={(value) => updateMetric(metricIndex, { from: value })} />
                      </Field>
                      <Field label="To" hint="Empty = uses Value">
                        <TextInput value={metric.to ?? ''} onChange={(value) => updateMetric(metricIndex, { to: value })} />
                      </Field>
                    </div>
                  )}
                  {metric.display === 'bars' && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Benchmark label" hint='e.g. "Industry"'>
                          <TextInput value={metric.benchmarkLabel ?? ''} onChange={(value) => updateMetric(metricIndex, { benchmarkLabel: value })} />
                        </Field>
                        <Field label="Benchmark value" hint='e.g. "1x"'>
                          <TextInput value={metric.benchmarkValue ?? ''} onChange={(value) => updateMetric(metricIndex, { benchmarkValue: value })} />
                        </Field>
                      </div>
                      <Field
                        label="Series (multi-row chart)"
                        hint='Overrides benchmark mode. Format: "Label:Value|Label:Value". A leading minus (−12%) flips that row to the down-is-good amber style.'
                      >
                        <TextInput value={metric.series ?? ''} onChange={(value) => updateMetric(metricIndex, { series: value })} placeholder="Orders:+35%|Products:+53%|Traffic:+22%|CAC:−12%" />
                      </Field>
                    </>
                  )}
                  <Field label="Chart caption (optional)" hint="Small source note under the tile.">
                    <TextInput value={metric.chartCaption ?? ''} onChange={(value) => updateMetric(metricIndex, { chartCaption: value })} placeholder="Per operating dashboard, 2023-2026" />
                  </Field>
                  {metric.display === 'donut' && (
                    <Field label="Percent (0-100)" hint="Donut sweep angle. Empty = parsed from Value.">
                      <TextInput
                        value={metric.percent !== undefined ? String(metric.percent) : ''}
                        onChange={(value) => {
                          const parsed = Number.parseFloat(value)
                          updateMetric(metricIndex, { percent: Number.isFinite(parsed) ? parsed : undefined })
                        }}
                      />
                    </Field>
                  )}
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
          <div className="md:col-span-2">
            <Field label="Homepage hover gallery" hint="Upload up to 4 rectangular images used in the desktop hover preview. Image 1 also becomes the homepage thumbnail automatically.">
              <BackgroundCarouselUploader
                urls={item.homepageGalleryImages ?? []}
                onChange={updateHomepageGalleryImages}
                folder={`cms/pages/${pageId}/${blockId}/homepage-gallery`}
                onUploadError={onUploadError}
                max={4}
                uploadLabel="Upload gallery"
                emptyLabel="Chua co anh gallery"
                hint="Keo thumbnail de doi thu tu. Anh 1 tu dong lam homepage thumbnail. Toi da 4 anh."
                aspectClassName="aspect-[16/9]"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Homepage hover gallery - mobile (4:3)" hint="Optional. Upload up to 4 images cropped 4:3 so the mobile banner slideshow fills edge-to-edge. Falls back to the 16:9 gallery above if left empty.">
              <BackgroundCarouselUploader
                urls={item.homepageGalleryImagesMobile ?? []}
                onChange={updateHomepageGalleryImagesMobile}
                folder={`cms/pages/${pageId}/${blockId}/homepage-gallery-mobile`}
                onUploadError={onUploadError}
                max={4}
                uploadLabel="Upload gallery mobile"
                emptyLabel="Chua co anh gallery mobile"
                hint="Anh 4:3 rieng cho mobile. Toi da 4 anh, thu tu khop voi gallery 16:9."
                aspectClassName="aspect-[4/3]"
              />
            </Field>
          </div>
          <Field label="Background carousel images" hint="Upload five 4:5 portrait masters at 3072×3840. The site serves responsive 1080-class mobile and Retina desktop variants. Drag thumbnails to reorder.">
            <BackgroundCarouselUploader
              urls={item.backgroundImages ?? []}
              onChange={updateBackgroundImages}
              folder={`cms/pages/${pageId}/${blockId}/background-carousel`}
              onUploadError={onUploadError}
              hint="Five 3072×3840 (4:5) masters. Existing landscape assets use the sharp contain fallback until replaced."
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
  // Single-language site: content lives in the base fields ('vi' accessor = base, no locale overrides).
  const activeLang: BrandLang = 'vi'
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
  const isRedFlagsBlock = pageId === 'homepage' && block.id === 'red-flags'
  const isHomepageHero = pageId === 'homepage' && block.id === 'hero'
  const isHomepageClosing = pageId === 'homepage' && block.id === 'closing'
  const isPackageList = isPackageListBlock(pageId, block.id)
  const isFaqBlock = isHomepageClosing
  const isBasicCards = isBasicCardsBlock(pageId, block.id)
  const isTheOneHero = pageId === 'the-one' && block.id === 'hero'
  const canEditBlockMedia = !isStoryBlock && (isHomepageHero || isHomepageClosing || (pageId === 'about' && block.id === 'hero'))
  const canEditItemMedia = !isStoryBlock && !isPackageList && !isBasicCards && !isFaqBlock && Boolean((block.items ?? []).some((item) => item.icon || item.imageUrl || item.imageAlt))
  const showBlockCtaLabel = isHomepageHero || isTheOneHero || isHomepageClosing
  const showBlockCtaHref = false
  const showBlockHeading = !isPackageList
  const showBlockItems = !isHomepageHero && !isTheOneHero && !(block.id === 'intro' && !block.items?.length)
  const blockHeading = getBlockTextValue(currentBlock, activeLang, 'heading')
  const blockBody = getBlockTextValue(currentBlock, activeLang, 'body')
  const blockCtaLabel = getBlockTextValue(currentBlock, activeLang, 'ctaLabel')
  const blockCtaSubtext = getBlockTextValue(currentBlock, activeLang, 'ctaSubtext')
  const blockPricingNote = getBlockTextValue(currentBlock, activeLang, 'pricingNote')
  const blockDisclaimer = getBlockTextValue(currentBlock, activeLang, 'disclaimer')
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
            {(isHomepageHero || isHomepageClosing) && (
              <Field label={isHomepageClosing ? 'Pre-footer CTA line' : 'CTA subtext'}>
                <TextInput value={blockCtaSubtext} onChange={(value) => updateBlockText({ ctaSubtext: value })} placeholder="Free 30-min call" />
              </Field>
            )}
          </div>

          {isHomepageHero && (
            <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4 md:grid-cols-2">
              <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={block.showCtaSubtext === true}
                  onChange={(event) => updateBlock(pageId, blockId, { showCtaSubtext: event.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Show CTA subtext
              </label>
              <label className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/45 bg-surface px-3 py-2 text-xs font-extrabold text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={block.showStatChips === true}
                  onChange={(event) => updateBlock(pageId, blockId, { showStatChips: event.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Show hero stat chips
              </label>
            </div>
          )}

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
            <div className="grid gap-4 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <Field label="Layout" hint="cards = 3 cot cu, horizontal = 3 hang ngang moi.">
                <div className="inline-flex w-fit rounded-xl border border-outline-variant/45 bg-surface p-1">
                  {(['horizontal', 'cards'] as const).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => updateBlock(pageId, blockId, { layout })}
                      className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-colors ${
                        (block.layout ?? 'horizontal') === layout ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Packages note" hint="Single note under the whole section (merged pricing note + disclaimer, Round 7 A4).">
                <TextArea
                  value={block.packagesNote ?? [blockPricingNote, blockDisclaimer].filter(Boolean).join('\n')}
                  onChange={(value) => updateBlock(pageId, blockId, { packagesNote: value })}
                  minHeight={86}
                />
              </Field>
            </div>
          )}

          {isStoryBlock && (
            <div className="grid gap-4 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <Field label="Swipe hint text" hint='Pill on slide 1 of every story carousel. Default: "Swipe for more records →"'>
                <TextInput value={block.swipeHintText ?? ''} onChange={(value) => updateBlock(pageId, blockId, { swipeHintText: value })} placeholder="Swipe for more records →" />
              </Field>
            </div>
          )}

          {isRedFlagsBlock && (
            <div className="grid gap-4 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Threads opening post (Round 7 A3)</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Post handle">
                  <TextInput value={block.postHandle ?? ''} onChange={(value) => updateBlock(pageId, blockId, { postHandle: value })} placeholder="founders.theone" />
                </Field>
                <Field label="Topic badge">
                  <TextInput value={block.postTopic ?? ''} onChange={(value) => updateBlock(pageId, blockId, { postTopic: value })} placeholder="Agency life" />
                </Field>
              </div>
              <Field label="Post text" hint="The opening post; items below become the replies. The Body field above stays the closing punchline.">
                <TextArea value={block.postText ?? ''} onChange={(value) => updateBlock(pageId, blockId, { postText: value })} minHeight={70} />
              </Field>
            </div>
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
            <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-on-surface-variant">
              <p>Items in this Closing section are rendered as homepage FAQ. Use item title as the question and item body as the answer.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Closing video line 1">
                  <TextInput value={blockClosingLine1} onChange={(value) => updateBlockText({ closingLine1: value })} />
                </Field>
                <Field label="Closing video line 2">
                  <TextInput value={blockClosingLine2} onChange={(value) => updateBlockText({ closingLine2: value })} />
                </Field>
              </div>
            </div>
          )}

          {isPeopleBlock && (
            <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
              <Field label="Auto-slide seconds" hint="Default 5. Dung cho banner The One People.">
                <TextInput value={block.autoSlideSeconds ?? ''} onChange={(value) => updateBlock(pageId, blockId, { autoSlideSeconds: value })} placeholder="5" />
              </Field>
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
                  <TextInput
                    value={block.backgroundImagePosition ?? ''}
                    onChange={(value) => updateBlock(pageId, blockId, { backgroundImagePosition: value })}
                    placeholder="Desktop focal point, e.g. 50% 50%"
                  />
                  <SafeCropPreview
                    url={block.backgroundImageUrl}
                    alt="Desktop hero background preview"
                    aspectClassName="aspect-[16/9]"
                    label="Desktop safe crop"
                    position={block.backgroundImagePosition}
                  />
                </div>
              </Field>
              <Field label="Background image - mobile" hint="Portrait/mobile crop used below 768px.">
                <div className="grid gap-2">
                  <TextInput value={block.backgroundImageMobileUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundImageMobileUrl: value })} placeholder="Mobile background image URL" />
                  <ImageUploadButton
                    folder={`cms/pages/${pageId}/${blockId}/background-mobile`}
                    onUploaded={(url) => updateBlock(pageId, blockId, { backgroundImageMobileUrl: url })}
                    onError={setUploadError}
                    label={block.backgroundImageMobileUrl ? 'Replace mobile background' : 'Upload mobile background'}
                  />
                  <TextInput
                    value={block.backgroundImageMobilePosition ?? ''}
                    onChange={(value) => updateBlock(pageId, blockId, { backgroundImageMobilePosition: value })}
                    placeholder="Mobile focal point, e.g. 50% 40%"
                  />
                  <SafeCropPreview
                    url={block.backgroundImageMobileUrl || block.backgroundImageUrl}
                    alt="Mobile hero background preview"
                    aspectClassName="aspect-[3/4]"
                    label="Mobile safe crop"
                    position={block.backgroundImageMobilePosition || block.backgroundImagePosition}
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
              {(isHomepageHero || isHomepageClosing) && (
                <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-primary">{isHomepageClosing ? 'Closing cinematic video' : 'Hero background video'}</p>
                  <p className="text-xs font-semibold text-on-surface-variant">
                    {isHomepageClosing
                      ? 'The closing band uses adaptive, muted loop video. Upload a 3840×2160 desktop master and a 1440px-wide mobile master; the site generates lighter responsive delivery URLs.'
                      : 'The hero uses adaptive, muted loop video. Upload a 3840×2160 desktop master and a 1440px-wide mobile master; the site generates lighter responsive delivery URLs.'}
                  </p>
                  <Field label="Video URL - desktop MP4">
                    <div className="grid gap-2">
                      <TextInput value={block.backgroundVideoUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoUrl: value })} placeholder="https://res.cloudinary.com/.../video.mp4" />
                      <VideoUploadButton
                        folder={`cms/pages/${pageId}/${blockId}/video`}
                        onUploaded={(url) => updateBlock(pageId, blockId, { backgroundVideoUrl: url })}
                        onError={setUploadError}
                        label={block.backgroundVideoUrl ? 'Replace video' : 'Upload video'}
                      />
                    </div>
                  </Field>
                  <Field label="Video URL - desktop WebM (optional, lighter)">
                    <TextInput value={block.backgroundVideoWebmUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoWebmUrl: value })} placeholder="https://res.cloudinary.com/.../video.webm" />
                  </Field>
                  <Field label="Video URL - mobile MP4">
                    <div className="grid gap-2">
                      <TextInput value={block.backgroundVideoMobileUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoMobileUrl: value })} placeholder="https://res.cloudinary.com/.../mobile.mp4" />
                      <VideoUploadButton
                        folder={`cms/pages/${pageId}/${blockId}/video-mobile`}
                        onUploaded={(url) => updateBlock(pageId, blockId, { backgroundVideoMobileUrl: url })}
                        onError={setUploadError}
                        label={block.backgroundVideoMobileUrl ? 'Replace mobile video' : 'Upload mobile video'}
                      />
                    </div>
                  </Field>
                  <Field label="Video URL - mobile WebM (optional)">
                    <TextInput value={block.backgroundVideoMobileWebmUrl ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoMobileWebmUrl: value })} placeholder="https://res.cloudinary.com/.../mobile.webm" />
                  </Field>
                  <Field label="Video poster (image shown before/instead of video)">
                    <div className="grid gap-2">
                      <TextInput value={block.backgroundVideoPoster ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoPoster: value })} placeholder="https://res.cloudinary.com/.../poster.webp" />
                      <ImageUploadButton
                        folder={`cms/pages/${pageId}/${blockId}/video`}
                        onUploaded={(url) => updateBlock(pageId, blockId, { backgroundVideoPoster: url })}
                        onError={setUploadError}
                        label={block.backgroundVideoPoster ? 'Replace poster' : 'Upload poster'}
                      />
                    </div>
                  </Field>
                  <Field label="Video poster - mobile" hint="Portrait-safe poster used below 768px.">
                    <div className="grid gap-2">
                      <TextInput value={block.backgroundVideoMobilePoster ?? ''} onChange={(value) => updateBlock(pageId, blockId, { backgroundVideoMobilePoster: value })} placeholder="https://res.cloudinary.com/.../poster-mobile.webp" />
                      <ImageUploadButton
                        folder={`cms/pages/${pageId}/${blockId}/video-mobile`}
                        onUploaded={(url) => updateBlock(pageId, blockId, { backgroundVideoMobilePoster: url })}
                        onError={setUploadError}
                        label={block.backgroundVideoMobilePoster ? 'Replace mobile poster' : 'Upload mobile poster'}
                      />
                    </div>
                  </Field>
                </div>
              )}
              {block.id === 'hero' && (
                <div className="grid gap-3 rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  {isHomepageHero && (
                    <Field label="Hero text alignment" hint="Locked to the approved responsive composition.">
                      <div className="inline-flex w-fit rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-extrabold text-primary">
                        Center — mobile and desktop
                      </div>
                    </Field>
                  )}
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
                    ) : isRedFlagsBlock ? (
                      <RedFlagItemEditor pageId={pageId} blockId={blockId} index={index} item={item} activeLang={activeLang} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
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
