"use client"

import { RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  EQUIPMENT_CATEGORIES,
  RENTAL_TYPES,
  type EquipmentCategory,
  type EquipmentSort,
  type RentalType,
} from "@/types/equipment"

// String values keep the form controls simple.
// The browser component converts them into backend query values.
export type EquipmentFilterValues = {
  search: string
  category: EquipmentCategory | ""
  rentalType: RentalType | ""
  minPrice: string
  maxPrice: string
  availability: "all" | "available" | "unavailable"
  sort: EquipmentSort
}

export const DEFAULT_EQUIPMENT_FILTERS: EquipmentFilterValues = {
  search: "",
  category: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  sort: "newest",
}

const SORT_OPTIONS: { value: EquipmentSort; label: string }[] = [
  { value: "newest", label: "Recently added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const labelClassName = "space-y-1.5 text-sm font-medium"

type EquipmentFiltersProps = {
  value: EquipmentFilterValues
  onChange: (patch: Partial<EquipmentFilterValues>) => void
  onReset: () => void
}

const EquipmentFilters = ({
  value,
  onChange: update,
  onReset,
}: EquipmentFiltersProps) => {
  const minPrice = Number(value.minPrice)
  const maxPrice = Number(value.maxPrice)
  const minPriceInvalid = !Number.isFinite(minPrice) || minPrice < 0
  const maxPriceInvalid = !Number.isFinite(maxPrice) || maxPrice < 0
  const hasPriceRange = value.minPrice !== "" && value.maxPrice !== ""
  const priceRangeInvalid = hasPriceRange && minPrice > maxPrice
  const priceError = minPriceInvalid || maxPriceInvalid
    ? "Enter prices of 0 or more."
    : priceRangeInvalid
      ? "Minimum price cannot be greater than maximum price."
      : undefined

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
      {/* Search */}
      <div className="space-y-1.5">
        <label htmlFor="equipment-search" className="text-sm font-medium">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="equipment-search"
            type="search"
            value={value.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Search by equipment name or location"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <label className={labelClassName}>
          <span>Category</span>
          <select
            value={value.category}
            onChange={(event) =>
              update({
                category: event.target.value as EquipmentCategory | "",
              })
            }
            className={selectClassName}
          >
            <option value="">All categories</option>
            {EQUIPMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        {/* Rental type */}
        <label className={labelClassName}>
          <span>Rental type</span>
          <select
            value={value.rentalType}
            onChange={(event) =>
              update({
                rentalType: event.target.value as RentalType | "",
              })
            }
            className={selectClassName}
          >
            <option value="">All rental types</option>
            {RENTAL_TYPES.map((rentalType) => (
              <option key={rentalType} value={rentalType}>
                {rentalType.charAt(0).toUpperCase() + rentalType.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {/* Availability */}
        <label className={labelClassName}>
          <span>Availability</span>
          <select
            value={value.availability}
            onChange={(event) =>
              update({
                availability: event.target.value as
                  | "all"
                  | "available"
                  | "unavailable",
              })
            }
            className={selectClassName}
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>

        {/* Sort */}
        <label className={labelClassName}>
          <span>Sort by</span>
          <select
            value={value.sort}
            onChange={(event) =>
              update({ sort: event.target.value as EquipmentSort })
            }
            className={selectClassName}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Price range */}
        <div className="space-y-1.5">
          <span className="text-sm font-medium">Price range</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              step="any"
              value={value.minPrice}
              onChange={(event) => update({ minPrice: event.target.value })}
              placeholder="Min"
              aria-label="Minimum price"
              aria-invalid={minPriceInvalid || priceRangeInvalid}
              aria-describedby={priceError ? "equipment-price-error" : undefined}
              className="w-28"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="number"
              min={0}
              step="any"
              value={value.maxPrice}
              onChange={(event) => update({ maxPrice: event.target.value })}
              placeholder="Max"
              aria-label="Maximum price"
              aria-invalid={maxPriceInvalid || priceRangeInvalid}
              aria-describedby={priceError ? "equipment-price-error" : undefined}
              className="w-28"
            />
          </div>
          {priceError && (
            <p id="equipment-price-error" className="text-xs text-destructive">
              {priceError}
            </p>
          )}
        </div>

        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw data-icon="inline-start" className="h-4 w-4" />
          Reset filters
        </Button>
      </div>
    </section>
  )
}

export default EquipmentFilters
