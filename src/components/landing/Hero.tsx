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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-soft">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Advanced AI</span>
            </div>
          </motion.div>

          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
          >
            Intelligent Academic Support for{" "}
            <span className="text-primary">Higher Education</span>
          </motion.h1>

          <motion.p
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Streamline student services with AI-powered assistance. Connect students 
            to resources, automate routine queries, and empower facilitators with 
            intelligent tools.
          </motion.p>

          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div {...buttonMotionProps}>
              <Button size="lg" className="h-12 px-8 text-base">
                Request Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div {...buttonMotionProps}>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-10"
          >
            {[
              { value: "50+", label: "Universities" },
              { value: "1M+", label: "Students Served" },
              { value: "95%", label: "Satisfaction Rate" },
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
