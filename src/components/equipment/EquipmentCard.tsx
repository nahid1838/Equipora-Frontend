"use client"

import { useState } from "react"
import Image from "next/image"
import { Boxes, ImageOff, MapPin } from "lucide-react"
import { cn } from "cn"
import type { Equipment } from "@/types/equipment"

// Shows the rental period next to the price, e.g. "$15 / day".
const RENTAL_PERIODS: Record<Equipment["rentalType"], string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
}

type EquipmentCardProps = {
  equipment: Equipment
  className?: string
}

const EquipmentCard = ({ equipment, className }: EquipmentCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const isAvailable = equipment.availableQuantity > 0

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {imageFailed ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="sr-only">Image unavailable</span>
          </div>
        ) : (
          <Image
            src={equipment.imageUrl}
            alt={equipment.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}

        <span
          className={cn(
            "absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium",
            isAvailable
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {equipment.category}
          </p>
          <h3 className="mt-1 line-clamp-1 font-heading text-lg font-semibold">
            {equipment.name}
          </h3>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="line-clamp-1">{equipment.location}</span>
        </p>

        <div className="flex items-end justify-between gap-3 border-t pt-3">
          <p>
            <span className="font-heading text-xl font-bold">
              ${equipment.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {" "}
              / {RENTAL_PERIODS[equipment.rentalType]}
            </span>
          </p>

          {isAvailable && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" />
              {equipment.availableQuantity} left
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default EquipmentCard
