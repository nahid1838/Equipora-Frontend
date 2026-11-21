import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hexagon, PackageSearch, Wrench } from "lucide-react";
import PublicPage, { PublicPageSection } from "@/components/shared/PublicPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About | Equipora",
  description: "Get to know Equipora, an equipment rental marketplace for renters and owners.",
};

export default function AboutPage() {
  return (
    <PublicPage
      title="About Equipora"
      icon={Hexagon}
      showEquipmentImage
      description="Equipora is an equipment rental marketplace. Renters can find equipment for a project, and owners can list equipment for others to rent."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <PublicPageSection title="Find equipment for your project" icon={PackageSearch}>
          <p>Browse approved listings by category or location, compare daily, weekly, or monthly rates, and review each listing’s rental terms before booking.</p>
          <Button className="min-h-11" nativeButton={false} render={<Link href="/equipment" />}>
            Browse equipment <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </PublicPageSection>
        <PublicPageSection title="List and manage your equipment" icon={Wrench}>
          <p>Owners can publish equipment details, set rental rates and quantities, and view rental activity in their dashboard. New listings appear in Browse after an admin approves them.</p>
          <Button className="min-h-11" variant="outline" nativeButton={false} render={<Link href="/how-it-works" />}>
            See how rentals work
          </Button>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
