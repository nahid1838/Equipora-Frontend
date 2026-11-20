"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, ImageOff, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getEquipmentDetails } from "@/lib/api/equipment"
import { ApiError } from "@/lib/api/errors"
import type { Equipment } from "@/types/equipment"
import { EquipmentErrorState } from "./EquipmentStates"

const rentalPeriods = { daily: "day", weekly: "week", monthly: "month" }

export function EquipmentDetailsLoading() {
  return (
    <div role="status" className="grid gap-6 lg:grid-cols-2">
      <span className="sr-only">Loading equipment details…</span>
      <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
      <div className="min-h-48 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}

function DetailsView({ equipment }: { equipment: Equipment }) {
  const [imageFailed, setImageFailed] = useState(false)
  const { name, category, location, price, rentalType, availableQuantity } = equipment
  const specifications = [
    { label: "Condition", value: equipment.condition },
    { label: "Brand", value: equipment.brand },
    { label: "Model", value: equipment.model },
  ]

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
        {!imageFailed && /^https?:\/\//i.test(equipment.imageUrl) ? (
          <Image
            src={equipment.imageUrl}
            alt={name}
            fill
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-8" />
            Image unavailable
          </div>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5 sm:p-7">
        <div>
          <p className="text-sm font-medium text-primary">{category}</p>
          <h1 className="mt-1 text-3xl font-bold break-words sm:text-4xl">{name}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {location}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-4">
          <p>
            <span className="text-2xl font-bold">${price}</span>
            <span className="text-muted-foreground"> / {rentalPeriods[rentalType]}</span>
          </p>
          <p className="text-sm font-medium">
            {availableQuantity > 0 ? `${availableQuantity} available` : "Unavailable"}
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">{equipment.description}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Specifications</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specifications.map(({ label, value }) => value && (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className={label === "Condition" ? "capitalize" : "break-words"}>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t pt-5">
          <h2 className="text-lg font-semibold">Equipment owner</h2>
          <p className="mt-2 font-medium">{equipment.ownerName}</p>
          <p className="break-all text-muted-foreground">{equipment.ownerEmail}</p>
        </section>

        <section className="border-t pt-5">
          <h2 className="text-lg font-semibold">Rental terms</h2>
          <p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">{equipment.terms}</p>
        </section>
      </div>
    </div>
  )
}

function DetailsRequest({ id, signInUrl }: { id: string; signInUrl: string }) {
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
  if (!(result instanceof ApiError)) return <DetailsView equipment={result} />
  if (result.status === 401) redirect(signInUrl)

  if (result.status === 400 || result.status === 404) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center" role="status">
        <h1 className="text-xl font-semibold">Equipment not found</h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </div>
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
        <DetailsRequest key={`${session.user.id}:${id}`} id={id} signInUrl={signInUrl} />
      ) : null}
    </div>
  )
}
