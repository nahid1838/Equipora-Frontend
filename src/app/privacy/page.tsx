import type { Metadata } from "next";
import PublicPage, { PublicPageSection } from "@/components/shared/PublicPage";

export const metadata: Metadata = {
  title: "Privacy Overview | Equipora",
  description: "An informational overview of the details Equipora uses for accounts, rentals, and payments.",
};

export default function PrivacyPage() {
  return (
    <PublicPage
      title="Privacy Overview"
      description="Learn which details Equipora uses to manage your account, rentals, and payment status."
    >
      <div className="grid max-w-3xl gap-5">
        <PublicPageSection title="Account and profile">
          <p>Equipora uses your name and email for your account. You can update your name, profile photo, and optional phone number and address in your dashboard.</p>
        </PublicPageSection>
        <PublicPageSection title="Rental information">
          <p>Bookings use your selected equipment, dates, quantities, contact number, delivery address, and any notes you provide. Owners and admins can view rental activity within their dashboards according to their role.</p>
        </PublicPageSection>
        <PublicPageSection title="Payments and preferences">
          <p>Stripe Checkout collects payment details. Equipora records payment references and statuses for rental confirmation. Your browser remembers your theme preference.</p>
        </PublicPageSection>
      </div>
    </PublicPage>
  );
}
