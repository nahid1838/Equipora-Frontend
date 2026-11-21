import Link from "next/link"
import PublicReviews from "@/components/shared/PublicReviews"
import { Button } from "@/components/ui/button"

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="reviews-heading">
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-primary" />
          Testimonials
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-primary" />
        </p>
        <h2 id="reviews-heading" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          What Our Customers Say
        </h2>
      </div>

      <PublicReviews featured />

      <div className="mt-8 text-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/reviews" />}>
          View all reviews
        </Button>
      </div>
    </section>
  )
}
