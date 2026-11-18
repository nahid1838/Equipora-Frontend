"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Headset, Search, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Trust indicators shown under the search bar
const trustIndicators = [
  { icon: ShieldCheck, title: "Trusted Platform", subtitle: "100% Secure" },
  { icon: Zap, title: "Instant Booking", subtitle: "In Minutes" },
  { icon: Headset, title: "24/7 Support", subtitle: "Always Here" },
];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The All Equipment page (later phase) reads the "search" query param
    const url = searchQuery
      ? `/equipment?search=${encodeURIComponent(searchQuery)}`
      : "/equipment";
    router.push(url);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/equipora-hero-bg.png"
        alt="Construction equipment at a building site"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />

      {/* Overlay so the text stays readable on both themes.
          The gradient fades from the page background color on the left
          (where the text is) to transparent on the right (equipment). */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10 max-lg:bg-background/80" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Rent Smart. Work Better.
          </div>

          {/* Heading */}
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Premium Equipment On Rent,{" "}
            <span className="text-primary">Anytime!</span>
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Find and rent the best quality equipment for your projects, events,
            or personal needs — quickly and affordably.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for equipment... (e.g. Excavator, Drill)"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" className="h-10 px-6 sm:rounded-full">
              Search
            </Button>
          </form>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {trustIndicators.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-center gap-3 ${
                  // Vertical separators between items on larger screens
                  index > 0 ? "sm:border-l sm:border-border sm:pl-6" : ""
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
