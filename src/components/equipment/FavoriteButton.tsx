"use client"

import { redirect } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/useFavorites"
import { ApiError } from "@/lib/api/errors"
import type { EquipmentCardItem } from "@/types/equipment"

export default function FavoriteButton({ equipment, signInUrl }: { equipment: EquipmentCardItem; signInUrl: string }) {
  const { result, pendingId, retry, changeFavorite } = useFavorites()

  if (result instanceof ApiError) {
    if (result.status === 401) redirect(signInUrl)
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p role="alert" className="text-sm text-destructive">{result.message}</p>
        {result.status !== 403 && <Button type="button" variant="outline" onClick={retry}>Retry favorites</Button>}
      </div>
    )
  }

  const isFavorite = result?.some((item) => item._id === equipment._id) ?? false
  const label = !result ? "Checking favorites…" : pendingId ? "Updating favorites…" : isFavorite ? "Remove from Favorites" : "Add to Favorites"

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={isFavorite}
      disabled={!result || Boolean(pendingId)}
      onClick={() => void changeFavorite(equipment, !isFavorite)}
    >
      <Heart aria-hidden="true" data-icon="inline-start" className={isFavorite ? "fill-current text-primary" : undefined} />
      {label}
    </Button>
  )
}
