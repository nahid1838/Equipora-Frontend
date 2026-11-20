import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Hexagon, Menu, type LucideIcon } from "lucide-react"
import ThemeToggle from "@/components/shared/ThemeToggle"
import { cn } from "@/lib/utils"

export type DashboardLink = { href: string; title: string; icon: LucideIcon }

type DashboardShellProps = {
  role: string
  user: { name: string; email: string }
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
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-sidebar-ring",
                  isCurrent
                    ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon aria-hidden="true" className={cn("size-[18px] shrink-0", isCurrent && "text-sidebar-primary dark:text-primary")} />
                {title}
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
    <Link href="/equipment" className="flex items-center justify-between gap-3 rounded-xl border border-sidebar-border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent">
      Browse equipment <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  )
}

export default function DashboardShell({ role, user, active, links, children }: DashboardShellProps) {
  const initials = (user.name.trim() || user.email).split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto grid min-h-dvh max-w-screen-2xl lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
          <div className="sticky top-0 flex min-h-dvh flex-col gap-8 p-5">
            <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2 py-2">
              <Hexagon aria-hidden="true" className="size-8 fill-primary text-primary" />
              <span className="font-heading text-xl font-bold tracking-tight">Equipora</span>
            </Link>
            <div>
              <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-sidebar-foreground/70">{role} dashboard</p>
              <DashboardNavigation links={links} active={active} />
            </div>
            <div className="mt-auto"><MarketplaceLink /></div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{role} dashboard</p>
                <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl">{active.title}</h1>
              </div>
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <ThemeToggle />
                <div className="flex min-w-0 items-center gap-2.5 border-l pl-3 sm:pl-4">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{initials}</span>
                  <div className="min-w-0 text-sm">
                    <p className="max-w-48 truncate font-semibold" title={user.name}>{user.name}</p>
                    <p className="hidden max-w-56 truncate text-xs text-muted-foreground sm:block" title={user.email}>{user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <details key={active.href} className="group border-t bg-sidebar px-4 text-sidebar-foreground sm:px-6 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2"><Menu aria-hidden="true" className="size-4" /> Dashboard menu</span>
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 pb-4">
                <DashboardNavigation links={links} active={active} />
                <MarketplaceLink />
              </div>
            </details>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
