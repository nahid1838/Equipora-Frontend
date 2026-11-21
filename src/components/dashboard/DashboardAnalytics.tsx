"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Boxes, CalendarDays, CheckCircle, Clock, UsersRound, Wallet, type LucideIcon } from "lucide-react"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { getDashboardAnalytics } from "@/lib/api/dashboard"
import { ApiError } from "@/lib/api/errors"

const count = new Intl.NumberFormat("en-US")
type Metric = { label: string; value: string; icon: LucideIcon }
type Point = { month: string; label: string; value: number }

function MonthlyChart({ title, points, format }: { title: string; points: Point[]; format: (value: number) => string }) {
  const max = Math.max(0, ...points.map(({ value }) => value))
  const reduceMotion = useReducedMotion()

  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">Last six months · UTC</p>
      {max === 0 && <p className="mt-4 text-sm text-muted-foreground">No activity in this period.</p>}
      {points.length > 0 && (
        <div className="mt-5">
          <div aria-hidden="true" className="flex justify-between gap-2 font-mono text-[0.65rem] text-muted-foreground">
            <span>{format(0)}</span>
            <span>{format(max)}</span>
          </div>
          <dl className="mt-2 grid grid-cols-[repeat(6,minmax(0,1fr))] gap-1.5 border-b border-border/70 sm:gap-2">
            {points.map(({ month, label, value }) => (
              <div key={month} className="flex min-w-0 flex-col gap-2 pb-3 text-center" title={`${label} · ${format(value)}`}>
                <dt className="order-2 text-[0.625rem] leading-tight text-muted-foreground sm:text-xs">{label}</dt>
                <dd className="order-1 flex h-32 items-end rounded-t-lg bg-muted/40 px-1 sm:h-40 sm:px-2">
                  <span className="sr-only">{format(value)}</span>
                  <motion.span
                    aria-hidden="true"
                    initial={reduceMotion ? false : { scaleY: 0.92 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3 }}
                    className="w-full origin-bottom rounded-t-md bg-gradient-to-t from-chart-2 to-chart-1 motion-reduce:transform-none!"
                    style={{ height: `${max ? (value / max) * 100 : 0}%` }}
                  />
                </dd>
                <dd aria-hidden="true" className="order-3 wrap-break-word font-medium text-[0.625rem] tabular-nums sm:text-xs">{format(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  )
}

export default function DashboardAnalytics({ role }: { role: "admin" | "owner" }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getDashboardAnalytics>> | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)
  const reduceMotion = useReducedMotion()

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
          <motion.div key={label} initial={reduceMotion ? false : { opacity: 0.86, y: 5 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="flex min-h-32 min-w-0 flex-col justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-md motion-reduce:transform-none! motion-reduce:opacity-100! sm:p-5"
          >
            <dt className="flex min-w-0 items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
              <span>{label}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon aria-hidden="true" className="size-4" /></span>
            </dt>
            <dd className="font-heading text-2xl font-bold tracking-tight wrap-break-word tabular-nums sm:text-3xl">{value}</dd>
          </motion.div>
        ))}
      </dl>
      <div className="grid gap-4 md:grid-cols-2">
        <MonthlyChart title="Monthly paid bookings" points={bookingPoints} format={(value) => count.format(value)} />
        <MonthlyChart title={role === "admin" ? "Monthly gross revenue" : "Monthly gross earnings"} points={moneyPoints} format={money} />
      </div>
    </section>
  )
}
