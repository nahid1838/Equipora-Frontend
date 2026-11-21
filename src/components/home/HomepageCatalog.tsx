"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Building2, CalendarDays, Camera, Monitor, Sprout, Truck } from "lucide-react"
import EquipmentGrid from "@/components/equipment/EquipmentGrid"
import { EquipmentGridSkeleton } from "@/components/equipment/EquipmentCardSkeleton"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { Button } from "@/components/ui/button"
import { buildEquipmentQuery, getEquipmentCategories, getFeaturedEquipment } from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import type { EquipmentCategory } from "@/types/equipment"
import HomeReveal from "./HomeReveal"

const categoryIcons = {
  Construction: Building2,
  Photography: Camera,
  "Vehicles & Transportation": Truck,
  Agriculture: Sprout,
  Electronics: Monitor,
  Event: CalendarDays,
} satisfies Record<EquipmentCategory, typeof Camera>

function useCatalog<T>(fetchItems: (signal: AbortSignal) => Promise<T[]>) {
  const [result, setResult] = useState<T[] | Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchItems(controller.signal)
      .then((items) => { if (!controller.signal.aborted) setResult(items) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new Error("Please try again."))
      })
    return () => controller.abort()
  }, [attempt, fetchItems])

  function retry() {
    setResult(null)
    setAttempt((current) => current + 1)
  }

  return { result, retry }
}

export default function HomepageCatalog() {
  const featured = useCatalog(getFeaturedEquipment)
  const categories = useCatalog(getEquipmentCategories)

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="featured-heading">
        <HomeReveal onScroll>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="featured-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Featured equipment</h2>
            <Button variant="outline" nativeButton={false} render={<Link href="/equipment" />}>
              View all equipment <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </div>
          {!featured.result ? (
            <EquipmentGridSkeleton label="Loading featured equipment…" count={6} />
          ) : featured.result instanceof Error ? (
            <EquipmentErrorState title="Could not load featured equipment" message={featured.result.message} onRetry={featured.retry} />
          ) : featured.result.length ? (
            <EquipmentGrid equipment={featured.result} />
          ) : (
            <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">No featured equipment is available right now.</p>
          )}
        </HomeReveal>
      </section>

      <section className="border-y bg-muted/30" aria-labelledby="categories-heading">
        <HomeReveal onScroll className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h2 id="categories-heading" className="mb-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Browse by category</h2>
          {!categories.result ? (
            <div role="status" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <span className="sr-only">Loading categories…</span>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl border bg-muted motion-reduce:animate-none" />
              ))}
            </div>
          ) : categories.result instanceof Error ? (
            <EquipmentErrorState title="Could not load categories" message={categories.result.message} onRetry={categories.retry} />
          ) : categories.result.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.result.map(({ category, count }) => {
                const Icon = categoryIcons[category]
                return (
                  <li key={category}>
                    <Link
                      href={`/equipment?${buildEquipmentQuery({ category })}`}
                      className="flex h-full min-w-0 items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 grow">
                        <span className="block font-semibold break-words">{category}</span>
                        <span className="block text-sm text-muted-foreground">{count} {count === 1 ? "listing" : "listings"}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">No categories are available right now.</p>
          )}
        </HomeReveal>
      </section>
    </>
  )
}
