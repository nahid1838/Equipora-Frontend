import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import PublicChrome from "@/components/shared/PublicChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display font for headings — used via the font-heading token in globals.css
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equipora – Rent. Use. Grow.",
  description:
    "Find and rent the best quality equipment for your projects, events, or personal needs — quickly and affordably.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Applies the saved theme before the page paints, so there is no flash
            of the wrong theme on reload. ThemeToggle uses the same key. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              const theme = localStorage.getItem("equipora-theme");
              if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
              }
            } catch (e) {}`,
          }}
        />
        <Suspense>
          <PublicChrome><Navbar /></PublicChrome>
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense>
          <PublicChrome><Footer /></PublicChrome>
        </Suspense>
        {/* Toast notifications (used instead of alert()) */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
