"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { useState } from "react"
import type { ApprovedReview } from "@/lib/reviews"

function ReviewAvatar({ name, image }: Pick<ApprovedReview, "name" | "image">) {
  const [failedImage, setFailedImage] = useState<string>()

  if (image && /^https?:\/\//i.test(image) && failedImage !== image) {
    return <Image src={image} alt="" width={44} height={44} unoptimized referrerPolicy="no-referrer" className="size-11 shrink-0 rounded-full border object-cover" onError={() => setFailedImage(image)} />
  }

  return (
    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border bg-secondary text-sm font-bold text-secondary-foreground">
      {name.trim().split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase()}
    </span>
  )
}

export default function ReviewList({ reviews }: { reviews: readonly ApprovedReview[] }) {
  if (reviews.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No approved customer reviews are available yet.
      </p>
    )
  }

  return (
    <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
      {reviews.map(({ id, name, role, image, rating, comment }) => (
        <li key={id} className="flex min-w-0 flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
          <div className="flex gap-1">
            <span className="sr-only">{rating} out of 5 stars</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                aria-hidden="true"
                className={index < rating ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground"}
              />
            ))}
          </div>
          <blockquote className="mt-4 grow text-sm leading-relaxed text-foreground wrap-break-word">
            “{comment}”
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <ReviewAvatar name={name} image={image} />
            <div className="min-w-0 wrap-break-word">
              <p className="text-sm font-bold">{name}</p>
              {role && <p className="text-xs text-muted-foreground">{role}</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
