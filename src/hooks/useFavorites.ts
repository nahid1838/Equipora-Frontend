"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api/errors"
import { addFavorite, getFavorites, removeFavorite } from "@/lib/api/favorites"
import type { EquipmentCardItem } from "@/types/equipment"

export function useFavorites() {
  const [result, setResult] = useState<EquipmentCardItem[] | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const isChanging = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    getFavorites(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResult(items)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult(error instanceof ApiError ? error : new ApiError("Could not load favorites."))
        }
      })
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setResult(null)
    setAttempt((current) => current + 1)
  }

  async function changeFavorite(item: EquipmentCardItem, save: boolean) {
    if (isChanging.current) return
    isChanging.current = true
    setPendingId(item._id)

    try {
      if (save) {
        await addFavorite(item._id)
      } else {
        try {
          await removeFavorite(item._id)
        } catch (error) {
          // A removal in another tab can leave an out-of-date button here.
          if (!(error instanceof ApiError && error.status === 404)) throw error
        }
      }

      setResult((current) => {
        if (!Array.isArray(current)) return current
        const others = current.filter((favorite) => favorite._id !== item._id)
        return save ? [item, ...others] : others
      })
      toast.success(save ? "Added to favorites." : "Removed from favorites.")
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setResult(error)
      } else {
        toast.error(error instanceof Error ? error.message : "Could not update your favorites.")
      }
    } finally {
      setPendingId(null)
      isChanging.current = false
    }
  }

  return { result, pendingId, retry, changeFavorite }
}
