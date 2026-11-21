import { Star } from "lucide-react"

type ApprovedReview = {
  id: string
  name: string
  rating: number
  comment: string
}

export default function Testimonials({ reviews = [] }: { reviews?: ApprovedReview[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Customer reviews</h2>

      {reviews.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map(({ id, name, rating, comment }) => (
            <li key={id} className="min-w-0 rounded-2xl border bg-card p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Star aria-hidden="true" className="size-4 fill-primary text-primary" />
                {rating} out of 5
              </p>
              <blockquote className="mt-3 text-sm leading-relaxed break-words">{comment}</blockquote>
              <p className="mt-4 text-sm font-semibold break-words">{name}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
          No approved customer reviews are available yet.
        </p>
      )}
    </section>
  )
}
