import type { Metadata } from "next"
import { Suspense } from "react"
import EquipmentDetails, { EquipmentDetailsLoading } from "@/components/equipment/EquipmentDetails"

export const metadata: Metadata = {
  title: "Equipment Details | Equipora",
}

type PageProps = { params: Promise<{ id: string }> }

async function DetailsContent({ params }: PageProps) {
  const { id } = await params
  return <EquipmentDetails id={id} />
}

export default function EquipmentDetailsPage({ params }: PageProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Suspense fallback={<EquipmentDetailsLoading />}>
        <DetailsContent params={params} />
      </Suspense>
    </section>
  )
}
