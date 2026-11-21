import type { Metadata } from "next";
import PublicPage, { PublicPageSection } from "@/components/shared/PublicPage";

export const metadata: Metadata = {
  title: "Rental Terms | Equipora",
  description: "An informational overview of Equipora listings, rental terms, and payment confirmation.",
};

export default function TermsPage() {
  return (
    <PublicPage
      title="Rental Terms"
      description="This informational guide explains how Equipora handles listings and bookings. Review the terms on the specific equipment listing before you book."
    >
      <div className="grid max-w-3xl gap-5">
        <PublicPageSection title="Before booking">
          <p>Check the rental rate, location, quantity, and any terms listed by the owner. The rental total depends on the selected dates, quantity, and the equipment’s rental rate.</p>
        </PublicPageSection>
        <PublicPageSection title="Payment and confirmation">
          <p>Payments go through Stripe Checkout. Returning from Checkout can happen before Equipora confirms the payment. Check the payment status page or My Rentals for the latest recorded status.</p>
        </PublicPageSection>
        <PublicPageSection title="Listing equipment">
          <p>Owners provide the equipment description, quantity, price, images, and rental terms. New listings go through admin review before they can appear in Browse.</p>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
