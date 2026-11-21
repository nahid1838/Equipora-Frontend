"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Boxes, CalendarDays, CheckCircle, Clock, UsersRound, Wallet, type LucideIcon } from "lucide-react"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { getDashboardAnalytics } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/errors"

const count = new Intl.NumberFormat("en-US")
type Metric = { label: string; value: string; icon: LucideIcon }
type Point = { month: string; label: string; value: number }

function MonthlyChart({ title, points, format }: { title: string; points: Point[]; format: (value: number) => string }) {
  const max = Math.max(0, ...points.map(({ value }) => value))

  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">Last six months · UTC</p>
      {max === 0 && <p className="mt-4 text-sm text-muted-foreground">No activity in this period.</p>}
      <dl className="mt-4 space-y-3">
        {points.map(({ month, label, value }) => (
          <div key={month} className="space-y-1.5">
            <div className="flex flex-wrap justify-between gap-x-2 text-xs sm:text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 font-medium break-all tabular-nums">{format(value)}</dd>
            </div>
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function DashboardAnalytics({ role }: { role: "admin" | "owner" }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getDashboardAnalytics>> | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getDashboardAnalytics(role, controller.signal)
      .then((analytics) => { if (!controller.signal.aborted) setResult(analytics) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Could not load analytics."))
      })
    return () => controller.abort()
  }, [role, attempt])

  if (!result) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading analytics…</span>
        <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: role === "admin" ? 6 : 3 }, (_, index) => (
            <div key={index} className="h-24 rounded-2xl border bg-muted motion-safe:animate-pulse" />
          ))}
        </div>
        <div aria-hidden="true" className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((chart) => (
            <div key={chart} className="min-h-72 space-y-5 rounded-2xl border bg-card p-6 motion-safe:animate-pulse">
              <div className="h-5 w-1/2 rounded bg-muted" />
              {[1, 2, 3, 4, 5, 6].map((row) => <div key={row} className="h-3 rounded-full bg-muted" />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (result instanceof ApiError) {
    if (result.status === 401) redirect(`/sign-in?${new URLSearchParams({ returnTo: `/dashboard/${role}` })}`)
    if (result.status === 403) redirect("/dashboard")
    return <EquipmentErrorState title="Could not load analytics" message={result.message} onRetry={() => {
      setResult(null)
      setAttempt((current) => current + 1)
    }} />
  }

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: result.data.currency })
  const money = (value: number) => currency.format(value / 100)
  const metrics: Metric[] = [
    { label: "Total equipment", value: count.format(result.data.totalEquipment), icon: Boxes },
    { label: "Completed rentals", value: count.format(result.data.completedRentals), icon: CheckCircle },
  ]

  if (result.role === "admin") {
    metrics.unshift({ label: "Total users", value: count.format(result.data.totalUsers), icon: UsersRound })
    metrics.push(
      { label: "Paid bookings", value: count.format(result.data.totalBookings), icon: CalendarDays },
      { label: "Pending approvals", value: count.format(result.data.pendingApprovals), icon: Clock },
      { label: "Gross booking revenue", value: money(result.data.totalRevenueMinor), icon: Wallet },
    )
  } else {
    metrics.push({ label: "Gross booking earnings", value: money(result.data.totalEarningsMinor), icon: Wallet })
  }

  const bookingPoints = result.data.monthly.map((point) => ({ ...point, value: point.bookings }))
  const moneyPoints = result.role === "admin"
    ? result.data.monthly.map((point) => ({ ...point, value: point.revenueMinor }))
    : result.data.monthly.map((point) => ({ ...point, value: point.earningsMinor }))

  return (
    <section className="space-y-4" aria-label="Dashboard analytics">
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" /> {label}
            </dt>
            <dd className="mt-2 font-heading text-2xl font-bold break-words tabular-nums sm:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 md:grid-cols-2">
        <MonthlyChart title="Monthly paid bookings" points={bookingPoints} format={(value) => count.format(value)} />
        <MonthlyChart title={role === "admin" ? "Monthly gross revenue" : "Monthly gross earnings"} points={moneyPoints} format={money} />
      </div>
    </section>
  )
}
