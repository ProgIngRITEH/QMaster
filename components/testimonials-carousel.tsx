"use client";

import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
        quote: "Our front desk used to get overwhelmed during peak hours. Now everything flows smoothly and customers actually enjoy the process.",
        name: "Marko Kovačević",
        role: "Owner, Kovačević Auto Service",
    },
    {
        quote: "We reduced waiting time confusion completely. Patients appreciate the transparency and we’ve had fewer no-shows.",
        name: "Ana Radić",
        role: "Head Nurse, Poliklinika Vita",
    },
    {
        quote: "I didn’t expect much at first, but it genuinely improved our daily operations. It’s simple and effective.",
        name: "Luka Marin",
        role: "Manager, Fitness Studio Pulse",
    },
    {
        quote: "Before QMaster, Saturdays were chaos. Now everything is structured and my team feels way less stressed.",
        name: "Petra Horvat",
        role: "Owner, Beauty Studio Aura",
    },
    {
        quote: "Customers love seeing their position in line. It removed constant 'how long will it take' questions.",
        name: "Ivan Perić",
        role: "Manager, Tech Repair Hub",
    },
    {
        quote: "We’ve tried other systems, but this one was by far the easiest to implement and actually use day-to-day.",
        name: "Marija Jurić",
        role: "Director, Dental Center Jurić",
    },
    {
        quote: "It gave us structure without adding complexity. That’s rare with tools like this.",
        name: "Filip Novak",
        role: "Owner, Barber House Novak",
    },
    {
        quote: "Queue management used to be a constant source of complaints. Now it’s something customers compliment us on.",
        name: "Ema Babić",
        role: "Manager, Wellness Spa Elysium",
    },
    {
        quote: "The ability to schedule and manage walk-ins in one place made a huge difference for our team.",
        name: "Tomislav Grgić",
        role: "Owner, Service Center Grgić",
    },
    {
        quote: "Setup was quick, and the impact was immediate. It’s one of the few tools that actually delivered on its promise.",
        name: "Nina Šarić",
        role: "Manager, Salon Nova",
    }
];

export default function TestimonialsCarousel() {
  return (
    <section
      className="relative z-10 py-20 px-6 border-t border-border/30"
      id="testimonials"
    >
      <div className="max-w-5xl mx-auto">
        <Carousel opts={{ loop: true }} plugins={[ Autoplay({delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true})]}
          className="w-full">
          <CarouselContent className="py-2">
            {testimonials.map((t, i) => (
              <CarouselItem
                key={i}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1">
                  <Card className="bg-card/60 border-border/40 h-full">
                    <CardContent className="pt-6 pb-6 px-6 h-full flex flex-col">
                      
                      {/* Stars */}
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic flex-1">
                        "{t.quote}"
                      </p>

                      {/* Author */}
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}