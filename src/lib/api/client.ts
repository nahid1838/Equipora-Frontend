import { authClient } from "@/lib/auth-client"
import type {
  ApiMessageSuccess,
  ApiSuccess,
  Pagination,
} from "@/types/api"
import { getApiBaseUrl } from "./config"
import { ApiError } from "./errors"

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

// `auth` is required on purpose:
// - "public"    -> no JWT is requested or sent
// - "protected" -> a fresh JWT is requested for this request only
export type ApiRequestOptions = {
  auth: "public" | "protected"
  method?: HttpMethod
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

type ParsedBody =
  | { kind: "json"; value: unknown }
  | { kind: "empty" }
  | { kind: "invalid" }

type JsonObject = Record<string, unknown>

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPagination(value: unknown): value is Pagination {
  return (
    isRecord(value) &&
    typeof value.page === "number" &&
    typeof value.limit === "number" &&
    typeof value.total === "number" &&
    typeof value.totalPages === "number"
  )
}

// Returns the backend's own message when it sent the standard error shape.
function getBackendMessage(payload: unknown): string | null {
  if (!isRecord(payload) || payload.success !== false) {
    return null
  }

  const message = payload.message
  return typeof message === "string" && message.trim() ? message.trim() : null
}

// Friendly fallbacks for errors that do not include a readable message.
function getFallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request was invalid. Please check the information and try again."
    case 401:
      return "You must be signed in to do that."
    case 403:
      return "You do not have permission to do that."
    case 404:
      return "The requested resource was not found."
    case 413:
      return "The request is too large."
    case 500:
      return "Something went wrong on the server. Please try again."
    case 502:
      return "An external service failed. Please try again later."
    default:
      return `The request failed with status ${status}.`
  }
}

// Gets a new JWT immediately before a protected request.
// The token is never stored, cached, or logged.
async function getFreshAccessToken(): Promise<string> {
  let result

  try {
    // Better Auth 1.7 returns { data: { token }, error } or
    // { data: null, error } — inspected in the installed package.
    result = await authClient.token()
  } catch {
    throw new ApiError(
      "Could not verify your session. Please sign in again.",
      { status: 401 }
    )
  }

  const token = result.data?.token.trim()

  if (result.error || !token) {
    throw new ApiError("You must be signed in to perform this action.", {
      status: 401,
    })
  }

  return token
}

async function readBody(response: Response): Promise<ParsedBody> {
  let text: string

  try {
    text = await response.text()
  } catch {
    return { kind: "invalid" }
  }

  if (!text.trim()) {
    return { kind: "empty" }
  }

  try {
    return { kind: "json", value: JSON.parse(text) }
  } catch {
    return { kind: "invalid" }
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

// Sends the request and returns the parsed success body.
// This is internal: the public helpers below return narrower types.
async function requestSuccess(
  path: string,
  options: ApiRequestOptions
): Promise<JsonObject> {
  const url = `${getApiBaseUrl()}${normalizePath(path)}`
  const method = options.method ?? "GET"
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  let bodyText: string | undefined

  if (options.body !== undefined) {
    try {
      bodyText = JSON.stringify(options.body)
    } catch {
      throw new ApiError("The request body could not be converted to JSON.")
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }
  }

  if (options.auth === "protected") {
    const token = await getFreshAccessToken()
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(url, {
      method,
      headers,
      body: bodyText,
      signal: options.signal,
    })
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      { isNetworkError: true }
    )
  }

  const parsed = await readBody(response)

  // HTTP errors: prefer the backend's message, otherwise use a friendly one.
  if (!response.ok) {
    const backendMessage =
      parsed.kind === "json" ? getBackendMessage(parsed.value) : null

    throw new ApiError(
      backendMessage ?? getFallbackMessage(response.status),
      { status: response.status }
    )
  }

  if (parsed.kind === "empty") {
    throw new ApiError("The server returned an empty response.", {
      status: response.status,
    })
  }

  if (parsed.kind === "invalid") {
    throw new ApiError("The server returned an invalid JSON response.", {
      status: response.status,
    })
  }

  if (!isRecord(parsed.value) || parsed.value.success !== true) {
    throw new ApiError(
      getBackendMessage(parsed.value) ??
        "The server returned an unexpected response.",
      { status: response.status }
    )
  }

  return parsed.value
}

// For endpoints that return data, for example:
//   const result = await apiRequest<Equipment[]>("/api/equipment", {
//     auth: "public",
//   })
//   result.data       -> Equipment[]
//   result.pagination -> optional pagination
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions
): Promise<ApiSuccess<T>> {
  const payload = await requestSuccess(path, options)

  if (!("data" in payload)) {
    throw new ApiError("The server response did not include data.")
  }

  const result: ApiSuccess<T> = {
    success: true,
    data: payload.data as T,
  }

  if (isPagination(payload.pagination)) {
    result.pagination = payload.pagination
  }

  return result
}

// For endpoints that only return a message (health check, delete, etc.):
//   const result = await apiRequestMessage("/api/health", { auth: "public" })
//   result.message
export async function apiRequestMessage(
  path: string,
  options: ApiRequestOptions
): Promise<ApiMessageSuccess> {
  const payload = await requestSuccess(path, options)
  const message = payload.message

  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError("The server response did not include a message.")
  }

  return { success: true, message: message.trim() }
}
