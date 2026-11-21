"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import TableSkeleton from "@/components/shared/TableSkeleton"
import { EquipmentErrorState } from "@/components/equipment/EquipmentStates"
import { getBookings, type Booking, type BookingRole } from "@/lib/api/bookings"
import { ApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/types/api"
import ReviewForm from "./ReviewForm"

const columns = ["Equipment Name", "Rental Start Date", "Rental End Date", "Booking Date", "Total Amount", "Payment Status", "Booking Status"]
const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", dateStyle: "medium" })
const dateLabel = (value: string) => date.format(new Date(value))

function RentalRow({ booking, role, onReviewChange }: { booking: Booking; role: BookingRole; onReviewChange: () => void }) {
  const [writingReview, setWritingReview] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const reviewStatus = submitted ? "pending" : booking.reviewStatus
  return (
    <tr>
      <th scope="row" className="min-w-48 px-4 py-3 align-top">
        <span>{booking.equipmentName}</span>
        <details className="mt-1 text-xs font-normal text-muted-foreground">
          <summary className="cursor-pointer">Rental details</summary>
          <dl className="mt-2 space-y-1 break-words">
            <div><dt className="inline font-medium">Quantity </dt><dd className="inline">{booking.quantity}</dd></div>
            <div><dt className="inline font-medium">Contact </dt><dd className="inline">{booking.contactNumber}</dd></div>
            <div><dt className="inline font-medium">Delivery </dt><dd className="inline">{booking.deliveryAddress}</dd></div>
            {booking.notes && <div><dt className="inline font-medium">Notes </dt><dd className="inline">{booking.notes}</dd></div>}
          </dl>
        </details>
        {role === "customer" && reviewStatus && <p role="status" className="mt-2 text-xs font-medium text-muted-foreground">Review {reviewStatus}</p>}
        {role === "customer" && !reviewStatus && booking.canReview && (
          writingReview ? <ReviewForm bookingId={booking._id} onClose={() => setWritingReview(false)} onConflict={onReviewChange} onSubmitted={() => {
            setWritingReview(false)
            setSubmitted(true)
          }} /> : <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setWritingReview(true)}>Write a review</Button>
        )}
      </th>
      {role !== "customer" && <td className="min-w-36 px-4 py-3 align-top">{booking.customerName}</td>}
      {role === "admin" && <td className="min-w-36 px-4 py-3 align-top">{booking.ownerName}</td>}
      <td className="px-4 py-3 align-top whitespace-nowrap">{dateLabel(booking.startDate)}</td>
      <td className="px-4 py-3 align-top whitespace-nowrap">{dateLabel(booking.endDate)}</td>
      <td className="px-4 py-3 align-top whitespace-nowrap">{dateLabel(booking.createdAt)}</td>
      <td className="px-4 py-3 align-top whitespace-nowrap">{new Intl.NumberFormat("en-US", { style: "currency", currency: booking.currency }).format(booking.totalAmountMinor / 100)}</td>
      <td className="px-4 py-3 align-top capitalize">{booking.paymentStatus}</td>
      <td className="px-4 py-3 align-top capitalize">{booking.bookingStatus}</td>
    </tr>
  )
}

export default function RentalBookings({ role }: { role: BookingRole }) {
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<ApiSuccess<Booking[]> | ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getBookings(role, page, controller.signal)
      .then((response) => { if (!controller.signal.aborted) setResult(response) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult(error instanceof ApiError ? error : new ApiError("Could not load rentals."))
      })
    return () => controller.abort()
  }, [role, page, attempt])

  if (!result) return <TableSkeleton label="Loading rentals…" columns={role === "customer" ? 7 : role === "owner" ? 8 : 9} />
  if (result instanceof ApiError) {
    if (result.status === 401) redirect(`/sign-in?${new URLSearchParams({ returnTo: `/dashboard/${role}/rentals` })}`)
    if (result.status === 403) redirect("/dashboard")
    return <EquipmentErrorState title="Could not load rentals" message={result.message} onRetry={() => {
      setResult(null)
      setAttempt((current) => current + 1)
    }} />
  }

  const headers = role === "customer" ? columns : [columns[0], "Customer", ...(role === "admin" ? ["Owner"] : []), ...columns.slice(1)]
  const totalPages = result.pagination?.totalPages ?? 0
  const changePage = (next: number) => {
    setResult(null)
    setPage(next)
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card" aria-labelledby="rental-history">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-7">
        <h2 id="rental-history" className="font-heading text-xl font-semibold">Rental history</h2>
        {role === "customer" && <Button variant="outline" nativeButton={false} render={<Link href="/equipment" />}>Browse equipment</Button>}
      </header>
      {result.data.length === 0 ? <div className="border-t px-5 py-10 text-center">
        <h3 className="font-heading font-semibold">{page > 1 ? "No rentals on this page" : "No rentals yet"}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{page > 1 ? "Go back to see earlier rentals." : role === "customer" ? "Your confirmed rentals will appear here." : "Confirmed bookings will appear here when equipment is rented."}</p>
      </div> : (
        <div role="region" aria-labelledby="rental-history" tabIndex={0} className="overflow-x-auto border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>{headers.map((column) => <th key={column} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y">{result.data.map((booking) => <RentalRow key={booking._id} booking={booking} role={role} onReviewChange={() => {
              setResult(null)
              setAttempt((value) => value + 1)
            }} />)}</tbody>
          </table>
        </div>
      )}
      {(totalPages > 1 || page > 1) && (
        <nav aria-label="Rental history pages" className="flex flex-wrap items-center justify-between gap-2 border-t p-4 text-sm">
          <Button type="button" variant="outline" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</Button>
          <span>{page <= totalPages ? `Page ${page} of ${totalPages}` : "No results on this page"}</span>
          <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</Button>
        </nav>
      )}
    </section>
  )
}
