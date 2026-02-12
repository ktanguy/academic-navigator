import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/50 via-transparent to-transparent" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-soft">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by DistilBERT AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            AI-Powered Academic{" "}
            <span className="text-primary">Support Platform</span>
          </motion.h1>

          <motion.p
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Find facilitators, book appointments, submit support tickets with 
            AI-powered categorization, and track your requests — all in one 
            integrated platform built for ALU students.
          </motion.p>

          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div {...buttonMotionProps}>
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <a href="/directory">
                  Find a Facilitator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
            <motion.div {...buttonMotionProps}>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <a href="/helpdesk">Get Help</a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 pt-10"
          >
            {[
              { value: "85%+", label: "AI Accuracy" },
              { value: "<3s", label: "Response Time" },
              { value: "5", label: "Ticket Categories" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
