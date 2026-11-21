import type { Metadata } from "next";
import Link from "next/link";
import PublicPage, { PublicPageSection } from "@/components/shared/PublicPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact | Equipora",
  description: "Find guidance for Equipora rentals and check whether direct support is available.",
};

export default function ContactPage() {
  return (
    <PublicPage
      title="Contact Equipora"
      description="Find where to check a rental, review a payment status, or learn how listings work."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <PublicPageSection title="Direct support">
          <p>Direct support is currently unavailable. Equipora will publish contact details on this page when a support channel is ready.</p>
        </PublicPageSection>
        <PublicPageSection title="Help with a rental">
          <p>Check your rental and payment status in the dashboard, or follow the rental guide for help with the booking process.</p>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/dashboard" />}>Open dashboard</Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/how-it-works" />}>Read the rental guide</Button>
          </div>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
