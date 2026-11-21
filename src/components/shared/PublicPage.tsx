import type { ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export default function PublicPage({ title, description, children, icon: Icon, showEquipmentImage = false }: {
  title: string;
  description: string;
  children: ReactNode;
  icon?: LucideIcon;
  showEquipmentImage?: boolean;
}) {
  if (Icon) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <header className="relative grid overflow-hidden rounded-3xl border bg-linear-to-br from-card via-card to-accent/60 shadow-sm md:grid-cols-[1fr_auto]">
          <div className="min-w-0 p-6 sm:p-10 lg:p-14">
            <span className="mb-5 inline-grid size-11 place-items-center rounded-xl border border-primary/20 bg-accent text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
          </div>
          {showEquipmentImage && (
            <div className="relative min-h-48 border-t md:w-64 md:border-t-0 md:border-l lg:w-96">
              <Image src="/images/equipora-hero-bg.png" alt="" fill sizes="(min-width: 1024px) 384px, (min-width: 768px) 256px, 100vw" className="object-cover" />
            </div>
          )}
        </header>
        <div className="mt-7 sm:mt-10">{children}</div>
      </div>
    );
  }

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

export function PublicPageSection({ title, children, icon: Icon }: { title: string; children: ReactNode; icon: LucideIcon }) {
  return (
    <section className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
      <span className="mb-4 inline-grid size-10 place-items-center rounded-xl bg-accent text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-5 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function PublicDocument({ sections }: { sections: { id: string; title: string; text: string }[] }) {
  return (
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-8">
      <nav aria-label="On this page" className="rounded-2xl border bg-muted/40 p-4 md:sticky md:top-24">
        <p className="px-2 pb-1 text-sm font-semibold">On this page</p>
        <ul>
          {sections.map(({ id, title }) => (
            <li key={id}>
              <a href={`#${id}`} className="flex min-h-11 items-center rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none">{title}</a>
            </li>
          ))}
        </ul>
      </nav>
      <article className="min-w-0 divide-y rounded-2xl border bg-card px-5 shadow-sm sm:px-9">
        {sections.map(({ id, title, text }) => (
          <section key={id} id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 py-6 sm:py-8">
            <h2 id={`${id}-heading`} className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
            <p className="mt-3 max-w-[66ch] leading-7 text-muted-foreground">{text}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
