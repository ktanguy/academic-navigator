import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import {
  StaggerContainer,
  AnimatedCard,
  fadeInUp,
  defaultTransition,
} from "@/components/ui/motion";

const testimonials = [
  {
    name: "Amara Okonkwo",
    role: "BSc. Computer Science, Year 3",
    avatar: "AO",
    rating: 5,
    quote:
      "The booking system saved me so much time! I used to spend hours trying to catch my facilitator during office hours. Now I just book a slot and show up.",
  },
  {
    name: "David Mensah",
    role: "BSc. Business Administration, Year 2",
    avatar: "DM",
    rating: 5,
    quote:
      "I submitted a ticket about my grade appeal and it was automatically sent to the right professor. Got a response within 24 hours. Impressive!",
  },
  {
    name: "Fatima Hassan",
    role: "BSc. Software Engineering, Year 4",
    avatar: "FH",
    rating: 5,
    quote:
      "As a capstone student, I constantly need guidance. This platform makes it easy to schedule meetings and track all my support requests in one place.",
  },
  {
    name: "Jean-Pierre Uwimana",
    role: "BSc. Entrepreneurship, Year 3",
    avatar: "JU",
    rating: 4,
    quote:
      "The FAQ section answered most of my questions instantly. For the complex stuff, submitting a ticket was straightforward and I got help quickly.",
  },
  {
    name: "Chiamaka Eze",
    role: "BSc. Global Challenges, Year 2",
    avatar: "CE",
    rating: 5,
    quote:
      "I love how I can see which facilitators are available right now. No more guessing or waiting outside empty offices!",
  },
  {
    name: "Mohamed Ali",
    role: "BSc. Computer Science, Year 4",
    avatar: "MA",
    rating: 5,
    quote:
      "The system correctly categorized my technical issue and sent it to IT Support immediately. My WiFi problem was fixed the same day!",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={defaultTransition}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Student voices</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Real problems. Real resolutions.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            From grade appeals to capstone guidance. Here's what students actually experienced.
          </p>
        </motion.div>

        <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard
              key={testimonial.name}
              delay={index * 0.08}
              className="relative rounded-xl bg-card p-6 shadow-card"
            >
              {/* Quote icon */}
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/20" />
              
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-warning text-warning"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
