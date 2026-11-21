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
        <SearchX aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        No equipment found
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {onReset ? "Try a different search term or adjust your filters." : "There are no approved listings to browse right now."}
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
  title?: string
}

export const EquipmentErrorState = ({
  message,
  onRetry,
  title = "Could not load equipment",
}: EquipmentErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        {title}
      </h2>
      <p role="alert" className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
