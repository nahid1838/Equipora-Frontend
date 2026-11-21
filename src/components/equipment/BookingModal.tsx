"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/errors"
import { getBookingAvailability, getBookingQuote, startBookingCheckout } from "@/lib/api/bookings"

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", dateStyle: "short" }).format(new Date())
const textarea = "block min-h-14 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-ring"

export default function BookingModal({ equipmentId, stock, signInUrl }: { equipmentId: string; stock: number; signInUrl: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const requestKey = useRef<string | null>(null)
  const checkoutTimedOut = useRef(false)
  const pending = useRef(false)
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof getBookingQuote>> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [availability, setAvailability] = useState<number | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)
  const validDates = startDate > today() && endDate > startDate
  const available = typeof availability === "number" ? availability : 0

  useEffect(() => {
    if (!validDates) return
    const controller = new AbortController()
    getBookingAvailability({ equipmentId, startDate, endDate }, controller.signal)
      .then((count) => { if (!controller.signal.aborted) setAvailability(count) })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof ApiError && error.status === 401) {
          router.replace(signInUrl)
          return
        }
        setAvailability(error instanceof ApiError ? error : new ApiError("Could not check availability. Please try again."))
      })
    return () => controller.abort()
  }, [equipmentId, startDate, endDate, validDates, attempt, router, signInUrl])

  function refreshAvailability() {
    setAvailability(null)
    setAttempt((value) => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const entries = new FormData(event.currentTarget)
    const text = (name: string) => String(entries.get(name) ?? "").trim()
    const period = { equipmentId, startDate: text("startDate"), endDate: text("endDate"), quantity: Number(text("quantity")) }
    const contactNumber = text("contactNumber")
    const deliveryAddress = text("deliveryAddress")
    const notes = text("notes")
    const phoneDigits = contactNumber.replace(/\D/g, "").length
    if (period.startDate <= today() || period.endDate <= period.startDate) {
      setError("Choose a future start date and a later return date.")
      return
    }
    if (!Number.isSafeInteger(period.quantity) || period.quantity < 1 || period.quantity > available) {
      setError("Enter a whole quantity within the availability for your dates.")
      return
    }
    if (!/^\+?[\d ()-]+$/.test(contactNumber) || phoneDigits < 7 || phoneDigits > 15 || !deliveryAddress) {
      setError("Enter a valid contact number and delivery address.")
      return
    }

    pending.current = true
    setBusy(true)
    setError(null)
    let leaving = false
    try {
      if (!quote) {
        const nextQuote = await getBookingQuote(period)
        setAvailability(nextQuote.availableQuantity)
        setQuote(nextQuote)
        return
      }
      requestKey.current ??= crypto.randomUUID()
      const url = await startBookingCheckout({ ...period, contactNumber, deliveryAddress, notes, requestKey: requestKey.current })
      window.location.assign(url)
      leaving = true
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace(signInUrl)
      else {
        if (quote && error instanceof ApiError && error.isTimeout) {
          checkoutTimedOut.current = true
          setError("Checkout timed out. Choose Continue to payment again with the same details to retry this checkout.")
        } else {
          setError(error instanceof ApiError ? error.message : "Could not prepare your rental.")
        }
        if (error instanceof ApiError && error.status === 409) {
          refreshAvailability()
        }
      }
    } finally {
      if (!leaving) {
        pending.current = false
        setBusy(false)
      }
    }
  }

  return (
    <>
      <Button type="button" disabled={stock < 1} onClick={() => {
        if (!checkoutTimedOut.current) {
          requestKey.current = null
          setQuote(null)
          setError(null)
          refreshAvailability()
        }
        dialog.current?.showModal()
      }}>Book Now</Button>
      <dialog ref={dialog} aria-labelledby="booking-title" onCancel={(event) => { if (pending.current) event.preventDefault() }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-7">
        <h2 id="booking-title" className="font-heading text-xl font-semibold">Book equipment</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your end date is the day you return the equipment.</p>
        <form className="mt-4 space-y-4" onSubmit={submit} onChange={() => {
          checkoutTimedOut.current = false
          requestKey.current = null
          setQuote(null)
          setError(null)
        }}>
          <fieldset disabled={busy} className="grid gap-3 text-sm sm:grid-cols-2">
            <label>Rental start date<Input name="startDate" type="date" value={startDate} onChange={(event) => {
              if (event.target.value === startDate) return
              setAvailability(null)
              setStartDate(event.target.value)
            }} required /></label>
            <label>Rental end date<Input name="endDate" type="date" value={endDate} onChange={(event) => {
              if (event.target.value === endDate) return
              setAvailability(null)
              setEndDate(event.target.value)
            }} required /></label>
            <label>Required quantity<Input name="quantity" type="number" min={1} max={available} step={1} defaultValue={1} disabled={available < 1} required aria-describedby="booking-availability" /></label>
            <label>Contact number<Input name="contactNumber" type="tel" autoComplete="tel" maxLength={32} required /></label>
            <label className="sm:col-span-2">Delivery address<textarea name="deliveryAddress" className={textarea} autoComplete="street-address" maxLength={500} required /></label>
            <label className="sm:col-span-2">Additional notes (optional)<textarea name="notes" className={textarea} maxLength={1000} /></label>
          </fieldset>
          <p id="booking-availability" role={availability instanceof ApiError ? "alert" : "status"} className="text-sm text-muted-foreground">
            {!validDates ? "Choose a future start date and a later return date to see availability."
              : availability === null ? "Checking availability…"
                : availability instanceof ApiError ? availability.message
                  : available === 0 ? "No units available for these dates."
                    : `${available} ${available === 1 ? "unit" : "units"} available for these dates.`}
          </p>
          {validDates && availability instanceof ApiError && <Button type="button" variant="outline" onClick={refreshAvailability}>Retry availability</Button>}
          {quote && <p role="status" className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
            Estimated total <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: quote.currency }).format(quote.totalAmountMinor / 100)}</strong> for {quote.durationDays} {quote.durationDays === 1 ? "day" : "days"}. Availability is checked again before and after payment.
          </p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => dialog.current?.close()}>Close</Button>
            <Button type="submit" disabled={busy || !validDates || available < 1}>{busy ? "Please wait…" : quote ? "Continue to payment" : "Calculate total"}</Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
