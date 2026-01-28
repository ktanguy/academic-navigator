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
    title: "AI-Powered Support",
    description:
      "Intelligent chatbot handles routine queries instantly, freeing staff for complex issues.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Automated appointment booking with facilitators, integrated with academic calendars.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time insights into student needs, service performance, and resource allocation.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "FERPA-compliant data handling with role-based access control and encryption.",
  },
  {
    icon: Zap,
    title: "Instant Escalation",
    description:
      "Seamless handoff from AI to human facilitators when specialized help is needed.",
  },
  {
    icon: Users,
    title: "Collaborative Tools",
    description:
      "Enable facilitators and administrators to work together on complex student cases.",
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
            Everything You Need for Academic Support
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive platform designed specifically for higher education 
            institutions and their unique needs.
          </p>
        </motion.div>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedCard
              key={feature.title}
              delay={index * 0.06}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
