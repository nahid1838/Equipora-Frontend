import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import PublicPage, { PublicDocument } from "@/components/shared/PublicPage";

export const metadata: Metadata = {
  title: "Privacy Overview | Equipora",
  description: "An informational overview of the details Equipora uses for accounts, rentals, and payments.",
};

const sections = [
  { id: "account-and-profile", title: "Account and profile", text: "Equipora uses your name and email for your account. You can update your name, profile photo, and optional phone number and address in your dashboard." },
  { id: "rental-information", title: "Rental information", text: "Bookings use your selected equipment, dates, quantities, contact number, delivery address, and any notes you provide. Owners and admins can view rental activity within their dashboards according to their role." },
  { id: "payments-and-preferences", title: "Payments and preferences", text: "Stripe Checkout collects payment details. Equipora records payment references and statuses for rental confirmation. Your browser remembers your theme preference." },
];

export default function PrivacyPage() {
  return (
    <PublicPage
      title="Privacy Overview"
      icon={ShieldCheck}
      description="Learn which details Equipora uses to manage your account, rentals, and payment status."
    >
      <PublicDocument sections={sections} />
    </PublicPage>
  );
}
