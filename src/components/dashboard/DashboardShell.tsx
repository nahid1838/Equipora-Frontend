import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Hexagon, Menu, type LucideIcon } from "lucide-react"
import ThemeToggle from "@/components/shared/ThemeToggle"
import DashboardAvatar from "./DashboardAvatar"
import { cn } from "@/lib/utils"
import "./dashboard.css"

export type DashboardLink = { href: string; title: string; icon: LucideIcon }

type DashboardShellProps = {
  role: string
  user: { name: string; email: string; image?: string | null }
  active: DashboardLink
  links: DashboardLink[]
  children: ReactNode
}

function DashboardNavigation({ links, active }: Pick<DashboardShellProps, "links" | "active">) {
  return (
    <nav aria-label="Dashboard navigation">
      <ul className="space-y-1">
        {links.map(({ href, title, icon: Icon }) => {
          const isCurrent = active.href === href
          return (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sidebar-ring",
                  isCurrent
                    ? "border-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon aria-hidden="true" className={cn("size-[18px] shrink-0", isCurrent && "text-sidebar-primary dark:text-primary")} />
                {title}
                {isCurrent && <span aria-hidden="true" className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MarketplaceLink() {
  return (
    <Link href="/equipment" className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-primary/20 bg-sidebar-accent px-3 py-2.5 text-sm font-semibold text-sidebar-accent-foreground transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-sidebar-ring">
      Browse equipment <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  )
}

function DashboardBrand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2 py-2 focus-visible:outline-2 focus-visible:outline-sidebar-ring">
      <span aria-hidden="true" className="relative grid size-9 place-items-center">
        <Hexagon className="size-9 fill-primary text-primary" strokeWidth={1} />
        <span className="absolute text-sm font-bold text-primary-foreground">E</span>
      </span>
      <span className="font-heading text-xl font-bold tracking-tight">Equipora</span>
    </Link>
  )
}

function DashboardIdentity({ user }: Pick<DashboardShellProps, "user">) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <DashboardAvatar user={user} />
      <div className="min-w-0 text-sm">
        <p className="truncate font-semibold" title={user.name}>{user.name}</p>
        <p className="truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
      </div>
    </div>
  )
}

export default function DashboardShell({ role, user, active, links, children }: DashboardShellProps) {
  return (
    <div className="equipora-dashboard min-h-dvh bg-muted/50 dark:bg-background">
      <div className="mx-auto grid min-h-dvh max-w-[100rem] lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
          <div className="sticky top-0 flex max-h-dvh min-h-dvh flex-col gap-6 overflow-y-auto p-5">
            <DashboardBrand />
            <div className="rounded-xl border border-sidebar-border bg-card p-3">
              <DashboardIdentity user={user} />
            </div>
            <div>
              <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-sidebar-foreground/70">{role} dashboard</p>
              <DashboardNavigation links={links} active={active} />
            </div>
            <div className="mt-auto"><MarketplaceLink /></div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{role} dashboard</p>
                <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{active.title}</h1>
              </div>
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <ThemeToggle />
                <div className="min-w-0 max-w-[min(60vw,16rem)] border-l pl-3 sm:pl-4"><DashboardIdentity user={user} /></div>
              </div>
            </div>

            <details key={active.href} className="dashboard-menu group border-t bg-sidebar px-4 text-sidebar-foreground sm:px-6 lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sidebar-ring [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2"><Menu aria-hidden="true" className="size-4" /> Dashboard menu</span>
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 pb-4">
                <DashboardBrand />
                <DashboardNavigation links={links} active={active} />
                <MarketplaceLink />
              </div>
            </details>
          </header>

          <div key={active.href} className="dashboard-content p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
