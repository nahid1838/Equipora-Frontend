import Link from "next/link";
import type { ReactNode } from "react";
import { Hexagon } from "lucide-react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Shared shell for the Sign In and Sign Up pages
const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Soft decorative glows behind the card */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <Hexagon className="h-9 w-9 fill-primary text-primary" strokeWidth={1} />
            <span className="absolute text-sm font-bold text-primary-foreground">E</span>
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">Equipora</span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
};

export default AuthLayout;
