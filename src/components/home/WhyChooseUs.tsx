import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Platform statistics shown as cards on the right side
const stats = [
  { icon: Users, value: "50K+", label: "Happy Customers" },
  { icon: Truck, value: "10K+", label: "Equipment Available" },
  { icon: Star, value: "4.8/5", label: "Customer Rating" },
  { icon: ShieldCheck, value: "99%", label: "Uptime" },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-accent/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        {/* Left: introduction */}
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="h-0.5 w-6 rounded-full bg-primary" />
            Why Choose Equipora?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            The Smart Choice for Equipment Rental
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            We make equipment rental simple, secure, and affordable for
            everyone — from one-day projects to long-term rentals.
          </p>
          <Button
            className="mt-8"
            nativeButton={false}
            render={<Link href="/equipment" />}
          >
            Learn More
            <ArrowRight data-icon="inline-end" className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: 2x2 grid of stat cards */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-6 text-center transition-all hover:shadow-md"
            >
              <stat.icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
