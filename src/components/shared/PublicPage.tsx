import type { ReactNode } from "react";

export default function PublicPage({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b bg-accent/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">{children}</div>
    </>
  );
}

export function PublicPageSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-7">
      <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
