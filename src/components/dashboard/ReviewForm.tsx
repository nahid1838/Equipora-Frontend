"use client"

import { useState, type FormEvent } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { submitReview } from "@/lib/reviews"

export default function ReviewForm({ bookingId, onClose, onSubmitted, onConflict }: {
  bookingId: string
  onClose: () => void
  onSubmitted: () => void
  onConflict: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    if (!rating || !comment.trim()) {
      setError("Choose a star rating and write a comment.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await submitReview(bookingId, rating, comment.trim())
      toast.success("Review submitted for approval.")
      onSubmitted()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not submit your review. Try again."
      if (error instanceof ApiError && error.status === 409) {
        toast.error(message)
        onConflict()
      } else {
        setError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 w-56 max-w-full space-y-3 rounded-lg border bg-background p-3">
      <fieldset disabled={saving} className="min-w-0 space-y-3">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-semibold">Star rating</legend>
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="relative cursor-pointer">
                <input type="radio" name={`rating-${bookingId}`} required value={value} checked={rating === value} onChange={() => setRating(value)} className="peer sr-only" />
                <span className="grid size-7 place-items-center rounded focus-within:outline-ring peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                  <Star aria-hidden="true" className={value <= rating ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground"} />
                  <span className="sr-only">{value} {value === 1 ? "star" : "stars"}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block space-y-1 text-xs font-semibold">
          <span>Comment</span>
          <textarea required maxLength={1000} rows={3} value={comment} onChange={(event) => setComment(event.target.value)} className="w-full rounded-lg border border-input bg-card p-2 text-sm font-normal focus-visible:outline-2 focus-visible:outline-ring" />
        </label>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" type="submit">{saving ? "Sending…" : "Submit review"}</Button>
          <Button size="sm" type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </fieldset>
    </form>
  )
}
