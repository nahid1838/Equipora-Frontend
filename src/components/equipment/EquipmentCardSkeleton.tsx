// Placeholder card shown while equipment is loading.
// Its layout mirrors EquipmentCard to avoid a visible jump.
const EquipmentCardSkeleton = () => {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border bg-card motion-safe:animate-pulse">
      <div className="aspect-[4/3] w-full bg-muted" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />

        <div className="flex items-end justify-between gap-3 border-t pt-3">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="h-8 w-full rounded bg-muted" />
      </div>
    </div>
  )
}

// Full grid placeholder used on first load and while filters change.
export const EquipmentGridSkeleton = ({ label = "Loading equipment…", count = 9 }: { label?: string; count?: number }) => {
  return (
    <div role="status" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <EquipmentCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default EquipmentCardSkeleton
