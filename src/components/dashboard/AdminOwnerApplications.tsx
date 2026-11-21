"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { getOwnerApplications, reviewApplication, type ApplicationDecision } from "@/lib/api/owner-applications"

type Results = Awaited<ReturnType<typeof getOwnerApplications>>
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" })

export default function AdminOwnerApplications() {
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Results | ApiError | null>(null)
  const [decision, setDecision] = useState<{ id: string; status: ApplicationDecision } | null>(null)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getOwnerApplications(page, controller.signal).then((response) => {
      if (!controller.signal.aborted) setResult(response)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Please try again."))
    })
    return () => controller.abort()
  }, [page, attempt])

  function reload() {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  async function review() {
    if (!decision || pending.current) return
    pending.current = true
    setSaving(true)
    try {
      await reviewApplication(decision.id, decision.status)
      toast.success(decision.status === "approved" ? "Application approved." : "Application rejected.")
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not review the application. Please try again.")
    } finally {
      dialog.current?.close()
      pending.current = false
      setSaving(false)
      reload()
    }
  }

  if (!result) return <TableSkeleton label="Loading owner applications…" columns={3} />
  if (result instanceof ApiError) return <EquipmentErrorState title="Could not load owner applications" message={result.message} onRetry={reload} />
  if (!result.data.length && page === 1) {
    return <div className="rounded-2xl border bg-card p-7"><h2 className="font-heading text-xl font-semibold">No owner applications yet</h2><p className="mt-2 text-sm text-muted-foreground">New applications will appear here for review.</p></div>
  }

  return (
    <div className="min-w-0 space-y-4">
      <Button variant="outline" type="button" onClick={reload}>Refresh applications</Button>
      {result.data.map((item) => (
        <article key={item._id} className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm [overflow-wrap:anywhere] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-semibold">{item.applicant?.name ?? "Account unavailable"}</h2>
              {item.applicant && <p className="text-sm text-muted-foreground">{item.applicant.email}</p>}
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground">{item.status}</span>
          </div>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-medium">Submitted</dt><dd className="text-muted-foreground">{date.format(new Date(item.createdAt))}</dd></div>
            {item.reviewedAt && <div><dt className="font-medium">Reviewed</dt><dd className="text-muted-foreground">{date.format(new Date(item.reviewedAt))}</dd></div>}
            {item.businessName && <div><dt className="font-medium">Business or display name</dt><dd className="text-muted-foreground">{item.businessName}</dd></div>}
            <div><dt className="font-medium">Reason for applying</dt><dd className="whitespace-pre-wrap text-muted-foreground">{item.reason}</dd></div>
            {item.additionalInformation && <div><dt className="font-medium">Additional information</dt><dd className="whitespace-pre-wrap text-muted-foreground">{item.additionalInformation}</dd></div>}
          </dl>
          {item.status === "pending" && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!item.applicant} onClick={() => {
                setDecision({ id: item._id, status: "approved" })
                dialog.current?.showModal()
              }}>{item.approvalStarted ? "Retry approval" : "Approve"}</Button>
              <Button type="button" variant="outline" disabled={item.approvalStarted} onClick={() => {
                setDecision({ id: item._id, status: "rejected" })
                dialog.current?.showModal()
              }}>Reject</Button>
            </div>
          )}
        </article>
      ))}
      {(page > 1 || (result.pagination?.totalPages ?? 0) > page) && (
        <nav aria-label="Application pages" className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => { setResult(null); setPage(page - 1) }}>Previous</Button>
          <span className="text-sm">Page {page}</span>
          <Button type="button" variant="outline" disabled={page >= (result.pagination?.totalPages ?? 0)} onClick={() => { setResult(null); setPage(page + 1) }}>Next</Button>
        </nav>
      )}
      <dialog ref={dialog} aria-labelledby="application-review" onClose={() => setDecision(null)} onCancel={(event) => { if (saving) event.preventDefault() }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-background/70 backdrop:backdrop-blur-sm">
        <h2 id="application-review" className="font-heading text-xl font-semibold">{decision?.status === "approved" ? "Approve application?" : "Reject application?"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{decision?.status === "approved" ? "This grants the applicant access to the Owner Dashboard." : "This closes the application. The applicant can apply again."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" disabled={saving} onClick={() => void review()}>{saving ? "Saving…" : "Confirm decision"}</Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => dialog.current?.close()}>Cancel</Button>
        </div>
      </dialog>
    </div>
  )
}
