import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const columns = [
  "Equipment",
  "Start date",
  "End date",
  "Booking date",
  "Total amount",
  "Payment status",
  "Booking status",
]

export default function CustomerRentals() {
  return (
    <section aria-labelledby="rental-history" className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-7">
        <div>
          <h2 id="rental-history" className="font-heading text-xl font-semibold">Rental history</h2>
          <p id="rental-history-status" className="mt-1 text-sm text-muted-foreground">
            Rental history will be available when equipment booking opens.
          </p>
        </div>
        <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/equipment" />}>
          Browse equipment
          <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </div>

      <div
        role="region"
        aria-labelledby="rental-history"
        tabIndex={0}
        className="overflow-x-auto border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <table className="w-full text-left text-sm" aria-describedby="rental-history-status">
          <thead className="border-b bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="whitespace-nowrap px-5 py-3 font-medium sm:px-6">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-muted-foreground sm:px-6">
                No rental records to display.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
