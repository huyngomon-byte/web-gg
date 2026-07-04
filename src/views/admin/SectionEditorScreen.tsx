'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, ImageIcon, Plus, Save, Trash2 } from 'lucide-react'
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
import type { CmsBlockItem } from '../../cms/types'

type UpdateBlockItem = (pageId: string, blockId: string, itemIndex: number, patch: Partial<CmsBlockItem>) => void

const storyMetricSlots = Array.from({ length: 10 }, (_, index) => index)

function listToText(items: string[] | undefined) {
  return (items ?? []).join('\n')
}

function textToDraftList(value: string) {
  return value.split('\n')
}

function getMetric(item: CmsBlockItem, index: number) {
  return item.keyMetrics?.[index] ?? { value: '', label: '' }
}

function StoryItemEditor({
  pageId,
  blockId,
  index,
  item,
  updateBlockItem,
  onUploadError,
}: {
  pageId: string
  blockId: string
  index: number
  item: CmsBlockItem
  updateBlockItem: UpdateBlockItem
  onUploadError: (message: string) => void
}) {
  function updateMetric(metricIndex: number, patch: { value?: string; label?: string }) {
    const nextMetrics = [...(item.keyMetrics ?? [])]
    while (nextMetrics.length <= metricIndex) nextMetrics.push({ value: '', label: '' })
    nextMetrics[metricIndex] = { ...nextMetrics[metricIndex], ...patch }
    updateBlockItem(pageId, blockId, index, { keyMetrics: nextMetrics })
  }

  function updateSocialLink(field: 'instagram' | 'facebook' | 'tiktok', value: string) {
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

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brand name">
          <TextInput value={item.title} onChange={(value) => updateBlockItem(pageId, blockId, index, { title: value })} />
        </Field>
        <Field label="Story ID" hint="Giữ ID này để public page map đúng brand.">
          <TextInput value={item.href ?? item.id ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} />
        </Field>
        <Field label="Category">
          <TextInput value={item.label ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { label: value })} />
        </Field>
        <Field label="Period">
          <TextInput value={item.period ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { period: value })} />
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
        <TextArea value={item.body ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { body: value })} minHeight={78} />
      </Field>

      <Field label="Short description">
        <TextArea
          value={item.shortDescription ?? ''}
          onChange={(value) => updateBlockItem(pageId, blockId, index, { shortDescription: value })}
          minHeight={110}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Instagram caption">
          <TextArea
            value={item.caption ?? ''}
            onChange={(value) => updateBlockItem(pageId, blockId, index, { caption: value })}
            minHeight={90}
          />
        </Field>
        <Field label="Likes seed">
          <TextInput value={item.likesSeed ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { likesSeed: value })} placeholder="2486" />
        </Field>
      </div>

      <Field label="Services" hint="Mỗi dòng là một service tag trên story zone.">
        <TextArea
          value={listToText(item.services)}
          onChange={(value) => updateBlockItem(pageId, blockId, index, { services: textToDraftList(value) })}
          minHeight={96}
        />
      </Field>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Story metrics</p>
          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant/75">
            Chinh cac metric hien thi nhu app icon trong man hinh iPhone cua Instagram post.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {storyMetricSlots.map((metricIndex, displayIndex) => {
            const metric = getMetric(item, metricIndex)
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
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Field label="CTA text">
        <TextInput value={item.ctaText ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { ctaText: value })} />
      </Field>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Homepage / media</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Preview video URL" hint="MP4/WebM/OGG Cloudinary URL. Homepage hover will autoplay muted and loop. YouTube/Vimeo still works, but may show platform branding.">
            <div className="grid gap-2">
              <TextInput value={item.videoUrl ?? item.embedUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { videoUrl: value })} />
              <VideoUploadButton
                folder={`cms/pages/${pageId}/${blockId}/previews`}
                onUploaded={(url) => updateBlockItem(pageId, blockId, index, { videoUrl: url })}
                onError={onUploadError}
              />
            </div>
          </Field>
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
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Social links</p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Instagram URL">
            <TextInput value={item.socialLinks?.instagram ?? ''} onChange={(value) => updateSocialLink('instagram', value)} />
          </Field>
          <Field label="Facebook URL">
            <TextInput value={item.socialLinks?.facebook ?? ''} onChange={(value) => updateSocialLink('facebook', value)} />
          </Field>
          <Field label="TikTok URL">
            <TextInput value={item.socialLinks?.tiktok ?? ''} onChange={(value) => updateSocialLink('tiktok', value)} />
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

  const prevBlock = blockIndex > 0 ? page.blocks[blockIndex - 1] : undefined
  const nextBlock = blockIndex < page.blocks.length - 1 ? page.blocks[blockIndex + 1] : undefined
  const isStoryBlock = pageId === 'the-one' && block.id === 'stories'
  const canEditBlockMedia = !isStoryBlock && Boolean(block.icon || block.imageUrl || block.imageAlt || ['hero', 'intro'].includes(block.id))
  const canEditItemMedia = !isStoryBlock && Boolean((block.items ?? []).some((item) => item.icon || item.imageUrl || item.imageAlt))

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
          { label: block.heading || block.id },
        ]}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/45 bg-surface/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Section {blockIndex + 1}/{page.blocks.length}</p>
          <h1 className="text-2xl font-extrabold text-on-surface">{block.heading || block.id}</h1>
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
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Block ID" hint="Giữ đúng ID để trang public render đúng vị trí.">
              <TextInput value={idDraft} onChange={setIdDraft} placeholder={block.id} />
              {idDraft !== blockId && (
                <button onClick={commitId} className="mt-2 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-extrabold text-primary">
                  Áp dụng ID mới
                </button>
              )}
            </Field>
            {!isStoryBlock && (
              <Field label="CTA link">
                <TextInput value={block.ctaHref ?? ''} onChange={(value) => updateBlock(pageId, blockId, { ctaHref: value })} placeholder="/contact" />
              </Field>
            )}
          </div>

          <Field label="Heading">
            <TextInput value={block.heading} onChange={(value) => updateBlock(pageId, blockId, { heading: value })} />
          </Field>
          <Field label="Body / mô tả">
            <TextArea value={block.body} onChange={(value) => updateBlock(pageId, blockId, { body: value })} minHeight={130} />
          </Field>

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
              <Field label="CTA label">
                <TextInput value={block.ctaLabel ?? ''} onChange={(value) => updateBlock(pageId, blockId, { ctaLabel: value })} />
              </Field>
            </div>
            <div className="space-y-3">
              <MediaPreview url={block.imageUrl} alt={block.imageAlt} />
              {uploadError && <p className="text-xs font-bold text-red-700">{uploadError}</p>}
              {!block.imageUrl && (
                <div className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CmsIcon name={block.icon} size={20} />
                  </div>
                  <p className="text-sm font-extrabold text-on-surface">{block.heading || 'Preview icon + text'}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-on-surface-variant">{block.body}</p>
                </div>
              )}
            </div>
          </div>
          )}

          <section className="rounded-xl border border-outline-variant/45 bg-surface-container-low p-4">
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
              {(block.items ?? []).map((item, index) => (
                <details key={`${blockId}-item-${index}`} className="group rounded-xl border border-outline-variant/45 bg-surface">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <span className="flex min-w-0 items-center gap-3">
                      {!isStoryBlock && (item.imageUrl || item.icon) && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-6 w-6 object-contain" />
                          ) : (
                            <CmsIcon name={item.icon} size={18} />
                          )}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold">{item.title || `Item ${index + 1}`}</span>
                        <span className="block truncate text-xs text-on-surface-variant">{item.href || item.label || item.body || 'Icon + text item'}</span>
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
                      <StoryItemEditor pageId={pageId} blockId={blockId} index={index} item={item} updateBlockItem={updateBlockItem} onUploadError={setUploadError} />
                    ) : (
                    <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <TextInput value={item.title} onChange={(value) => updateBlockItem(pageId, blockId, index, { title: value })} />
                      </Field>
                      <Field label="Href">
                        <TextInput value={item.href ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { href: value })} />
                      </Field>
                      <Field label="Label phụ">
                        <TextInput value={item.label ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { label: value })} />
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
                          <TextArea value={item.body ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { body: value })} minHeight={100} />
                        </Field>
                        {canEditItemMedia && (
                          <>
                            <Field label="Video embed URL" hint="YouTube/Vimeo/embed link. Khi public hover card sẽ autoplay muted.">
                              <div className="grid gap-2">
                                <TextInput value={item.videoUrl ?? item.embedUrl ?? ''} onChange={(value) => updateBlockItem(pageId, blockId, index, { videoUrl: value })} />
                                <VideoUploadButton
                                  folder={`cms/pages/${pageId}/${blockId}/items/previews`}
                                  onUploaded={(url) => updateBlockItem(pageId, blockId, index, { videoUrl: url })}
                                  onError={setUploadError}
                                />
                              </div>
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
                          </>
                        )}
                      </div>
                      {canEditItemMedia && <MediaPreview url={item.imageUrl} alt={item.imageAlt} />}
                    </div>
                    </>
                    )}
                  </div>
                </details>
              ))}
              {(block.items ?? []).length === 0 && (
                <p className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <ImageIcon size={13} /> Chưa có item nào trong section này.
                </p>
              )}
            </div>
          </section>
        </div>
      </Card>
    </div>
  )
}
