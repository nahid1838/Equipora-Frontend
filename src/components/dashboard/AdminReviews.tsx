"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { ApiError } from "@/lib/api/errors"
import { getPendingReviews, moderateReview, type ReviewDecision } from "@/lib/reviews"

export default function AdminReviews() {
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Awaited<ReturnType<typeof getPendingReviews>> | ApiError | null>(null)
  const [decision, setDecision] = useState<{ id: string; status: ReviewDecision } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getPendingReviews(page, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        const lastPage = Math.max(1, response.pagination.totalPages)
        if (response.data.length === 0 && page > lastPage) {
          setPage(lastPage)
          return
        }
        setResult(response)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Please try again."))
      })
    return () => controller.abort()
  }, [page, attempt])

  function reload() {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  async function confirmDecision() {
    if (!decision || saving) return
    setError("")
    setSaving(true)
    try {
      await moderateReview(decision.id, decision.status)
      toast.success(decision.status === "approved" ? "Review approved." : "Review rejected.")
      dialog.current?.close()
      reload()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not update this review."
      if (error instanceof ApiError && (error.status === 404 || error.status === 409)) {
        toast.error(message)
        dialog.current?.close()
        reload()
      } else {
        setError(message)
        toast.error("Could not moderate the review.", { description: message })
      }
    } finally {
      setSaving(false)
    }
  }

  if (!result) return <TableSkeleton label="Loading pending reviews…" columns={3} />
  if (result instanceof ApiError) return <EquipmentErrorState title="Could not load pending reviews" message={result.message} onRetry={reload} />

  return (
    <section aria-label="Pending review queue" className="min-w-0 space-y-4">
      <Button type="button" variant="outline" onClick={reload}>Refresh reviews</Button>
      {result.data.length === 0 && <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">No pending reviews on this page.</p>}
      {result.data.map((review) => (
        <article key={review.id} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm wrap-break-word sm:p-6">
          <h2 className="font-heading text-lg font-semibold">{review.name}</h2>
          <p className="text-sm text-muted-foreground">{review.equipmentName} · {review.rating} out of 5 stars</p>
          <blockquote className="whitespace-pre-wrap text-sm">{review.comment}</blockquote>
          <div className="flex flex-wrap gap-2">
            {(["approved", "rejected"] as const).map((status) => (
              <Button key={status} type="button" variant={status === "approved" ? "default" : "outline"} onClick={() => {
                setError("")
                setDecision({ id: review.id, status })
                dialog.current?.showModal()
              }}>{status === "approved" ? "Approve" : "Reject"}</Button>
            ))}
          </div>
        </article>
      ))}
      {(page > 1 || page < result.pagination.totalPages) && (
        <nav aria-label="Pending review pages" className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" disabled={page === 1} onClick={() => { setResult(null); setPage(page - 1) }}>Previous</Button>
          <span className="text-sm">Page {page}</span>
          <Button type="button" variant="outline" disabled={page >= result.pagination.totalPages} onClick={() => { setResult(null); setPage(page + 1) }}>Next</Button>
        </nav>
      )}
      <dialog ref={dialog} aria-labelledby="review-decision" onCancel={(event) => { if (saving) event.preventDefault() }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-background/70 backdrop:backdrop-blur-sm">
        <h2 id="review-decision" className="font-heading text-xl font-semibold">{decision?.status === "approved" ? "Publish this review?" : "Reject this review?"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{decision?.status === "approved" ? "This review will appear in the public customer reviews." : "This review will remain private."}</p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" disabled={saving} onClick={() => void confirmDecision()}>{saving ? "Saving…" : "Confirm decision"}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => dialog.current?.close()}>Cancel</Button>
        </div>
      </dialog>
    </section>
  )
}
