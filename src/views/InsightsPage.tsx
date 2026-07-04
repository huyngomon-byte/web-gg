'use client'

import { ArrowRight, BookOpen, CalendarDays, Sparkles } from 'lucide-react'
import {
  insightArticleSchemas,
  insightBreadcrumbSchemas,
  insightInternalLinks,
  insightPosts,
  insightPostsBySlug,
  insightsIndexMeta,
  insightsIndexSchema,
  organizationSchema,
  websiteSchema,
  type InsightPost,
  type InsightSlug,
} from '../brandContent'
import { BrandLayout } from '../components/BrandLayout'
import { openBookingModal } from '../components/openBookingModal'
import { SeoHead } from '../components/SeoHead'
import type { ServerInsightPost } from '../cms/serverRepository'
import type { CmsSiteSettings } from '../cms/types'

type RenderableInsightPost = InsightPost | ServerInsightPost

function ArticleCard({ post, featured = false }: { post: RenderableInsightPost; featured?: boolean }) {
  return (
    <a
      href={post.path}
      className={[
        'group block overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl',
        featured ? 'lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch' : '',
      ].join(' ')}
    >
      <div className={featured ? 'min-h-[280px]' : 'aspect-[1200/630]'}>
        <img
          src={post.coverImage}
          width={1200}
          height={630}
          alt={post.coverAlt}
          className="h-full w-full object-cover"
          loading={featured ? 'eager' : 'lazy'}
        />
      </div>
      <div className={featured ? 'p-6 md:p-8 lg:p-10' : 'p-5'}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary">
          <Sparkles size={13} />
          {post.category}
        </div>
        <h2 className={featured ? 'text-3xl font-extrabold leading-tight text-on-surface md:text-4xl' : 'text-xl font-extrabold leading-snug text-on-surface'}>
          {post.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-base">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary">
          Read insight <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  )
}

export function InsightsIndexPage({ posts = insightPosts, siteSettings }: { posts?: RenderableInsightPost[]; siteSettings?: CmsSiteSettings | null }) {
  const [featuredPost, ...otherPosts] = posts

  return (
    <BrandLayout lang="vi" siteSettings={siteSettings}>
      <SeoHead meta={insightsIndexMeta} schema={[organizationSchema, websiteSchema, insightsIndexSchema]} lang="vi" />

      <article>
        <section className="relative overflow-hidden px-5 py-14 md:py-20 lg:px-10">
          <div className="absolute inset-0 tech-grid opacity-80 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-primary">
                <BookOpen size={15} />
                Insights
              </div>
              <h1 className="text-[40px] font-extrabold leading-[1.06] text-on-surface sm:text-[56px] md:text-[72px]">
                Insights from The One - GG99
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                Ideas on brand, website, CRM, automation and growth systems for startups and SMEs.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <ArticleCard post={featuredPost} featured />
          </div>
        </section>

        <section className="px-5 pb-16 md:pb-24 lg:px-10">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
            {otherPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 md:pb-24 lg:px-10">
          <div className="mx-auto max-w-6xl rounded-2xl bg-primary px-6 py-9 text-center text-on-primary shadow-xl md:px-10">
            <h2 className="text-2xl font-extrabold md:text-4xl">Explore The One Packages</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/packages"
                className="inline-flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm font-extrabold text-primary transition-transform hover:-translate-y-0.5"
              >
                Explore The One Packages <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={openBookingModal}
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/12"
              >
                Call Your Shot <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </article>
    </BrandLayout>
  )
}

function getRelatedRenderablePosts(post: RenderableInsightPost, posts: RenderableInsightPost[]) {
  const relatedSlugs = 'related' in post ? post.related : undefined
  const related = relatedSlugs
    ?.map((slug) => posts.find((item) => item.slug === slug))
    .filter((item): item is RenderableInsightPost => Boolean(item))

  if (related?.length) return related.slice(0, 3)
  return posts.filter((item) => item.slug !== post.slug).slice(0, 3)
}

export function InsightArticlePage({
  post: serverPost,
  posts = insightPosts,
  siteSettings,
}: {
  post?: RenderableInsightPost
  posts?: RenderableInsightPost[]
  siteSettings?: CmsSiteSettings | null
}) {
  const browserSlug =
    typeof window === 'undefined' ? undefined : window.location.pathname.split('/').filter(Boolean).pop()
  const post = serverPost ?? (browserSlug ? insightPostsBySlug[browserSlug as InsightSlug] : undefined)

  if (!post) {
    return (
      <BrandLayout lang="vi" siteSettings={siteSettings}>
        <article className="px-5 py-20 lg:px-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-outline-variant/40 bg-surface p-6">
            <h1 className="text-2xl font-extrabold text-on-surface">Insight not found</h1>
            <a href="/insights" className="mt-4 inline-flex font-bold text-primary">
              Back to insights
            </a>
          </div>
        </article>
      </BrandLayout>
    )
  }

  const relatedPosts = getRelatedRenderablePosts(post, posts)
  const defaultInsightSchemas =
    post.slug in insightArticleSchemas
      ? [insightArticleSchemas[post.slug as InsightSlug], insightBreadcrumbSchemas[post.slug as InsightSlug]]
      : []

  return (
    <BrandLayout lang="vi" siteSettings={siteSettings}>
      <SeoHead
        meta={post.meta}
        schema={[organizationSchema, websiteSchema, ...defaultInsightSchemas]}
        lang="vi"
      />

      <article>
        <section className="relative overflow-hidden px-5 py-12 md:py-16 lg:px-10">
          <div className="absolute inset-0 tech-grid opacity-80 pointer-events-none" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
              <a href="/" className="font-bold text-primary hover:underline">The One - GG99</a>
              <span aria-hidden="true">/</span>
              <a href="/insights" className="font-bold text-primary hover:underline">Insights</a>
              <span aria-hidden="true">/</span>
              <span>{post.title}</span>
            </nav>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-primary">
              <Sparkles size={15} />
              {post.category}
            </div>
            <h1 className="text-[36px] font-extrabold leading-[1.08] text-on-surface sm:text-[50px] md:text-[64px]">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <time dateTime={post.datePublished}>{post.datePublished}</time>
              </span>
              <span>Author: GG99</span>
              <span>Modified: <time dateTime={post.dateModified}>{post.dateModified}</time></span>
            </div>
          </div>
        </section>

        <section className="px-5 pb-12 lg:px-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface shadow-xl">
            <img src={post.coverImage} width={1200} height={630} alt={post.coverAlt} className="aspect-[1200/630] w-full object-cover" />
          </div>
        </section>

        <section className="px-5 pb-16 lg:px-10">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-7">
              {post.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-outline-variant/40 bg-surface/80 p-6 shadow-sm md:p-8">
                  <h2 className="text-2xl font-extrabold text-on-surface md:text-3xl">{section.heading}</h2>
                  <div className="mt-4 max-w-[70ch] space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-8 text-on-surface-variant">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}

              <section className="rounded-2xl bg-primary p-6 text-on-primary shadow-xl md:p-8">
                <h2 className="text-2xl font-extrabold">Next step</h2>
                <p className="mt-3 text-sm leading-relaxed text-on-primary/85">
                  Continue from this article into The One system to choose the right implementation direction for your business.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={post.ctaHref} className="inline-flex items-center gap-2 rounded-xl bg-surface px-5 py-3 text-sm font-extrabold text-primary">
                    {post.ctaLabel} <ArrowRight size={16} />
                  </a>
                  <button type="button" onClick={openBookingModal} className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/12">
                    Call Your Shot <ArrowRight size={16} />
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-outline-variant/40 bg-surface/85 p-5 shadow-sm">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Read more</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {insightInternalLinks.map((item) => (
                    <a key={item.href} href={item.href} className="rounded-full border border-outline-variant/35 px-3 py-2 text-xs font-extrabold text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-outline-variant/40 bg-surface/85 p-5 shadow-sm">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Related posts</h2>
                <div className="mt-4 space-y-3">
                  {relatedPosts.map((item) => (
                    <a key={item.slug} href={item.path} className="block rounded-xl bg-surface-container-low p-4 transition-colors hover:bg-primary/10">
                      <h3 className="text-sm font-extrabold leading-snug text-on-surface">{item.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{item.category}</p>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </article>
    </BrandLayout>
  )
}
