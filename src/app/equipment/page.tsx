import type { Metadata } from "next"
import { Suspense } from "react"
import { EquipmentGridSkeleton } from "@/components/equipment/EquipmentCardSkeleton"
import EquipmentBrowser from "@/components/equipment/EquipmentBrowser"

export const metadata: Metadata = {
  title: "Browse Equipment | Equipora",
  description:
    "Browse approved equipment available for rent. Search by name or location and filter by category, rental type, price, and availability.",
}

const EquipmentPage = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Equipment marketplace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Browse Equipment
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find approved equipment by name or location, then narrow the list
          with filters, sorting, and pagination.
        </p>
      </div>

      <div className="mt-8">
        {/* useSearchParams needs a Suspense boundary in this route. */}
        <Suspense fallback={<EquipmentGridSkeleton />}>
          <EquipmentBrowser />
        </Suspense>
      </div>
    </section>
  )
}

export default EquipmentPage
