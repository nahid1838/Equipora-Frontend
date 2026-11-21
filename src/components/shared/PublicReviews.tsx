"use client"

import { useEffect, useState } from "react"
import ReviewList from "./ReviewList"
import { Button } from "@/components/ui/button"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { ApiError } from "@/lib/api/errors"
import { getPublicReviews } from "@/lib/reviews"

export default function PublicReviews({ featured = false }: { featured?: boolean }) {
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Awaited<ReturnType<typeof getPublicReviews>> | ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getPublicReviews(page, featured ? 3 : 12, controller.signal)
      .then((response) => { if (!controller.signal.aborted) setResult(response) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Please try again."))
      })
    return () => controller.abort()
  }, [page, featured, attempt])

  if (!result) {
    return (
      <div role="status" className="mt-10 grid gap-5 md:grid-cols-3">
        <span className="sr-only">Loading customer reviews…</span>
        {[1, 2, 3].map((row) => <div key={row} aria-hidden="true" className="h-40 rounded-2xl border bg-muted motion-safe:animate-pulse" />)}
      </div>
    )
  }
  if (result instanceof ApiError) {
    return <div className="mt-10"><EquipmentErrorState title="Could not load customer reviews" message={result.message} onRetry={() => {
      setResult(null)
      setAttempt((value) => value + 1)
    }} /></div>
  }

  const totalPages = result.pagination.totalPages
  function changePage(next: number) {
    setResult(null)
    setPage(next)
  }

  return (
    <>
      <ReviewList reviews={result.data} />
      {!featured && (page > 1 || page < totalPages) && (
        <nav aria-label="Review pages" className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</Button>
          <span className="text-sm">Page {page}</span>
          <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</Button>
        </nav>
      )}
    </>
  )
}
