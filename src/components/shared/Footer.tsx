import Link from "next/link";
import { Hexagon } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Browse equipment", href: "/equipment" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Rental information",
    links: [
      { label: "Rental Terms", href: "/terms" },
      { label: "Privacy Overview", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-accent/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span aria-hidden="true" className="relative flex size-9 items-center justify-center">
                <Hexagon className="size-9 fill-primary text-primary" strokeWidth={1} />
                <span className="absolute text-sm font-bold text-primary-foreground">E</span>
              </span>
              <span className="font-heading text-xl font-bold tracking-tight">Equipora</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">Rent Smart. Work Better.</p>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footerGroups.map(({ title, links }) => (
              <div key={title}>
                <p className="text-sm font-bold">{title}</p>
                <ul className="mt-3 space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="inline-block rounded-sm py-1 text-sm text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t pt-6 text-xs text-muted-foreground">© Equipora</p>
      </div>
    </footer>
  );
}
