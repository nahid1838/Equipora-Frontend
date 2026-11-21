import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import PublicPage, { PublicDocument } from "@/components/shared/PublicPage";

export const metadata: Metadata = {
  title: "Rental Terms | Equipora",
  description: "An informational overview of Equipora listings, rental terms, and payment confirmation.",
};

const sections = [
  { id: "before-booking", title: "Before booking", text: "Check the rental rate, location, quantity, and any terms listed by the owner. The rental total depends on the selected dates, quantity, and the equipment’s rental rate." },
  { id: "payment-and-confirmation", title: "Payment and confirmation", text: "Payments go through Stripe Checkout. Returning from Checkout can happen before Equipora confirms the payment. Check the payment status page or My Rentals for the latest recorded status." },
  { id: "listing-equipment", title: "Listing equipment", text: "Owners provide the equipment description, quantity, price, images, and rental terms. New listings go through admin review before they can appear in Browse." },
];

export default function TermsPage() {
  return (
    <PublicPage
      title="Rental Terms"
      icon={ScrollText}
      description="This informational guide explains how Equipora handles listings and bookings. Review the terms on the specific equipment listing before you book."
    >
      <PublicDocument sections={sections} />
    </PublicPage>
  );
}
