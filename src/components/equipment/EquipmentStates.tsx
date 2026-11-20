"use client"

import { AlertCircle, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

type EquipmentEmptyStateProps = {
  onReset?: () => void
}

export const EquipmentEmptyState = ({ onReset }: EquipmentEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        No equipment found
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try a different search term or adjust your filters.
      </p>
      {onReset && (
        <Button type="button" variant="outline" className="mt-5" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

type EquipmentErrorStateProps = {
  message: string
  onRetry: () => void
}

export const EquipmentErrorState = ({
  message,
  onRetry,
}: EquipmentErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        Could not load equipment
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
