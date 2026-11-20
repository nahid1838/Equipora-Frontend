// A small error type used by every API request.
// It keeps the HTTP status (when there is one) and a readable message.
export type ApiErrorOptions = {
  status?: number | null
  isNetworkError?: boolean
}

export class ApiError extends Error {
  readonly status: number | null
  readonly isNetworkError: boolean

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = "ApiError"
    this.status = options.status ?? null
    this.isNetworkError = options.isNetworkError ?? false
  }
}
