"use client"

import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"

export default function RouteError({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <EquipmentErrorState title="Could not load this page" message="Please try again. If the problem continues, return to the homepage." onRetry={retry} />
    </div>
  )
}
