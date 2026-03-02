import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeInUp, defaultTransition, buttonMotionProps } from "@/components/ui/motion";

export const CTA = () => {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-3xl bg-card shadow-xl px-8 py-14 text-center border border-border">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to Get Academic Support?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse the facilitator directory to book an appointment, or submit a support ticket for AI-powered categorization and quick resolution.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/directory"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Browse Facilitators
          </a>
          <a
            href="/helpdesk"
            className="inline-flex items-center justify-center rounded-full bg-secondary px-8 py-3 text-base font-semibold text-secondary-foreground shadow-md transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Submit a Ticket
          </a>
        </div>
      </div>
    </section>
  );
};
