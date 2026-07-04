import {
  aboutMetaByLang,
  compactPackageByLang,
  compactTheOneByLang,
  contactMeta,
  homeMetaByLang,
  homeWebPageSchema,
  organizationSchema,
  packagesMetaByLang,
  serviceSchemas,
  servicesMeta,
  type BrandLang,
  type PackageKey,
  websiteSchema,
} from '../brandContent'
import AboutBrandPage from '../views/AboutBrandPage'
import BrandHomePage from '../views/BrandHomePage'
import { ContactPage, PackagesPage, ServicesPage } from '../views/EntityUtilityPages'
import { InsightArticlePage, InsightsIndexPage } from '../views/InsightsPage'
import { PackagePage } from '../views/PackagePage'
import TheOnePage from '../views/TheOnePage'
import { getServerCmsInsight, getServerCmsPage, getServerCmsSiteSettings, listServerCmsInsights } from '../cms/serverRepository'
import { buildInsightArticleSchema, buildInsightBreadcrumbSchema, buildInsightsIndexSchema } from './insightSchemas'
import { JsonLd } from './seo'

export async function HomeView({ lang, pageId }: { lang: BrandLang; pageId: string }) {
  const [page, theOnePage, siteSettings] = await Promise.all([getServerCmsPage(pageId), getServerCmsPage('the-one'), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema, homeWebPageSchema]} />
      <BrandHomePage lang={lang} cmsPage={page} theOnePage={theOnePage} siteSettings={siteSettings} />
    </>
  )
}

export async function TheOneView({ lang, pageId }: { lang: BrandLang; pageId: string }) {
  const [page, siteSettings] = await Promise.all([getServerCmsPage(pageId), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema]} />
      <TheOnePage lang={lang} cmsPage={page} siteSettings={siteSettings} />
    </>
  )
}

export async function PackagesView({ lang, pageId }: { lang: BrandLang; pageId: string }) {
  const [page, siteSettings] = await Promise.all([getServerCmsPage(pageId), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema]} />
      <PackagesPage lang={lang} cmsPage={page} siteSettings={siteSettings} />
    </>
  )
}

export async function PackageDetailView({
  lang,
  packageKey,
  pageId,
}: {
  lang: BrandLang
  packageKey: PackageKey
  pageId: string
}) {
  const [page, siteSettings] = await Promise.all([getServerCmsPage(pageId), getServerCmsSiteSettings()])
  const serviceByPackage: Record<PackageKey, unknown> = {
    consultant: serviceSchemas[0],
    agency: serviceSchemas[1],
    partner: serviceSchemas[2],
  }

  return (
    <>
      <JsonLd items={[organizationSchema, serviceByPackage[packageKey]]} />
      <PackagePage lang={lang} packageKey={packageKey} cmsPage={page} siteSettings={siteSettings} />
    </>
  )
}

export async function AboutView({ lang, pageId }: { lang: BrandLang; pageId: string }) {
  const [page, homePage, siteSettings] = await Promise.all([getServerCmsPage(pageId), getServerCmsPage('homepage'), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema]} />
      <AboutBrandPage lang={lang} cmsPage={page} homePage={homePage} siteSettings={siteSettings} />
    </>
  )
}

export async function ServicesView() {
  const [page, siteSettings] = await Promise.all([getServerCmsPage('services'), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema]} />
      <ServicesPage cmsPage={page} siteSettings={siteSettings} />
    </>
  )
}

export async function ContactView() {
  const [page, siteSettings] = await Promise.all([getServerCmsPage('contact'), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema]} />
      <ContactPage cmsPage={page} siteSettings={siteSettings} />
    </>
  )
}

export async function InsightsIndexView() {
  const [posts, siteSettings] = await Promise.all([listServerCmsInsights(), getServerCmsSiteSettings()])
  return (
    <>
      <JsonLd items={[organizationSchema, websiteSchema, buildInsightsIndexSchema(posts)]} />
      <InsightsIndexPage posts={posts} siteSettings={siteSettings} />
    </>
  )
}

export async function InsightArticleView({ slug }: { slug: string }) {
  const [post, posts, siteSettings] = await Promise.all([getServerCmsInsight(slug), listServerCmsInsights(), getServerCmsSiteSettings()])
  if (!post) return null

  return (
    <>
      <JsonLd
        items={[
          organizationSchema,
          websiteSchema,
          buildInsightArticleSchema(post),
          buildInsightBreadcrumbSchema(post),
        ]}
      />
      <InsightArticlePage post={post} posts={posts} siteSettings={siteSettings} />
    </>
  )
}

export const fallbackMeta = {
  home: homeMetaByLang,
  theOne: compactTheOneByLang,
  packages: packagesMetaByLang,
  packageDetail: compactPackageByLang,
  about: aboutMetaByLang,
  services: servicesMeta,
  contact: contactMeta,
}
