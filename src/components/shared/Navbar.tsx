"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { authClient } from "@/lib/auth-client";

// Navigation shown in the navbar on desktop and inside the mobile menu
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/equipment" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await authClient.signOut();
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
      onKeyDown={(event) => {
        if (event.key === "Escape" && isMobileMenuOpen) {
          closeMobileMenu();
          menuButton.current?.focus();
        }
      }}
    >
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <Hexagon className="h-9 w-9 fill-primary text-primary" strokeWidth={1} />
            <span className="absolute text-sm font-bold text-primary-foreground">E</span>
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">Equipora</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {session ? (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/dashboard" onClick={closeMobileMenu} />}
              >
                <LayoutDashboard data-icon="inline-start" className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/sign-in" onClick={closeMobileMenu} />}
              >
                Sign In
              </Button>
              <Button
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/sign-up" onClick={closeMobileMenu} />}
              >
                Get Started
                <ArrowRight data-icon="inline-end" className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            ref={menuButton}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <nav aria-label="Mobile navigation" id="mobile-navigation" hidden={!isMobileMenuOpen} className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t bg-background lg:hidden">
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2.5 pt-3">
            {session ? (
              <Button
                className="flex-1"
                nativeButton={false}
                render={<Link href="/dashboard" onClick={closeMobileMenu} />}
              >
                <LayoutDashboard data-icon="inline-start" className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/sign-in" onClick={closeMobileMenu} />}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/sign-up" onClick={closeMobileMenu} />}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
