import Hero from "@/components/home/Hero";
import PlatformBenefits from "@/components/home/PlatformBenefits";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function Home() {
  return (
    <>
      {/* Homepage sections are added part by part.
          NOTE: Featured Equipment and Popular Categories sections are
          intentionally excluded for now (requested by the owner). */}
      <Hero />
      <PlatformBenefits />
      <WhyChooseUs />
    </>
  );
}
