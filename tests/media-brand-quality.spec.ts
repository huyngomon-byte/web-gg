import { expect, test } from '@playwright/test'
import { storyFromCmsItem } from '../src/data/caseStudyStories'
import { normalizePhinoiText, PHINOI_DISPLAY_NAME } from '../src/lib/brandNames'
import {
  CLOUDINARY_IMAGE_MAX_WIDTH,
  CLOUDINARY_STORY_MEDIA_WIDTHS,
  cldResponsiveImage,
  cldResponsiveSrcSet,
  cldSrcSet,
  cldStoryMediaSrcSet,
  cldStoryMediaWidth,
  cldWidth,
} from '../src/lib/cloudinaryImage'
import { getHomepageVideoDeliveryWidth, retargetCloudinaryVideoWidth } from '../src/lib/cloudinaryVideo'
import { getImageRequirements, getVideoRequirements } from '../src/cms/mediaRequirements'

const rawImage = 'https://res.cloudinary.com/demo/image/upload/v123/cms/story/photo.jpg'

test('canonicalizes every known PHINƠI display-name encoding without changing its identifiers', () => {
  expect(normalizePhinoiText('PHINOI')).toBe(PHINOI_DISPLAY_NAME)
  expect(normalizePhinoiText('Phinoi')).toBe(PHINOI_DISPLAY_NAME)
  expect(normalizePhinoiText('Phi Noi')).toBe(PHINOI_DISPLAY_NAME)
  expect(normalizePhinoiText('PHINO\u031bI')).toBe(PHINOI_DISPLAY_NAME)
  expect(normalizePhinoiText('PHINÆ\u00a0I')).toBe(PHINOI_DISPLAY_NAME)
  expect(normalizePhinoiText('Visit phinoi.vn or use the phinoi story id.')).toBe(
    'Visit phinoi.vn or use the phinoi story id.',
  )
})

test('guards the rendered PHINƠI story against stale CMS display names', () => {
  const story = storyFromCmsItem({
    id: 'phinoi',
    title: 'PHINOI',
    displayName: 'Phi Noi',
    body: 'PHINOI growth story',
  })

  expect(story).toMatchObject({
    id: 'phinoi',
    accountName: 'phinoi.vn',
    brandName: PHINOI_DISPLAY_NAME,
    displayName: PHINOI_DISPLAY_NAME,
    headline: `${PHINOI_DISPLAY_NAME} growth story`,
  })

  expect(storyFromCmsItem({ title: 'PHINÆ\u00a0I' })).toMatchObject({
    id: 'phinoi',
    brandName: PHINOI_DISPLAY_NAME,
  })
})

test('builds format- and quality-aware Cloudinary delivery URLs with a hard 4K ceiling', () => {
  expect(cldWidth(rawImage, 1080)).toContain('/upload/f_auto,q_auto:good,c_limit,w_1080/')
  expect(cldWidth(rawImage, 9000, 'best')).toContain(`/upload/c_limit,w_${CLOUDINARY_IMAGE_MAX_WIDTH}/e_sharpen:40/f_auto,q_auto:best/`)
  expect(cldWidth('/local/photo.jpg', 1080)).toBe('/local/photo.jpg')
})

test('keeps mobile candidates at 1080 and exposes 4K only to desktop layouts', () => {
  const mobile = cldResponsiveSrcSet(rawImage, 'mobile') ?? ''
  const desktop = cldResponsiveSrcSet(rawImage, 'desktop') ?? ''

  expect(mobile).toContain(' 1080w')
  expect(mobile).not.toContain(' 1440w')
  expect(mobile).not.toContain(' 3840w')
  expect(desktop).toContain(' 1080w')
  expect(desktop).toContain(' 3840w')
})

test('serves story media at the card pixel budget with sharp, efficient delivery', () => {
  const storySrcSet = cldStoryMediaSrcSet(rawImage) ?? ''

  expect(cldStoryMediaWidth(rawImage, 1720)).toContain('/upload/c_limit,w_1720/e_sharpen:30/f_auto,q_auto:good/')
  expect(storySrcSet).toContain(' 1080w')
  expect(storySrcSet).toContain(' 1720w')
  expect(storySrcSet).toContain(` ${CLOUDINARY_STORY_MEDIA_WIDTHS.at(-1)}w`)
  expect(storySrcSet).not.toContain(' 3840w')
  expect(cldStoryMediaWidth('/local/story.jpg', 1720)).toBe('/local/story.jpg')
})

test('deduplicates width candidates and returns reusable responsive image props', () => {
  const srcSet = cldSrcSet(rawImage, [1920, 1080, 1080, -1, 6000]) ?? ''
  expect(srcSet.match(/ 1080w/g)).toHaveLength(1)
  expect(srcSet.match(/ 3840w/g)).toHaveLength(1)
  expect(srcSet.indexOf(' 1080w')).toBeLessThan(srcSet.indexOf(' 1920w'))

  expect(
    cldResponsiveImage(rawImage, {
      profile: 'full',
      sizes: '(min-width: 1280px) 1152px, 100vw',
      fallbackWidth: 1440,
    }),
  ).toMatchObject({
    sizes: '(min-width: 1280px) 1152px, 100vw',
    src: expect.stringContaining('w_1440'),
    srcSet: expect.stringContaining(' 3840w'),
  })
})

test('selects the approved 1440 mobile, 2560 tablet and 4K desktop video tiers', () => {
  expect(getHomepageVideoDeliveryWidth(390, 3, true)).toBe(1440)
  expect(getHomepageVideoDeliveryWidth(768, 2, false)).toBe(2560)
  expect(getHomepageVideoDeliveryWidth(1023, 1, false)).toBe(2560)
  expect(getHomepageVideoDeliveryWidth(1024, 1, false)).toBe(3840)
  expect(getHomepageVideoDeliveryWidth(1440, 1, false)).toBe(3840)
  expect(getHomepageVideoDeliveryWidth(1440, 2, false)).toBe(3840)
  expect(getHomepageVideoDeliveryWidth(1920, 2, false)).toBe(3840)
  const transformed = retargetCloudinaryVideoWidth(
    'https://res.cloudinary.com/demo/video/upload/c_limit,w_3840,q_90,e_sharpen:60,vc_auto/hero.mp4',
    2560,
  ) ?? ''
  expect(transformed).toContain('c_limit,w_2560,q_90,e_sharpen:60,vc_auto')
  expect(retargetCloudinaryVideoWidth('/closing/closing-portal-1920.webm', 3840)).toBe('/closing/closing-portal-1920.webm')
})

test('shares the same media upload requirements between browser and server validation', () => {
  expect(getImageRequirements('cms/pages/the-one/stories/background-carousel')).toMatchObject({
    minWidth: 3072,
    minHeight: 3840,
  })
  expect(getImageRequirements('cms/pages/the-one/stories/homepage-banner-desktop')).toMatchObject({ minWidth: 2560, minHeight: 1440 })
  expect(getImageRequirements('cms/pages/the-one/stories/homepage-banner-mobile')).toMatchObject({ minWidth: 1080 })
  expect(getVideoRequirements('cms/pages/homepage/hero/video')).toMatchObject({ minWidth: 3840, minHeight: 2160 })
  expect(getVideoRequirements('cms/pages/homepage/hero/video-mobile')).toMatchObject({ minWidth: 1440 })
})
