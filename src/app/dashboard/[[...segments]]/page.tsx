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
import DashboardAvatar from "@/components/dashboard/DashboardAvatar"
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics"
import AdminUsers from "@/components/dashboard/AdminUsers"
import AdminOwnerApplications from "@/components/dashboard/AdminOwnerApplications"
import AdminReviews from "@/components/dashboard/AdminReviews"
import BecomeOwner from "@/components/dashboard/BecomeOwner"
import RentalBookings from "@/components/dashboard/RentalBookings"
import CustomerFavorites from "@/components/dashboard/CustomerFavorites"
import OwnerEquipmentForm from "@/components/dashboard/OwnerEquipmentForm"
import EquipmentManagementList from "@/components/dashboard/EquipmentManagementList"
import ProfileSettings from "@/components/dashboard/ProfileSettings"
import { Button } from "@/components/ui/button"
import { getAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Dashboard | Equipora" }

const navigation = {
  customer: [
    { slug: "rentals", title: "My rentals", icon: CalendarDays },
    { slug: "favorites", title: "My Favorites", icon: Heart },
    { slug: "become-owner", title: "Become an Owner", icon: PackagePlus },
  ],
  owner: [
    { slug: "add-equipment", title: "Add equipment", icon: PackagePlus },
    { slug: "equipment", title: "My equipment", icon: Boxes },
    { slug: "rentals", title: "Equipment rentals", icon: ClipboardList },
  ],
  admin: [
    { slug: "users", title: "All users", icon: UsersRound },
    { slug: "owner-applications", title: "Owner Applications", icon: ClipboardList },
    { slug: "reviews", title: "Customer Reviews", icon: ClipboardList },
    { slug: "equipment", title: "All equipment", icon: Boxes },
    { slug: "rentals", title: "All rentals", icon: ClipboardList },
  ],
}

type PageProps = { params: Promise<{ segments?: string[] }> }

async function DashboardContent({ params }: PageProps) {
  const { segments = [] } = await params
  const [requestedRole, section] = segments
  const requestHeaders = await headers()
  const auth = await getAuth()
  const session = await auth.api.getSession({
    headers: requestHeaders,
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
        <>
          {role !== "customer" && (
            <div className="mb-5"><DashboardAnalytics key={`${session.user.id}:${role}`} role={role} /></div>
          )}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-secondary/80 via-card to-card p-5 shadow-sm sm:gap-6 sm:p-8">
              <DashboardAvatar user={session.user} className="size-14 text-lg sm:size-16" />
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">Welcome, {session.user.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{role === "customer" ? "Manage your rentals, saved equipment, and account." : role === "owner" ? "Manage your equipment listings and rental activity." : "Review marketplace activity, accounts, and applications."}</p>
              </div>
              {role === "customer" && (
                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/equipment" />}
                >
                  Browse equipment
                  <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
                </Button>
              )}
            </div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">Quick actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sections.map(({ href, title, icon: Icon }) => (
                <Link key={href} href={href} prefetch={false} className="flex min-w-0 items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-semibold shadow-sm transition-[translate,box-shadow,border-color,background-color] hover:border-primary/40 hover:bg-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring motion-safe:hover:-translate-y-0.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon aria-hidden="true" className="size-5" /></span>
                  <span className="min-w-0 grow wrap-break-word">{title}</span>
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : section === "profile" ? (
        <ProfileSettings
          key={session.user.id}
          name={session.user.name}
          email={session.user.email}
          image={session.user.image ?? ""}
          phoneNumber={session.user.phoneNumber ?? ""}
          address={session.user.address ?? ""}
          role={roleLabel}
        />
      ) : section === "rentals" ? (
        <RentalBookings key={`${session.user.id}:${role}`} role={role} />
      ) : role === "customer" && section === "favorites" ? (
        <CustomerFavorites key={session.user.id} />
      ) : role === "owner" && section === "add-equipment" ? (
        <OwnerEquipmentForm />
      ) : role === "owner" && section === "equipment" ? (
        <EquipmentManagementList key="owner-equipment" mode="owner" />
      ) : role === "admin" && section === "equipment" ? (
        <EquipmentManagementList key="admin-equipment" mode="admin" />
      ) : role === "admin" && section === "users" ? (
        <AdminUsers key={session.user.id} viewerId={session.user.id} viewerEmail={session.user.email} />
      ) : role === "customer" && section === "become-owner" ? (
        <BecomeOwner key={session.user.id} />
      ) : role === "admin" && section === "owner-applications" ? (
        <AdminOwnerApplications key={session.user.id} />
      ) : role === "admin" && section === "reviews" ? (
        <AdminReviews key={session.user.id} />
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
    <Suspense fallback={
      <div role="status" className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
        <span className="sr-only">Loading dashboard…</span>
        <div aria-hidden="true" className="h-8 w-44 rounded bg-muted motion-safe:animate-pulse" />
        <div aria-hidden="true" className="h-40 rounded-2xl border bg-card motion-safe:animate-pulse" />
      </div>
    }>
      <DashboardContent params={params} />
    </Suspense>
  )
}
