import Hero from "@/components/home/Hero";
import PlatformBenefits from "@/components/home/PlatformBenefits";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import FinalCTA from "@/components/home/FinalCTA";
import HomepageCatalog from "@/components/home/HomepageCatalog";

export default function Home() {
  return (
    <>
      <Hero />
      <HomepageCatalog />
      <PlatformBenefits />
      <WhyChooseUs />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
