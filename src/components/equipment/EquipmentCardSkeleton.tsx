// Placeholder card shown while equipment is loading.
// Its layout mirrors EquipmentCard to avoid a visible jump.
const EquipmentCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />

        <div className="flex items-end justify-between gap-3 border-t pt-3">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

// Full grid placeholder used on first load and while filters change.
export const EquipmentGridSkeleton = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <EquipmentCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default EquipmentCardSkeleton
