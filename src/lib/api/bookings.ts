import { apiRequest, apiRequestList } from "./client"
import { ApiError } from "./errors"
import type { ReviewStatus } from "@/lib/reviews"
import type { RentalType } from "@/types/equipment"

type RentalPeriod = { equipmentId: string; startDate: string; endDate: string; quantity: number }
type CheckoutInput = RentalPeriod & { contactNumber: string; deliveryAddress: string; notes: string; requestKey: string }
type Quote = { totalAmountMinor: number; billableUnits: number; durationDays: number; currency: "usd" }

export type Booking = Quote & {
  _id: string
  equipmentId: string
  equipmentName: string
  customerName: string
  ownerName: string
  startDate: string
  endDate: string
  createdAt: string
  quantity: number
  rentalType: RentalType
  paymentStatus: "paid"
  bookingStatus: "confirmed"
  canReview?: boolean
  reviewStatus?: ReviewStatus | null
  contactNumber: string
  deliveryAddress: string
  notes: string
}

export type BookingRole = "customer" | "owner" | "admin"

export type CheckoutStatus = {
  status: "open" | "processing" | "confirmed" | "expired" | "failed" | "refund_required" | "refund_pending" | "refunded"
  equipmentId: string
}

const checkoutStatuses: CheckoutStatus["status"][] = [
  "open", "processing", "confirmed", "expired", "failed", "refund_required", "refund_pending", "refunded",
]

function validateCheckoutStatus(data: CheckoutStatus): CheckoutStatus {
  if (!data || !checkoutStatuses.includes(data.status) || typeof data.equipmentId !== "string" || !/^[a-f\d]{24}$/i.test(data.equipmentId)) {
    throw new ApiError("Could not read the checkout status.")
  }
  return data
}

export async function getBookingQuote(body: RentalPeriod) {
  const { data } = await apiRequest<Quote>("/api/bookings/quote", { auth: "protected", method: "POST", body })
  return data
}

export async function startBookingCheckout(body: CheckoutInput) {
  const { data } = await apiRequest<{ url: string }>("/api/bookings/checkout", { auth: "protected", method: "POST", body })
  return data.url
}

export async function getCheckoutStatus(id: string, signal: AbortSignal) {
  const { data } = await apiRequest<CheckoutStatus>(`/api/bookings/checkout/${encodeURIComponent(id)}`, { auth: "protected", signal })
  return validateCheckoutStatus(data)
}

// Asks the server to verify the Checkout Session with Stripe and save the
// booking if the webhook has not arrived yet. Safe to call repeatedly.
export async function confirmCheckout(id: string, signal: AbortSignal) {
  const { data } = await apiRequest<CheckoutStatus>(`/api/bookings/checkout/${encodeURIComponent(id)}/confirm`, {
    auth: "protected",
    method: "POST",
    signal,
  })
  return validateCheckoutStatus(data)
}

export function getBookings(role: BookingRole, page: number, signal: AbortSignal) {
  const scope = { customer: "/my", owner: "/owner", admin: "" }[role]
  return apiRequestList<Booking>(`/api/bookings${scope}?page=${page}`, { auth: "protected", signal })
}
