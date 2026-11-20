import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import {
  ArrowUpRight, Boxes, CalendarDays, ClipboardList, Heart, LayoutDashboard,
  PackagePlus, UserRound, UsersRound,
} from "lucide-react"
import DashboardShell from "@/components/dashboard/DashboardShell"
import CustomerRentals from "@/components/dashboard/CustomerRentals"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

export const metadata: Metadata = { title: "Dashboard | Equipora" }

const navigation = {
  customer: [
    { slug: "rentals", title: "My rentals", icon: CalendarDays },
    { slug: "favorites", title: "Favorites", icon: Heart },
  ],
  owner: [
    { slug: "add-equipment", title: "Add equipment", icon: PackagePlus },
    { slug: "equipment", title: "My equipment", icon: Boxes },
    { slug: "rentals", title: "Equipment rentals", icon: ClipboardList },
  ],
  admin: [
    { slug: "users", title: "All users", icon: UsersRound },
    { slug: "equipment", title: "All equipment", icon: Boxes },
    { slug: "rentals", title: "All rentals", icon: ClipboardList },
  ],
}

type PageProps = { params: Promise<{ segments?: string[] }> }

async function DashboardContent({ params }: PageProps) {
  const { segments = [] } = await params
  const [requestedRole, section] = segments
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true, disableRefresh: true },
  })

  if (!session) {
    const path = ["/dashboard", ...segments.map(encodeURIComponent)].join("/")
    redirect(`/sign-in?${new URLSearchParams({ returnTo: path })}`)
  }

  // Older accounts without a role use the same default as the backend JWT.
  const role = typeof session.user.role === "string" ? session.user.role : "customer"
  if (role !== "customer" && role !== "owner" && role !== "admin") redirect("/")

  const home = `/dashboard/${role}`
  if (requestedRole !== role || segments.length > 2) redirect(home)

  const sections = [
    ...navigation[role],
    { slug: "profile", title: "My profile", icon: UserRound },
  ].map(({ slug, title, icon }) => ({ href: `${home}/${slug}`, title, icon }))
  const overview = { href: home, title: "Overview", icon: LayoutDashboard }
  const active = section ? sections.find((link) => link.href === `${home}/${section}`) : overview
  if (!active) redirect(home)

  const roleLabel = role[0].toUpperCase() + role.slice(1)

  return (
    <DashboardShell role={roleLabel} user={session.user} active={active} links={[overview, ...sections]}>
      {active === overview ? (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b bg-gradient-to-br from-secondary/65 to-card px-5 py-7 sm:px-7 sm:py-9">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Welcome, {session.user.name}</h2>
            {role === "customer" && (
              <Button
                className="mt-4"
                size="lg"
                nativeButton={false}
                render={<Link href="/equipment" />}
              >
                Browse equipment
                <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            )}
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-3">
            {sections.map(({ href, title, icon: Icon }) => (
              <Link key={href} href={href} prefetch={false} className="flex items-center gap-3 rounded-xl border bg-background p-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon aria-hidden="true" className="size-[18px]" /></span>
                <span className="grow">{title}</span>
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      ) : role === "customer" && section === "rentals" ? (
        <CustomerRentals />
      ) : (
        <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground sm:p-8">
          This section is coming soon.
        </div>
      )}
    </DashboardShell>
  )
}

export default function DashboardPage({ params }: PageProps) {
  return (
    <Suspense fallback={<p role="status" className="mx-auto max-w-7xl p-8 text-muted-foreground">Loading dashboard…</p>}>
      <DashboardContent params={params} />
    </Suspense>
  )
}
