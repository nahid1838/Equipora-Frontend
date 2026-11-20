import type { ApiSuccess, Pagination } from "@/types/api"
import type { CreateEquipmentPayload, Equipment, EquipmentQuery, EquipmentStatus, UpdateEquipmentPayload } from "@/types/equipment"
import { apiRequest, apiRequestMessage } from "./client"
import { ApiError } from "./errors"

export async function getAdminEquipment(signal?: AbortSignal): Promise<Equipment[]> {
  const { data } = await apiRequest<Equipment[]>("/api/equipment/admin/all", {
    auth: "protected", signal,
  })
  return data
}

export async function moderateEquipment(
  id: string,
  status: Exclude<EquipmentStatus, "pending">
): Promise<Equipment> {
  const { data } = await apiRequest<Equipment | null>(`/api/equipment/${encodeURIComponent(id)}/status`, {
    auth: "protected", method: "PATCH", body: { status },
  })
  if (!data) throw new ApiError("Equipment not found.", { status: 404 })
  return data
}

export async function getOwnedEquipment(signal?: AbortSignal): Promise<Equipment[]> {
  const { data } = await apiRequest<Equipment[]>("/api/equipment/owner/mine", {
    auth: "protected", signal,
  })
  return data
}

export async function createEquipment(body: CreateEquipmentPayload): Promise<Equipment> {
  const { data } = await apiRequest<Equipment>("/api/equipment", {
    auth: "protected", method: "POST", body,
  })
  return data
}

export async function updateEquipment(id: string, body: UpdateEquipmentPayload): Promise<Equipment> {
  const { data } = await apiRequest<Equipment | null>(`/api/equipment/${encodeURIComponent(id)}`, {
    auth: "protected", method: "PATCH", body,
  })
  if (!data) throw new ApiError("Equipment not found.", { status: 404 })
  return data
}

export async function deleteEquipment(id: string): Promise<void> {
  await apiRequestMessage(`/api/equipment/${encodeURIComponent(id)}`, {
    auth: "protected", method: "DELETE",
  })
}

export async function uploadEquipmentImage(image: string): Promise<string> {
  const { data } = await apiRequest<{ url: string }>("/api/uploads/image", {
    auth: "protected", method: "POST", body: { image },
  })
  return data.url
}

export async function getEquipmentDetails(
  id: string,
  signal?: AbortSignal
): Promise<Equipment> {
  if (!/^[\da-f]{24}$/i.test(id)) {
    throw new ApiError("This equipment link has an invalid ID.", { status: 400 })
  }

  const { data } = await apiRequest<Equipment>(
    `/api/equipment/${encodeURIComponent(id)}`,
    { auth: "protected", signal }
  )

  return data
}

// The equipment list always comes back with pagination metadata.
// apiRequest() types pagination as optional, so we require it here.
export type EquipmentListResponse = ApiSuccess<Equipment[]> & {
  pagination: Pagination
}

// Builds the query string for GET /api/equipment.
// Empty values are skipped so the backend can use its defaults.
export function buildEquipmentQuery(query: EquipmentQuery): string {
  const params = new URLSearchParams()

  const search = query.search?.trim()
  if (search) {
    params.set("search", search)
  }

  if (query.category) {
    params.set("category", query.category)
  }

  if (query.rentalType) {
    params.set("rentalType", query.rentalType)
  }

  if (typeof query.minPrice === "number" && Number.isFinite(query.minPrice)) {
    params.set("minPrice", String(query.minPrice))
  }

  if (typeof query.maxPrice === "number" && Number.isFinite(query.maxPrice)) {
    params.set("maxPrice", String(query.maxPrice))
  }

  if (typeof query.available === "boolean") {
    params.set("available", query.available ? "true" : "false")
  }

  if (query.sort) {
    params.set("sort", query.sort)
  }

  if (typeof query.page === "number" && Number.isInteger(query.page)) {
    params.set("page", String(query.page))
  }

  if (typeof query.limit === "number" && Number.isInteger(query.limit)) {
    params.set("limit", String(query.limit))
  }

  return params.toString()
}

// Public call: only approved equipment is returned by the backend.
// The optional signal lets the page cancel stale requests.
export async function getEquipmentList(
  query: EquipmentQuery = {},
  signal?: AbortSignal
): Promise<EquipmentListResponse> {
  const queryString = buildEquipmentQuery(query)
  const path = queryString
    ? `/api/equipment?${queryString}`
    : "/api/equipment"

  const result = await apiRequest<Equipment[]>(path, {
    auth: "public",
    signal,
  })

  if (!result.pagination) {
    throw new ApiError(
      "The server response did not include pagination information."
    )
  }

  return {
    success: true,
    data: result.data,
    pagination: result.pagination,
  }
}
