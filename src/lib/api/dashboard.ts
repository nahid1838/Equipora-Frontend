import { apiRequest, apiRequestList } from "./client"
import { ApiError } from "./errors"

export const USER_ROLES = ["customer", "owner", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]
export type AdminUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export function getAdminUsers(query: { search: string; role: UserRole | ""; page: number }, signal: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page) })
  if (query.search) params.set("search", query.search)
  if (query.role) params.set("role", query.role)
  return apiRequestList<AdminUser>(`/api/admin/users?${params}`, { auth: "protected", signal })
}

export async function updateUserRole(id: string, role: UserRole) {
  const { data } = await apiRequest<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    auth: "protected", method: "PATCH", body: { role },
  })
  return data
}

type MonthlyPoint = { month: string; label: string; bookings: number }
type AnalyticsTotals = { totalEquipment: number; completedRentals: number; currency: "usd" }
type AdminAnalytics = AnalyticsTotals & {
  totalUsers: number
  totalBookings: number
  pendingApprovals: number
  totalRevenueMinor: number
  monthly: (MonthlyPoint & { revenueMinor: number })[]
}
type OwnerAnalytics = AnalyticsTotals & {
  totalEarningsMinor: number
  monthly: (MonthlyPoint & { earningsMinor: number })[]
}

export async function getDashboardAnalytics(role: "admin" | "owner", signal: AbortSignal) {
  if (role === "admin") {
    const { data } = await apiRequest<AdminAnalytics>("/api/analytics/admin", { auth: "protected", signal })
    if (data?.currency !== "usd" || !Array.isArray(data.monthly)) throw new ApiError("We could not read the analytics. Please try again.")
    return { role, data } as const
  }
  const { data } = await apiRequest<OwnerAnalytics>("/api/analytics/owner", { auth: "protected", signal })
  if (data?.currency !== "usd" || !Array.isArray(data.monthly)) throw new ApiError("We could not read the analytics. Please try again.")
  return { role, data } as const
}
