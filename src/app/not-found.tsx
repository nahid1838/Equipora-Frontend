import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border bg-card p-6 sm:p-10">
        <h1 className="font-heading text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">Check the address or browse available equipment.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/" />}>Go home</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/equipment" />}>Browse equipment</Button>
        </div>
      </div>
    </section>
  )
}
