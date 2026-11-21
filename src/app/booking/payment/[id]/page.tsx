"use client"

import { Suspense, use, useEffect, useState } from "react"
import Link from "next/link"
import { redirect, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { confirmCheckout, getCheckoutStatus, type CheckoutStatus } from "@/lib/api/bookings"

const messages = {
  open: ["Payment not confirmed", "Stripe has not confirmed a payment for this checkout. If money left your account, check again in a moment."],
  processing: ["Confirming your booking", "Your payment was received. The booking is still being saved."],
  confirmed: ["Booking confirmed", "Your payment was verified and your rental is listed in My Rentals."],
  expired: ["Checkout expired", "A booking was not created. Return to the equipment page to start again."],
  failed: ["Payment unsuccessful", "A booking was not created. You can return to the equipment page to try again."],
  refund_required: ["Payment received, booking unavailable", "A booking could not be created. Your payment has been recorded for refund review."],
  refund_pending: ["Refund pending", "A booking was not created. Stripe is processing your refund."],
  refunded: ["Payment refunded", "A booking was not created and Stripe has issued a refund to your original payment method."],
}

const pollable: CheckoutStatus["status"][] = ["open", "processing", "refund_pending"]
const POLL_INTERVAL_MS = 2500
const POLL_LIMIT_MS = 60_000

type Props = { params: Promise<{ id: string }> }

function PaymentLoading() {
  return (
    <div role="status" className="space-y-4 rounded-2xl border bg-card p-6 sm:p-8">
      <p className="font-heading text-2xl font-bold">Checking payment…</p>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-5 w-4/5 rounded bg-muted" />
        <div className="h-9 w-36 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function PaymentStatus({ id }: { id: string }) {
  const cancelled = useSearchParams().get("cancelled") === "1"
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<CheckoutStatus | ApiError | null>(null)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const startedAt = Date.now()
    let active = true

    async function check() {
      try {
        // Confirming asks the server to verify the Checkout Session with
        // Stripe, so the booking is saved even without a local webhook.
        const firstCheck = cancelled && attempt === 0 ? getCheckoutStatus : confirmCheckout
        let status = await firstCheck(id, controller.signal)
        if (!active) return
        setResult(status)

        while (active && !cancelled && pollable.includes(status.status) && Date.now() - startedAt < POLL_LIMIT_MS) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
          if (!active) return
          status = await confirmCheckout(id, controller.signal)
          if (!active) return
          setResult(status)
        }
      } catch (error: unknown) {
        if (!active) return
        setResult(error instanceof ApiError ? error : new ApiError("Could not check payment."))
      } finally {
        if (active) setSettled(true)
      }
    }

    void check()
    return () => {
      active = false
      controller.abort()
    }
  }, [id, attempt, cancelled])

  if (result instanceof ApiError && result.status === 401) {
    redirect(`/sign-in?${new URLSearchParams({ returnTo: `/booking/payment/${encodeURIComponent(id)}` })}`)
  }

  if (!result) return <PaymentLoading />

  const waiting = !(result instanceof ApiError) && !settled && !cancelled && pollable.includes(result.status)
  const missing = result instanceof ApiError && [400, 403, 404].includes(result.status ?? 0)
  const [title, description] = result instanceof ApiError
    ? missing
      ? ["Checkout unavailable", "This checkout could not be found for your account. Check the link or open My Rentals."]
      : ["Could not check payment", "We couldn’t verify the status right now. Check again before starting another payment."]
    : cancelled && result.status === "open" ? ["You left Checkout", "No payment has been confirmed for this checkout."]
    : waiting && result.status === "open" ? ["Checking payment status", "We’re waiting for Stripe to confirm the payment."]
    : messages[result.status]

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6 sm:p-8">
      <h1 className="font-heading text-2xl font-bold">{title}</h1>
      <p role={result instanceof ApiError ? "alert" : "status"} className="text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        {!(result instanceof ApiError) && (
          <Button nativeButton={false} render={<Link href={result.status === "confirmed" ? "/dashboard/customer/rentals" : `/equipment/${result.equipmentId}`} />}>
            {result.status === "confirmed" ? "My Rentals" : "Back to equipment"}
          </Button>
        )}
        {missing && <Button nativeButton={false} render={<Link href="/dashboard/customer/rentals" />}>My Rentals</Button>}
        {(result instanceof ApiError ? !missing : ["open", "processing", "refund_pending", "refund_required"].includes(result.status)) && (
          <Button type="button" variant="outline" onClick={() => {
            setSettled(false)
            setResult(null)
            setAttempt((current) => current + 1)
          }}>Check payment status</Button>
        )}
      </div>
      {waiting && <p className="text-xs text-muted-foreground">This page checks automatically for up to one minute.</p>}
    </section>
  )
}

function PaymentContent({ params }: Props) {
  const { id } = use(params)
  return <PaymentStatus key={id} id={id} />
}

export default function PaymentStatusPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Suspense fallback={<PaymentLoading />}>
        <PaymentContent params={params} />
      </Suspense>
    </div>
  )
}
