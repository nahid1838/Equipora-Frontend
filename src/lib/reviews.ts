import { apiRequest, apiRequestList } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"

export type ReviewStatus = "pending" | "approved" | "rejected"
export type ReviewDecision = Exclude<ReviewStatus, "pending">
export type ApprovedReview = {
  id: string
  name: string
  role?: string
  image?: string
  rating: number
  comment: string
  publishedAt: string
}
export type PendingReview = Pick<ApprovedReview, "id" | "name" | "rating" | "comment"> & {
  equipmentName: string
  createdAt: string
}

async function getReviewPage<T>(path: string, auth: "public" | "protected", page: number, signal: AbortSignal) {
  const { data, pagination } = await apiRequestList<T>(path, { auth, signal })
  if (!pagination || pagination.page !== page || !Number.isSafeInteger(pagination.totalPages) || pagination.totalPages < 0) {
    throw new ApiError("Could not read the review results. Please try again.")
  }
  return { data, pagination }
}

export const getPublicReviews = (page: number, limit: number, signal: AbortSignal) =>
  getReviewPage<ApprovedReview>(`/api/reviews?page=${page}&limit=${limit}`, "public", page, signal)

export const submitReview = (bookingId: string, rating: number, comment: string) =>
  apiRequest<{ status: "pending" }>("/api/reviews", {
    auth: "protected", method: "POST", body: { bookingId, rating, comment },
  })

export const getPendingReviews = (page: number, signal: AbortSignal) =>
  getReviewPage<PendingReview>(`/api/admin/reviews?page=${page}`, "protected", page, signal)

export const moderateReview = (id: string, status: ReviewDecision) =>
  apiRequest<{ status: ReviewDecision }>(`/api/admin/reviews/${encodeURIComponent(id)}`, {
    auth: "protected", method: "PATCH", body: { status },
  })
