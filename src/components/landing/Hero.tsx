import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  GraduationCap, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";

// Phone Frame Component
const PhoneFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="relative rounded-[3rem] border-[14px] border-foreground/10 bg-card shadow-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-background">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-background px-6 py-2">
            <span className="text-xs font-medium text-foreground">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="h-2 w-0.5 rounded-full bg-foreground" />
                <div className="h-2.5 w-0.5 rounded-full bg-foreground" />
                <div className="h-3 w-0.5 rounded-full bg-foreground" />
                <div className="h-3.5 w-0.5 rounded-full bg-foreground" />
              </div>
              <svg className="h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
              </svg>
              <div className="flex h-4 w-6 items-center rounded-sm border border-foreground/50">
                <div className="ml-0.5 h-2.5 w-4 rounded-sm bg-foreground" />
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Hero Phone Mockup
const HeroPhoneMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Academic Navigator</h3>
            <p className="text-xs text-muted-foreground">Welcome back, John</p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Quick Actions */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Actions</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: MessageSquare, label: "Ticket", color: "gradient-vibrant" },
          { icon: Calendar, label: "Book", color: "bg-success" },
          { icon: Star, label: "Directory", color: "bg-accent" },
        ].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Activity</p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-2 rounded-xl border border-success/20 bg-success/5 p-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm">Ticket Resolved</h4>
            <p className="text-xs text-muted-foreground">Grade appeal approved</p>
          </div>
          <span className="text-xs text-muted-foreground">2h ago</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border bg-card p-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Calendar className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm">Upcoming Meeting</h4>
            <p className="text-xs text-muted-foreground">Dr. Sarah Chen • 3:00 PM</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5">
            <Clock className="h-3 w-3 text-success" />
            <span className="text-xs font-medium text-success">Today</span>
          </div>
        </div>
      </motion.div>
    </div>
  </PhoneFrame>
);

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-vibrant/5 via-accent/5 to-background dark:from-vibrant/10 dark:via-accent/10 dark:to-background" />

      {/* Decorative elements */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-vibrant/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-vibrant/8 blur-3xl" />
      
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={defaultTransition}
          >
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Academic support,{" "}
              <br className="hidden sm:block" />
              the smart way.
            </h1>
            <p className="mt-3 text-2xl font-semibold text-muted-foreground md:text-3xl">
              From question to resolution. Fast.
            </p>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg max-w-lg">
              Raise tickets, schedule sessions with facilitators, and follow up on every request. All in one place, powered by AI routing.
            </p>

            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ ...defaultTransition, delay: 0.2 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <motion.div {...buttonMotionProps}>
                <Button size="lg" className="h-12 px-8 text-base text-white gradient-vibrant hover:opacity-90 border-0" asChild>
                  <Link to="/helpdesk">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div {...buttonMotionProps}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5" asChild>
                  <Link to="/directory">Browse Directory</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ ...defaultTransition, delay: 0.3 }}
              className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8"
            >
              {[
                { value: "87%", label: "AI accuracy" },
                { value: "< 500ms", label: "warm classification" },
                { value: "5", label: "departments covered" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-vibrant/10 to-accent/10 py-12 dark:from-vibrant/20 dark:to-accent/20"
          >
            <HeroPhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
