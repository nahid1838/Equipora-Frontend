"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart, Trash2 } from "lucide-react"
import EquipmentCard from "@/components/equipment/EquipmentCard"
import { EquipmentGridSkeleton } from "@/components/equipment/EquipmentCardSkeleton"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/useFavorites"
import { ApiError } from "@/lib/api/errors"

export default function CustomerFavorites() {
  const { result, pendingId, retry, changeFavorite } = useFavorites()

  if (!result) {
    return <div role="status"><span className="sr-only">Loading favorites…</span><EquipmentGridSkeleton /></div>
  }
  if (result instanceof ApiError) {
    if (result.status === 401) redirect("/sign-in?returnTo=%2Fdashboard%2Fcustomer%2Ffavorites")
    if (result.status === 403) redirect("/dashboard")
    return <EquipmentErrorState message={result.message} onRetry={retry} />
  }
  if (result.length === 0) {
    return (
      <section className="flex flex-col items-center rounded-2xl border bg-card px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Heart aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-semibold">No favorites yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Save equipment from its details page to find it here later.</p>
        <Button className="mt-5" variant="outline" nativeButton={false} render={<Link href="/equipment" />}>
          Browse equipment
        </Button>
      </section>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {result.map((item) => (
        <EquipmentCard
          key={item._id}
          equipment={item}
          action={
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={Boolean(pendingId)}
              aria-label={`Remove ${item.name} from favorites`}
              onClick={() => void changeFavorite(item, false)}
            >
              <Trash2 aria-hidden="true" data-icon="inline-start" />
              {pendingId === item._id ? "Removing…" : "Remove from Favorites"}
            </Button>
          }
        />
      ))}
    </div>
  )
}
