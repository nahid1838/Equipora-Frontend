// Shared response shapes returned by the Express API.
// Every successful response has `success: true`.
// Every failed response has `success: false` and a readable message.

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Used by endpoints that return data (equipment lists, details, etc.)
export type ApiSuccess<T> = {
  success: true
  data: T
  pagination?: Pagination
}

// Used by endpoints that only return a message (health check, delete, etc.)
export type ApiMessageSuccess = {
  success: true
  message: string
}

export type ApiErrorResponse = {
  success: false
  message: string
}

export type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiMessageSuccess
  | ApiErrorResponse
