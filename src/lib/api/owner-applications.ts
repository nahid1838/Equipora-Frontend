import { apiRequest, apiRequestList } from "./client"

export type ApplicationInput = { businessName: string; reason: string; additionalInformation: string }
export type OwnerApplication = ApplicationInput & {
  _id: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  reviewedAt?: string
  approvalStarted: boolean
}
type AdminApplication = OwnerApplication & { applicant: { name: string; email: string } | null }
export type ApplicationDecision = "approved" | "rejected"

export const getMyApplication = (signal: AbortSignal) =>
  apiRequest<{ application: OwnerApplication | null; hasOwnerAccess: boolean }>("/api/owner-applications/me", { auth: "protected", signal })

export const submitApplication = (body: ApplicationInput) =>
  apiRequest<OwnerApplication>("/api/owner-applications", { auth: "protected", method: "POST", body })

export const getOwnerApplications = (page: number, signal: AbortSignal) =>
  apiRequestList<AdminApplication>(`/api/admin/owner-applications?page=${page}`, { auth: "protected", signal })

export const reviewApplication = (id: string, status: ApplicationDecision) =>
  apiRequest<OwnerApplication>(`/api/admin/owner-applications/${encodeURIComponent(id)}`, { auth: "protected", method: "PATCH", body: { status } })
