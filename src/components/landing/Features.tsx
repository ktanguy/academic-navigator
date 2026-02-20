import { motion } from "framer-motion";
import {
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import {
  StaggerContainer,
  AnimatedCard,
  fadeInUp,
  defaultTransition,
} from "@/components/ui/motion";

const features = [
  {
    icon: MessageSquare,
    title: "AI Classification",
    description:
      "AI-powered ticket categorization achieving 85%+ accuracy across 5 academic categories.",
  },
  {
    icon: Calendar,
    title: "Smart Booking",
    description:
      "Dynamic appointment booking with context-aware forms that collect relevant information upfront for efficient resolution.",
  },
  {
    icon: BarChart3,
    title: "Institutional Analytics",
    description:
      "Real-time dashboard showing support patterns, facilitator workload, and AI classification performance.",
  },
  {
    icon: Shield,
    title: "Cost-Effective Design",
    description:
      "Built on free-tier infrastructure — Hugging Face, Google Colab, and Render — suitable for resource-constrained institutions.",
  },
  {
    icon: Zap,
    title: "Smart Escalation",
    description:
      "Automatic routing with 70% confidence threshold — high-confidence tickets auto-assign, low-confidence ones flag for review.",
  },
  {
    icon: Users,
    title: "Staff Directory",
    description:
      "Centralized facilitator directory with office hours, department info, and one-click appointment booking.",
  },
];

export const Features = () => {
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Integrated Academic Support
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A unified platform combining staff directory, intelligent booking, 
            AI-powered request categorization, and institutional analytics.
          </p>
        </motion.div>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedCard
              key={feature.title}
              delay={index * 0.06}
              className="group rounded-xl bg-card p-6 shadow-card transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors group-hover:bg-primary/80">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </AnimatedCard>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
