'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertCircle,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useAdminData } from './AdminDataContext'
import { pageGroups } from '../cms/adminNav'
import { getMissingFirebaseEnv } from '../cms/firebaseClient'
import { Field, TextInput } from './ui'

function EnvMissingPanel() {
  const missing = getMissingFirebaseEnv()
  return (
    <div className="min-h-screen bg-surface px-5 py-10 text-on-surface">
      <div className="mx-auto max-w-3xl rounded-2xl border border-outline-variant/50 bg-surface-container-low p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <AlertCircle className="text-primary" size={26} />
          <div>
            <h1 className="text-2xl font-extrabold">Firebase CMS chưa được cấu hình</h1>
            <p className="text-sm text-on-surface-variant">Thêm các biến môi trường dưới đây rồi restart dev server.</p>
          </div>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-primary">Env cần thêm</h2>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
            {missing.map((key) => `${key}=`).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  )
}

function LoginScreen() {
  const {
    canUseAdmin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    signingIn,
    handleEmailSignIn,
    handleGoogleSignIn,
    error,
  } = useAdminData()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface to-surface-container-low px-5 py-10 text-on-surface">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant/45 bg-surface/95 p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">The One · GG99</p>
          <h1 className="mt-1 text-2xl font-extrabold">Đăng nhập CMS</h1>
        </div>

        {!canUseAdmin && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs font-semibold text-on-surface-variant">
            Thiếu <strong>VITE_ADMIN_EMAILS</strong>. Thêm email admin, ví dụ: <code>VITE_ADMIN_EMAILS=you@gg99.vn</code>.
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <Field label="Email admin">
            <TextInput value={loginEmail} onChange={setLoginEmail} type="email" placeholder="you@gg99.vn" required />
          </Field>
          <Field label="Mật khẩu">
            <TextInput value={loginPassword} onChange={setLoginPassword} type="password" placeholder="••••••••" required />
          </Field>
          <button
            type="submit"
            disabled={signingIn}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound size={17} /> {signingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant text-sm font-bold text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck size={16} /> Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  )
}

function NoAccessScreen() {
  const { user, handleSignOut } = useAdminData()
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 text-center text-on-surface">
      <div className="max-w-sm">
        <AlertCircle className="mx-auto mb-3 text-primary" size={28} />
        <h1 className="text-xl font-extrabold">Không có quyền admin</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Email <strong>{user?.email}</strong> chưa nằm trong danh sách admin.
        </p>
        <button onClick={handleSignOut} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  )
}

function NavLink({ href, active, children, indent = false }: { href: string; active: boolean; children: ReactNode; indent?: boolean }) {
  return (
    <Link
      href={href}
      className={`block truncate rounded-lg px-3 py-2 text-sm font-bold transition-colors ${indent ? 'ml-3 text-xs' : ''} ${
        active ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      {children}
    </Link>
  )
}

function useActivePageId(pathname: string) {
  const match = pathname.match(/^\/admin\/pages\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function useActiveInsightSlug(pathname: string) {
  const match = pathname.match(/^\/admin\/insights\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? ''
  const { pages, insights } = useAdminData()
  const activePageId = useActivePageId(pathname)
  const activeInsightSlug = useActiveInsightSlug(pathname)
  const activePage = useMemo(() => pages.find((page) => page.id === activePageId), [pages, activePageId])
  const activeInsight = useMemo(() => insights.find((post) => post.slug === activeInsightSlug), [insights, activeInsightSlug])

  return (
    <aside
      className={`${open ? 'flex' : 'hidden'} w-full shrink-0 flex-col gap-5 overflow-y-auto border-outline-variant/45 bg-surface p-4 lg:flex lg:h-screen lg:w-72 lg:border-r lg:bg-surface/90`}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a')) onClose()
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href="/admin" className="flex items-center gap-2.5 px-1">
          <img src="/logo-gg.png" alt="GG99" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-sm font-extrabold leading-tight text-on-surface">GG99 CMS</p>
            <p className="text-[11px] font-semibold leading-tight text-on-surface-variant">Content admin</p>
          </div>
        </Link>
        <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant lg:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-1">
        <NavLink href="/admin" active={pathname === '/admin'}>
          <span className="flex items-center gap-2">
            <LayoutDashboard size={15} /> Dashboard
          </span>
        </NavLink>
        <NavLink href="/admin/settings" active={pathname === '/admin/settings'}>
          <span className="flex items-center gap-2">
            <Settings2 size={15} /> Header / Footer
          </span>
        </NavLink>
      </nav>

      <div>
        <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Pages</p>
        <div className="space-y-3">
          {pageGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">{group.label}</p>
              <div className="space-y-0.5">
                {group.pageIds.map((pageId) => {
                  const page = pages.find((item) => item.id === pageId)
                  const isActive = activePageId === pageId
                  return (
                    <div key={pageId}>
                      <NavLink href={`/admin/pages/${pageId}`} active={isActive}>
                        <span className="flex items-center gap-2">
                          <FileText size={13} className="shrink-0" />
                          <span className="truncate">{page?.title ?? pageId}</span>
                        </span>
                      </NavLink>
                      {isActive && activePage && (
                        <div className="mt-0.5 space-y-0.5 border-l border-outline-variant/40 pl-2">
                          {activePage.blocks.map((block) => (
                            <NavLink
                              key={block.id}
                              href={`/admin/pages/${pageId}/sections/${block.id}`}
                              active={pathname === `/admin/pages/${pageId}/sections/${block.id}`}
                              indent
                            >
                              {block.heading || block.id}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant/70">Insights</p>
        <div className="space-y-0.5">
          <NavLink href="/admin/insights" active={pathname === '/admin/insights'}>
            <span className="flex items-center gap-2">
              <Sparkles size={13} /> Tất cả bài viết
            </span>
          </NavLink>
          {activeInsight && (
            <div key={activeInsight.slug}>
              <NavLink href={`/admin/insights/${activeInsight.slug}`} active={pathname === `/admin/insights/${activeInsight.slug}`}>
                <span className="truncate pl-[19px]">{activeInsight.title}</span>
              </NavLink>
              <div className="mt-0.5 space-y-0.5 border-l border-outline-variant/40 pl-2">
                {activeInsight.sections.map((section, index) => (
                  <NavLink
                    key={`${activeInsight.slug}-${index}`}
                    href={`/admin/insights/${activeInsight.slug}/sections/${index}`}
                    active={pathname === `/admin/insights/${activeInsight.slug}/sections/${index}`}
                    indent
                  >
                    {section.heading || `Section ${index + 1}`}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const { user, handleSignOut } = useAdminData()
  return (
    <header className="flex items-center justify-between gap-3 border-b border-outline-variant/45 bg-surface/90 px-5 py-3">
      <div className="flex items-center gap-3">
        <button onClick={onOpenNav} className="rounded-lg p-1.5 text-on-surface-variant lg:hidden">
          <Menu size={20} />
        </button>
        <Link href="/" target="_blank" className="text-xs font-bold text-on-surface-variant transition-colors hover:text-primary">
          Xem trang web ↗
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant sm:inline">
          {user?.email}
        </span>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:text-primary"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </header>
  )
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const { configured, authLoading, contentLoading, user, isAdmin, error, message } = useAdminData()
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  if (!configured) return <EnvMissingPanel />
  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-surface text-sm font-bold text-on-surface-variant">Đang tải...</div>
  if (!user) return <LoginScreen />
  if (!isAdmin) return <NoAccessScreen />

  return (
    <div className="min-h-screen bg-surface text-on-surface lg:flex">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header onOpenNav={() => setNavOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-5 py-6 lg:px-8">
          <div className="mx-auto w-full min-w-0 max-w-5xl">
            {contentLoading && (
              <div className="mb-4 rounded-xl bg-surface-container-low p-3 text-xs font-bold text-on-surface-variant">Đang tải nội dung CMS...</div>
            )}
            {error && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
