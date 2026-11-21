"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AlignLeft, ArrowLeft, Boxes, ClipboardList, ImageOff, MapPin, SlidersHorizontal, UserRound } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getEquipmentDetails } from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import type { Equipment } from "@/types/equipment"
import { EquipmentErrorState } from "./EquipmentStates"
import FavoriteButton from "./FavoriteButton"
import BookingModal from "./BookingModal"

const rentalPeriods = { daily: "day", weekly: "week", monthly: "month" }

export function EquipmentDetailsLoading() {
  return (
    <div role="status" className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
      <span className="sr-only">Loading equipment details…</span>
      <div aria-hidden="true" className="aspect-[5/4] rounded-2xl border bg-muted motion-safe:animate-pulse sm:aspect-[4/3] lg:aspect-auto lg:min-h-96" />
      <div aria-hidden="true" className="grid content-center gap-5 rounded-2xl border bg-card p-5 motion-safe:animate-pulse sm:p-7 lg:p-8">
        <div className="h-5 w-28 rounded-md bg-muted" />
        <div className="h-14 w-4/5 rounded-lg bg-muted" />
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-11 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

function DetailsView({ equipment, signInUrl }: { equipment: Equipment; signInUrl?: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  const { name, category, location, price, rentalType, availableQuantity } = equipment
  const specifications = [
    { label: "Condition", value: equipment.condition },
    { label: "Brand", value: equipment.brand },
    { label: "Model", value: equipment.model },
  ]

  const reduceMotion = useReducedMotion()
  const entrance = {
    initial: reduceMotion ? false as const : { opacity: 0.88, y: 7 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.3, ease: "easeOut" as const },
  }
  const panel = "min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-7"
  const sectionTitle = "flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight"
  const sectionCopy = "mt-3 whitespace-pre-wrap wrap-break-word leading-relaxed text-muted-foreground"

  return (
    <div className="space-y-5 sm:space-y-7">
      <motion.div {...entrance} className="grid items-stretch gap-5 motion-reduce:transform-none! motion-reduce:opacity-100! lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
        <div className="relative aspect-[5/4] min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br from-muted via-muted/55 to-accent/45 sm:aspect-[4/3] lg:aspect-auto lg:min-h-96">
          {!imageFailed && /^https?:\/\//i.test(equipment.imageUrl) ? (
            <Image
              src={equipment.imageUrl}
              alt={name}
              fill
              unoptimized
              sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, 100vw"
              className="object-contain p-4 sm:p-7"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageOff aria-hidden="true" className="size-8" />
              Image unavailable
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
          <div>
            <p className="inline-flex rounded-md bg-accent px-2.5 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">{category}</p>
            <h1 className="mt-3 font-heading text-3xl leading-tight font-bold tracking-tight wrap-break-word sm:text-4xl xl:text-5xl">{name}</h1>
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground sm:text-base">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="min-w-0 wrap-break-word">{location}</span>
            </p>
          </div>

          <div className="space-y-3 rounded-xl border bg-muted/50 p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Rental rate</p>
            <p>
              <span className="font-heading text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">${price}</span>
              <span className="ml-1.5 text-sm text-muted-foreground">/ {rentalPeriods[rentalType]}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Boxes aria-hidden="true" className="size-4 text-primary" />
                {availableQuantity > 0 ? `${availableQuantity} total stock` : "No stock"}
              </span>
              {availableQuantity > 0 && <span className="text-muted-foreground">Check rental dates</span>}
            </p>
          </div>

          {signInUrl && (
            <div className="flex flex-wrap gap-2.5 [&>button]:h-11 [&>button]:min-w-0 [&>button]:grow [&>button]:rounded-xl [&>button]:px-4 motion-reduce:[&>button]:transition-none motion-reduce:[&>button]:active:translate-y-0">
              <BookingModal equipmentId={equipment._id} stock={availableQuantity} signInUrl={signInUrl} />
              <FavoriteButton equipment={equipment} signInUrl={signInUrl} />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div {...entrance} className="grid items-start gap-5 motion-reduce:transform-none! motion-reduce:opacity-100! lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-7">
        <div className="grid min-w-0 gap-5 sm:gap-7">
          <section className={panel}>
            <h2 className={sectionTitle}><AlignLeft aria-hidden="true" className="size-5 text-primary" /> Description</h2>
            <p className={sectionCopy}>{equipment.description}</p>
          </section>

          <section className={panel}>
            <h2 className={sectionTitle}><ClipboardList aria-hidden="true" className="size-5 text-primary" /> Rental terms</h2>
            <p className={sectionCopy}>{equipment.terms}</p>
          </section>
        </div>

        <div className="grid min-w-0 gap-5 sm:gap-7">
          <section className={panel}>
            <h2 className={sectionTitle}><SlidersHorizontal aria-hidden="true" className="size-5 text-primary" /> Specifications</h2>
            <dl className="mt-4 divide-y rounded-lg border bg-muted/35 px-3 sm:px-4">
              {specifications.map(({ label, value }) => value && (
                <div key={label} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2.5 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={label === "Condition" ? "font-medium capitalize" : "min-w-0 font-medium wrap-break-word"}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={panel}>
            <h2 className={sectionTitle}><UserRound aria-hidden="true" className="size-5 text-primary" /> Equipment owner</h2>
            <p className="mt-4 font-medium wrap-break-word">{equipment.ownerName}</p>
            <p className="mt-1 text-sm wrap-break-word text-muted-foreground">{equipment.ownerEmail}</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}

function DetailsRequest({ id, signInUrl, customer }: { id: string; signInUrl: string; customer: boolean }) {
  const [result, setResult] = useState<Equipment | ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getEquipmentDetails(id, controller.signal)
      .then((equipment) => {
        if (!controller.signal.aborted) setResult(equipment)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setResult(error instanceof ApiError ? error : new ApiError("Please try again."))
      })
    return () => controller.abort()
  }, [id, attempt])

  if (!result) return <EquipmentDetailsLoading />
  if (!(result instanceof ApiError)) {
    return <DetailsView equipment={result} signInUrl={customer && result.status === "approved" ? signInUrl : undefined} />
  }
  if (result.status === 401) redirect(signInUrl)

  if (result.status === 400 || result.status === 404) {
    return (
      <section className="rounded-2xl border bg-card p-6 text-center sm:p-8">
        <h1 className="text-xl font-semibold">Equipment not found</h1>
        <p role="status" className="mt-2 text-muted-foreground">This listing may have been removed or the link may be incorrect.</p>
        <Button className="mt-5" variant="outline" nativeButton={false} render={<Link href="/equipment" />}>Browse equipment</Button>
      </section>
    )
  }

  return <EquipmentErrorState message={result.message} onRetry={() => {
    setResult(null)
    setAttempt((current) => current + 1)
  }} />
}

export default function EquipmentDetails({ id }: { id: string }) {
  const { data: session, isPending, error, refetch } = authClient.useSession()
  const params = new URLSearchParams({ returnTo: `/equipment/${encodeURIComponent(id)}` })
  const signInUrl = `/sign-in?${params}`

  if (!isPending && !error && !session) redirect(signInUrl)

  return (
    <div className="space-y-5">
      <Button variant="outline" nativeButton={false} render={<Link href="/equipment" />}>
        <ArrowLeft aria-hidden="true" data-icon="inline-start" />
        Browse equipment
      </Button>
      {isPending ? (
        <EquipmentDetailsLoading />
      ) : error ? (
        <EquipmentErrorState message="Could not check your session." onRetry={() => void refetch()} />
      ) : session ? (
        <DetailsRequest
          key={`${session.user.id}:${id}`}
          id={id}
          signInUrl={signInUrl}
          customer={(session.user.role ?? "customer") === "customer"}
        />
      ) : null}
    </div>
  )
}
