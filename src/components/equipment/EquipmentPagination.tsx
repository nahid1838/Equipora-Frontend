"use client"

import { Button } from "@/components/ui/button"

type EquipmentPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const EquipmentPagination = ({
  page,
  totalPages,
  onPageChange,
}: EquipmentPaginationProps) => {
  // Nothing to page through.
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Equipment pagination"
      className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}

export default EquipmentPagination
