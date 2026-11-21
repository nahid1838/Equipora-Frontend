import type { Metadata } from "next";
import Link from "next/link";
import PublicPage, { PublicPageSection } from "@/components/shared/PublicPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works | Equipora",
  description: "Learn how to rent equipment and how owners manage listings on Equipora.",
};

const rentalSteps = [
  { title: "Browse equipment", description: "Find approved listings by name or location. Use the filters to narrow your search by category, price, rental type, or availability." },
  { title: "Review the listing", description: "Sign in to view the equipment details, see the owner information, and check the location, rental rate, and terms." },
  { title: "Choose dates and quantity", description: "Select Book Now, enter your rental dates and quantity, then provide a contact number and delivery address. You can also add notes." },
  { title: "Review the total and pay", description: "Equipora checks availability and calculates the rental total. Complete Stripe Checkout and wait for your payment confirmation." },
  { title: "Track your rental", description: "Open My Rentals in your customer dashboard to see rental dates, booking status, and payment status." },
];

const ownerSteps = [
  { title: "Add equipment", description: "With an owner account, open Add Equipment in your dashboard. Enter the listing details, images, rental rate, quantity, and terms." },
  { title: "Track listing approval", description: "New equipment starts as pending. An admin reviews it before an approved listing appears in the public catalog." },
  { title: "Manage listings and rentals", description: "Use My Equipment to update your listings. Use the rentals section to view bookings for your equipment, including dates, quantities, and statuses." },
];

export default function HowItWorksPage() {
  return (
    <PublicPage
      title="How It Works"
      description="Follow a rental from your first search to payment confirmation, or see how owners list and manage equipment."
    >
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <PublicPageSection title="Renting equipment">
          <ol className="list-decimal space-y-4 pl-5 marker:font-semibold marker:text-primary">
            {rentalSteps.map(({ title, description }) => (
              <li key={title} className="pl-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
          <Button nativeButton={false} render={<Link href="/equipment" />}>Browse equipment</Button>
        </PublicPageSection>
        <PublicPageSection title="Listing equipment as an owner">
          <ol className="list-decimal space-y-4 pl-5 marker:font-semibold marker:text-primary">
            {ownerSteps.map(({ title, description }) => (
              <li key={title} className="pl-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>Open dashboard</Button>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
