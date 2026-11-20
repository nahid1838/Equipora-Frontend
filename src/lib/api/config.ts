import { ApiError } from "./errors"

// Removes trailing slashes so paths can be joined safely:
// "http://localhost:5000/" -> "http://localhost:5000"
const TRAILING_SLASHES = /\/+$/

// Reads the backend URL from the frontend environment.
// Next.js only exposes variables prefixed with NEXT_PUBLIC_ to the browser.
export function getApiBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (!rawUrl) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Add it to the frontend .env file."
    )
  }

  const baseUrl = rawUrl.replace(TRAILING_SLASHES, "")

  try {
    const parsed = new URL(baseUrl)

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Unsupported protocol")
    }
  } catch {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL must be a valid http or https URL."
    )
  }

  return baseUrl
}
