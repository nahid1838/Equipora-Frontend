"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart, Trash2 } from "lucide-react"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/useFavorites"
import { ApiError } from "@/lib/api/errors"

const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const rentalPeriod = { daily: "day", weekly: "week", monthly: "month" }

export default function CustomerFavorites() {
  const { result, pendingId, retry, changeFavorite } = useFavorites()

  if (!result) return <TableSkeleton label="Loading favorites…" />
  if (result instanceof ApiError) {
    if (result.status === 401) redirect("/sign-in?returnTo=%2Fdashboard%2Fcustomer%2Ffavorites")
    if (result.status === 403) redirect("/dashboard")
    return <EquipmentErrorState title="Could not load favorites" message={result.message} onRetry={retry} />
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
    <section className="min-w-0 overflow-hidden rounded-2xl border bg-card" aria-labelledby="saved-equipment-heading">
      <h2 id="saved-equipment-heading" className="p-4 font-heading text-xl font-semibold sm:p-6">Saved equipment</h2>
      <div role="region" aria-labelledby="saved-equipment-heading" tabIndex={0} className="overflow-x-auto border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>{["Equipment", "Location", "Rental rate", "Availability", "Actions"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {result.map((item) => (
              <tr key={item._id}>
                <th scope="row" className="max-w-52 px-4 py-3 font-semibold break-words">
                  {item.name}
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{item.category}</span>
                </th>
                <td className="max-w-44 px-4 py-3 break-words">{item.location}</td>
                <td className="px-4 py-3 whitespace-nowrap">{price.format(item.price)} / {rentalPeriod[item.rentalType]}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.availableQuantity ? `${item.availableQuantity} available` : "Unavailable"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" nativeButton={false} render={<Link href={`/equipment/${item._id}`} />} aria-label={`View details for ${item.name}`}>View Details</Button>
                    <Button type="button" variant="ghost" disabled={Boolean(pendingId)} aria-label={`Remove ${item.name} from favorites`} onClick={() => void changeFavorite(item, false)}>
                      <Trash2 aria-hidden="true" data-icon="inline-start" />
                      {pendingId === item._id ? "Removing…" : "Remove Favorite"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
