"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Headset, Search, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import HomeReveal from "./HomeReveal"

const trustIndicators = [
  { icon: ShieldCheck, title: "Trusted Platform", subtitle: "100% Secure" },
  { icon: Zap, title: "Instant Booking", subtitle: "In Minutes" },
  { icon: Headset, title: "24/7 Support", subtitle: "Always Here" },
]

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = searchQuery.trim()
    router.push(search ? `/equipment?${new URLSearchParams({ search })}` : "/equipment")
  }

  return (
    <section className="relative overflow-hidden" aria-labelledby="home-heading">
      <Image
        src="/images/equipora-hero-bg.png"
        alt="Construction equipment at a building site"
        fill
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-right"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10 max-lg:bg-background/80" />

      <HomeReveal className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="min-w-0 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <Zap aria-hidden="true" className="size-4 text-primary" />
            Rent Smart. Work Better.
          </div>
          <h1 id="home-heading" className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Premium Equipment On Rent,{" "}<span className="text-primary">Anytime!</span>
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Find and rent the best quality equipment for your projects, events,
            or personal needs — quickly and affordably.
          </p>

          <form onSubmit={handleSearch} role="search" className="mt-8 flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 focus-within:ring-2 focus-within:ring-ring sm:rounded-full">
              <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                aria-label="Equipment name or location"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for equipment... (e.g. Excavator, Drill)"
                className="h-10 min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" className="h-10 px-6 sm:rounded-full">Search</Button>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {trustIndicators.map(({ icon: Icon, title, subtitle }, index) => (
              <div key={title} className={`flex items-center gap-3 ${index > 0 ? "sm:border-l sm:border-border sm:pl-6" : ""}`}>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{subtitle}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="ghost" nativeButton={false} render={<Link href="/equipment" />} className="absolute bottom-4 left-4 px-2 text-primary hover:text-primary sm:left-6 lg:bottom-8 lg:left-8">
          Browse all equipment <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
        </Button>
      </HomeReveal>
    </section>
  )
}
