import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, defaultTransition, buttonMotionProps } from "@/components/ui/motion";

export const CTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={defaultTransition}
          className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center md:px-12 md:py-20"
        >
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary-foreground blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Transform Your Academic Support?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join leading universities that have improved student satisfaction 
              and reduced response times with our AI-powered platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div {...buttonMotionProps}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base"
                >
                  Schedule a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div {...buttonMotionProps}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Contact Sales
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
