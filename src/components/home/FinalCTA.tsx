import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      {/* Green gradient banner with subtle highlights, like the design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 px-8 py-12 sm:px-12 lg:px-16">
        {/* Soft decorative glows */}
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Icon + text */}
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Rocket className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to Rent? Let&apos;s Get Started Today!
              </h2>
              <p className="mt-2 text-sm text-emerald-50/90 sm:text-base">
                Join thousands of users who trust Equipora for their rental
                needs.
              </p>
            </div>
          </div>

          {/* CTA button */}
          <Button
            className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50"
            render={<Link href="/sign-up" />}
          >
            Get Started Free
            <ArrowRight data-icon="inline-end" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
