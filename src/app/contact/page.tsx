import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleHelp, MessageCircle, MessagesSquare } from "lucide-react";
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
      icon={MessagesSquare}
      description="Find where to check a rental, review a payment status, or learn how listings work."
    >
      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <PublicPageSection title="Direct support" icon={MessageCircle}>
          <p>Direct support is currently unavailable. Equipora will publish contact details on this page when a support channel is ready.</p>
        </PublicPageSection>
        <PublicPageSection title="Help with a rental" icon={CircleHelp}>
          <p>Check your rental and payment status in the dashboard, or follow the rental guide for help with the booking process.</p>
          <div className="flex flex-wrap gap-3">
            <Button className="min-h-11" nativeButton={false} render={<Link href="/dashboard" />}>Open dashboard <ArrowUpRight data-icon="inline-end" aria-hidden="true" /></Button>
            <Button className="min-h-11" variant="outline" nativeButton={false} render={<Link href="/how-it-works" />}>Read the rental guide</Button>
          </div>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
