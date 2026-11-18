import Image from "next/image";
import { Star } from "lucide-react";

// Sample reviews shown on the homepage (will stay until real reviews
// are shown from the database in a later phase)
const testimonials = [
  {
    name: "Tanvir Rahman",
    role: "Contractor",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "Equipora made our construction project so much easier. Highly recommend!",
  },
  {
    name: "Sarah Ahmed",
    role: "Event Organizer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "Great platform! The booking process is super simple and fast.",
  },
  {
    name: "Rafiq Islam",
    role: "Entrepreneur",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "Affordable and reliable. Best rental service in town!",
  },
];

const Testimonials = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      {/* Section heading */}
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <span className="h-0.5 w-6 rounded-full bg-primary" />
          Testimonials
          <span className="h-0.5 w-6 rounded-full bg-primary" />
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          What Our Customers Say
        </h2>
      </div>

      {/* Review cards */}
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-2xl border bg-card p-6 transition-all hover:shadow-md"
          >
            {/* Star rating */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-4 w-4 fill-primary text-primary"
                />
              ))}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground">
              “{testimonial.quote}”
            </p>

            {/* Customer info */}
            <div className="mt-6 flex items-center gap-3">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border object-cover"
              />
              <span>
                <span className="block text-sm font-bold">{testimonial.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {testimonial.role}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
