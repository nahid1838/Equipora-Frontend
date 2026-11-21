"use client"

import { toast } from "sonner"
import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { ApiError } from "@/lib/api/errors"
import { getMyApplication, submitApplication } from "@/lib/api/owner-applications"

const textareaClass = "min-h-24 w-full rounded-lg border border-input bg-background p-3 focus-visible:outline-2 focus-visible:outline-ring"
const blank = { businessName: "", reason: "", additionalInformation: "" }
type Status = Awaited<ReturnType<typeof getMyApplication>>["data"]

export default function BecomeOwner() {
  const [result, setResult] = useState<Status | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [draft, setDraft] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    getMyApplication(controller.signal).then(({ data }) => {
      if (!controller.signal.aborted) setResult(data)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Please try again."))
    })
    return () => controller.abort()
  }, [attempt])

  function refresh() {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const reason = draft.reason.trim()
    if (reason.length < 20) {
      setMessage("Tell us why you want to become an owner in at least 20 characters.")
      return
    }
    setSaving(true)
    setMessage("")
    try {
      const { data } = await submitApplication({ ...draft, reason })
      toast.success("Owner application submitted for review.")
      setDraft(blank)
      setResult({ application: data, hasOwnerAccess: false })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not submit your application. Please try again."
      setMessage(message)
      toast.error("Could not submit the owner application.", { description: message })
      if (error instanceof ApiError && error.status === 409) refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!result) return <p role="status" className="rounded-2xl border bg-card p-6">Checking your application…</p>
  if (result instanceof ApiError) return <EquipmentErrorState title="Could not check your application" message={result.message} onRetry={refresh} />

  const { application, hasOwnerAccess } = result
  return (
    <section className="max-w-3xl rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
      {message && <p role="alert" className="mb-4 text-sm text-destructive">{message}</p>}
      {hasOwnerAccess ? (
        <div className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">Your account has Owner access</h2>
          <p className="text-sm text-muted-foreground">Open your dashboard to list and manage equipment.</p>
          <Button nativeButton={false} render={<Link href="/dashboard/owner" />}>Open Owner Dashboard</Button>
        </div>
      ) : application?.status === "pending" || application?.status === "approved" ? (
        <div className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">{application.status === "approved" ? "Application previously approved" : "Application pending"}</h2>
          <p role="status" className="text-sm text-muted-foreground">{application.status === "approved" ? "Your current account role does not have Owner access." : "Your application was received and is awaiting an admin decision."}</p>
          <Button type="button" variant="outline" onClick={refresh}>Check status</Button>
        </div>
      ) : (
        <>
          <h2 className="font-heading text-xl font-semibold">{application ? "Application rejected" : "Apply to list equipment"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{application ? "You can submit a new application with updated information." : "Tell us what equipment you plan to rent out and why you want to become an owner."}</p>
          <form className="mt-5" onSubmit={submit}>
            <fieldset disabled={saving} className="min-w-0 space-y-4">
              <label className="block space-y-2 text-sm font-medium">
                <span>Business or display name (optional)</span>
                <Input name="businessName" maxLength={100} value={draft.businessName} onChange={(event) => setDraft({ ...draft, businessName: event.target.value })} />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Why do you want to become an owner?</span>
                <textarea name="reason" className={textareaClass} required minLength={20} maxLength={1000} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Additional information (optional)</span>
                <textarea name="additionalInformation" className={textareaClass} maxLength={500} value={draft.additionalInformation} onChange={(event) => setDraft({ ...draft, additionalInformation: event.target.value })} />
              </label>
              <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit application"}</Button>
            </fieldset>
          </form>
        </>
      )}
    </section>
  )
}
