"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation"
import {
  buildEquipmentQuery,
  getEquipmentList,
  type EquipmentListResponse,
} from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import {
  EQUIPMENT_CATEGORIES,
  RENTAL_TYPES,
  type EquipmentCategory,
  type EquipmentQuery,
  type EquipmentSort,
  type RentalType,
} from "@/types/equipment"
import { EquipmentGridSkeleton } from "./EquipmentCardSkeleton"
import EquipmentFilters, {
  DEFAULT_EQUIPMENT_FILTERS,
  type EquipmentFilterValues,
} from "./EquipmentFilters"
import EquipmentGrid from "./EquipmentGrid"
import EquipmentPagination from "./EquipmentPagination"
import { EquipmentEmptyState, EquipmentErrorState } from "./EquipmentStates"

const SEARCH_DEBOUNCE_MS = 400
const PAGE_LIMIT = 9
const SORT_VALUES: EquipmentSort[] = ["price_asc", "price_desc", "newest"]

type EquipmentRequestResult = {
  query: EquipmentQuery
  reloadKey: number
} & ({ response: EquipmentListResponse } | { error: string })

// URL params are untrusted, so each value is checked before use.
function isCategory(value: string | null): value is EquipmentCategory {
  return (
    value !== null &&
    (EQUIPMENT_CATEGORIES as readonly string[]).includes(value)
  )
}

function isRentalType(value: string | null): value is RentalType {
  return (
    value !== null && (RENTAL_TYPES as readonly string[]).includes(value)
  )
}

function isSort(value: string | null): value is EquipmentSort {
  return value !== null && (SORT_VALUES as readonly string[]).includes(value)
}

function readFilters(
  searchParams: ReadonlyURLSearchParams
): EquipmentFilterValues {
  const category = searchParams.get("category")
  const rentalType = searchParams.get("rentalType")
  const available = searchParams.get("available")
  const sort = searchParams.get("sort")
  const minPrice = toPrice(searchParams.get("minPrice") ?? "")
  const maxPrice = toPrice(searchParams.get("maxPrice") ?? "")

  return {
    search: searchParams.get("search")?.trim() ?? "",
    category: isCategory(category) ? category : "",
    rentalType: isRentalType(rentalType) ? rentalType : "",
    minPrice: minPrice === undefined ? "" : String(minPrice),
    maxPrice: maxPrice === undefined ? "" : String(maxPrice),
    availability:
      available === "true"
        ? "available"
        : available === "false"
          ? "unavailable"
          : "all",
    sort: isSort(sort) ? sort : "newest",
  }
}

function readPage(searchParams: ReadonlyURLSearchParams): number {
  const page = Number(searchParams.get("page"))
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function toPrice(value: string): number | undefined {
  if (!value.trim()) {
    return undefined
  }

  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : undefined
}

// Converts the form values into backend query parameters.
// Empty values are omitted so the backend uses its defaults.
function useEquipmentQuery(
  filters: EquipmentFilterValues,
  search: string,
  page: number
): EquipmentQuery {
  const { category, rentalType, availability, sort } = filters
  const min = toPrice(filters.minPrice)
  const max = toPrice(filters.maxPrice)

  // Ignore an invalid range instead of sending a request the API rejects.
  const priceRangeIsValid = !(
    min !== undefined && max !== undefined && min > max
  )
  const minPrice = priceRangeIsValid ? min : undefined
  const maxPrice = priceRangeIsValid ? max : undefined

  return useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      rentalType: rentalType || undefined,
      minPrice,
      maxPrice,
      available:
        availability === "all" ? undefined : availability === "available",
      sort,
      page,
      limit: PAGE_LIMIT,
    }),
    [search, category, rentalType, minPrice, maxPrice, availability, sort, page]
  )
}

const EquipmentBrowser = () => {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.toString()

  // Initial state comes from the URL, so homepage links like
  // /equipment?search=drill work on first load.
  const [filters, setFilters] = useState<EquipmentFilterValues>(() =>
    readFilters(searchParams)
  )
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    filters.search.trim()
  )
  const [page, setPage] = useState(() => readPage(searchParams))
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlQuery)

  const query = useEquipmentQuery(filters, debouncedSearch, page)
  const nextUrlQuery = buildEquipmentQuery({
    ...query,
    sort: query.sort === DEFAULT_EQUIPMENT_FILTERS.sort ? undefined : query.sort,
    page: page > 1 ? page : undefined,
    limit: undefined,
  })

  // Read external navigation before effects can fetch or write the old filters.
  if (urlQuery !== previousUrlQuery) {
    setPreviousUrlQuery(urlQuery)
    if (urlQuery !== nextUrlQuery) {
      const urlFilters = readFilters(searchParams)
      setFilters(urlFilters)
      setDebouncedSearch(urlFilters.search)
      setPage(readPage(searchParams))
    }
  }

  const [result, setResult] = useState<EquipmentRequestResult | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const currentResult =
    result?.query === query && result.reloadKey === reloadKey ? result : null

  // Wait until the user stops typing before searching.
  const nextSearch = filters.search.trim()
  useEffect(() => {
    if (nextSearch === debouncedSearch) {
      return
    }

    const timeout = setTimeout(() => {
      setDebouncedSearch(nextSearch)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [nextSearch, debouncedSearch])

  // Fetch equipment from the backend whenever the query changes.
  // The normalized query stays stable when raw inputs have the same meaning.
  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    const load = async () => {
      try {
        const response = await getEquipmentList(query, controller.signal)

        if (!isActive) {
          return
        }

        const { page: returnedPage, totalPages } = response.pagination
        if (totalPages > 0 && returnedPage > totalPages) {
          setPage(totalPages)
          return
        }

        setResult({ query, reloadKey, response })
      } catch (error) {
        // Aborted requests are expected when a newer request replaces them.
        if (!isActive || controller.signal.aborted) {
          return
        }

        setResult({
          query,
          reloadKey,
          error:
            error instanceof ApiError
              ? error.message
              : "Something went wrong while loading equipment.",
        })
      }
    }

    load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [query, reloadKey])

  // Keep the URL shareable and in sync with the visible results.
  useEffect(() => {
    if (nextUrlQuery === urlQuery) {
      return
    }

    const url = new URL(window.location.href)
    // Let an intervening navigation reach useSearchParams before writing.
    if (url.searchParams.toString() === urlQuery) {
      url.search = nextUrlQuery
      window.history.replaceState(null, "", url)
    }
  }, [nextUrlQuery, urlQuery])

  const handleFiltersChange = (patch: Partial<EquipmentFilterValues>) => {
    setFilters((current) => ({ ...current, ...patch }))

    // Search resets the page after the debounce delay. Other filters
    // reset it immediately so results update right away.
    if (patch.search === undefined) {
      setPage(1)
    }
  }

  const handleReset = () => {
    setFilters({ ...DEFAULT_EQUIPMENT_FILTERS })
    setDebouncedSearch(DEFAULT_EQUIPMENT_FILTERS.search)
    setPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="space-y-6">
      <EquipmentFilters
        value={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      {!currentResult ? (
        <EquipmentGridSkeleton />
      ) : "error" in currentResult ? (
        <EquipmentErrorState
          message={currentResult.error}
          onRetry={handleRetry}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            {currentResult.response.pagination.total}{" "}
            {currentResult.response.pagination.total === 1 ? "item" : "items"} found
          </p>

          {currentResult.response.data.length === 0 ? (
            <EquipmentEmptyState onReset={query.search || query.category || query.rentalType || query.minPrice !== undefined || query.maxPrice !== undefined || query.available !== undefined ? handleReset : undefined} />
          ) : (
            <>
              <EquipmentGrid equipment={currentResult.response.data} />
              <EquipmentPagination
                page={currentResult.response.pagination.page}
                totalPages={currentResult.response.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default EquipmentBrowser
