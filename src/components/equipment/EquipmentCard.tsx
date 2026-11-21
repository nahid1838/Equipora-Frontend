"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Boxes, CalendarDays, ImageOff, MapPin } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import type { EquipmentCardItem } from "@/types/equipment"

// Shows the rental period next to the price, e.g. "$15 / day".
const RENTAL_PERIODS: Record<EquipmentCardItem["rentalType"], string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
}

type EquipmentCardProps = {
  equipment: EquipmentCardItem
  className?: string
  action?: ReactNode
}

const EquipmentCard = ({ equipment, className, action }: EquipmentCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const isAvailable = equipment.availableQuantity > 0
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0.85, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-[translate,box-shadow,border-color] hover:border-primary/30 hover:shadow-lg focus-within:border-ring motion-safe:hover:-translate-y-1 motion-reduce:transform-none! motion-reduce:opacity-100!",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b bg-gradient-to-br from-muted via-muted/55 to-accent/45">
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
            className="object-contain p-3 pt-9 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]"
            onError={() => setImageFailed(true)}
          />
        )}

        <span
          className={cn(
            "absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs font-semibold shadow-sm",
            isAvailable
              ? "bg-secondary text-secondary-foreground"
              : "bg-card text-muted-foreground"
          )}
        >
          {isAvailable && <CalendarDays aria-hidden="true" className="size-3.5" />}
          {isAvailable ? "Check dates" : "No stock"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="inline-flex rounded-md bg-accent px-2 py-1 text-[0.68rem] font-semibold tracking-wide text-accent-foreground uppercase">
            {equipment.category}
          </p>
          <h3 className="mt-2 font-heading text-lg leading-snug font-semibold tracking-tight wrap-break-word">
            {equipment.name}
          </h3>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 wrap-break-word">{equipment.location}</span>
        </p>

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2 border-t pt-4">
          <p>
            <span className="font-heading text-2xl font-bold tracking-tight tabular-nums">
              ${equipment.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {" "}
              / {RENTAL_PERIODS[equipment.rentalType]}
            </span>
          </p>

          {isAvailable && (
            <p className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              <Boxes aria-hidden="true" className="size-3.5" />
              {equipment.availableQuantity} total stock
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          className="h-11 w-full justify-between rounded-xl px-4 font-semibold motion-reduce:transition-none motion-reduce:active:translate-y-0"
          nativeButton={false}
          render={<Link href={`/equipment/${equipment._id}`} />}
        >
          View Details
          <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
        </Button>
        {action}
      </div>
    </motion.article>
  )
}

export default EquipmentCard
