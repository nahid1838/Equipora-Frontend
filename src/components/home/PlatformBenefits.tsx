import { Handshake, Rocket, ShieldCheck, Tag } from "lucide-react";

// The four benefit cards shown under the hero
const benefits = [
  {
    icon: Rocket,
    title: "Wide Range of Equipment",
    subtitle: "From heavy machinery to power tools",
  },
  {
    icon: Tag,
    title: "Affordable Pricing",
    subtitle: "Get the best deals for your needs",
  },
  {
    icon: ShieldCheck,
    title: "Reliable & Well-Maintained",
    subtitle: "Quality you can trust",
  },
  {
    icon: Handshake,
    title: "Easy Rental Process",
    subtitle: "Book in just a few clicks",
  },
];

const PlatformBenefits = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* 1 column on mobile, 2 on small tablets, 4 on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center gap-4 rounded-2xl bg-accent p-5 transition-all hover:shadow-md"
          >
            {/* Icon inside a white circle, like the design */}
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm">
              <benefit.icon className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-sm font-bold sm:text-base">
                {benefit.title}
              </span>
              <span className="block text-sm text-muted-foreground">
                {benefit.subtitle}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlatformBenefits;
