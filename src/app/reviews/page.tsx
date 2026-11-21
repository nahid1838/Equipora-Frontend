import type { Metadata } from "next"
import PublicReviews from "@/components/shared/PublicReviews"
import PublicPage from "@/components/shared/PublicPage"

export const metadata: Metadata = {
  title: "Customer Reviews | Equipora",
  description: "Read approved customer reviews about renting equipment with Equipora.",
}

export default function ReviewsPage() {
  return (
    <PublicPage title="Customer reviews" description="Read about customers’ experiences renting equipment on Equipora.">
      <PublicReviews />
    </PublicPage>
  )
}
