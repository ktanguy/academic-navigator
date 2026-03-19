import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Clock,
  Send,
  Ticket,
  BookOpen,
} from "lucide-react";
import {
  fadeInUp,
  defaultTransition,
} from "@/components/ui/motion";

// Phone mockup component for How It Works
const HowItWorksPhoneMockup = () => {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="relative rounded-[3rem] border-[14px] border-gray-800 bg-gray-900 shadow-2xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-2 text-white" style={{backgroundColor: '#0D1A63'}}>
            <span className="text-xs font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="h-2 w-0.5 rounded-full bg-white" />
                <div className="h-2.5 w-0.5 rounded-full bg-white" />
                <div className="h-3 w-0.5 rounded-full bg-white" />
                <div className="h-3.5 w-0.5 rounded-full bg-white" />
              </div>
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
              </svg>
              <div className="flex h-4 w-6 items-center rounded-sm border border-white/50">
                <div className="ml-0.5 h-2.5 w-4 rounded-sm bg-white" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 pb-4 pt-2 text-white" style={{backgroundColor: '#0D1A63'}}>
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Submit Support Ticket</span>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Category Selection */}
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Academic Affairs</p>
                  <p className="text-xs text-gray-500">Dr. Sarah Chen • Available</p>
                </div>
              </div>
              <p className="mt-2 text-right text-xs" style={{color: '#0D1A63'}}>Change facilitator</p>
            </div>

            {/* Subject */}
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-700">Subject</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-sm text-gray-900">Assignment Extension Request</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium text-gray-700">Description</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-600">I need help with my final project deadline due to medical reasons...</p>
              </div>
            </div>

            {/* AI Classification Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">AI routed to Academic Affairs (94%)</span>
            </motion.div>

            {/* Submit Button */}
            <div className="rounded-full py-3 text-center" style={{backgroundColor: '#0D1A63'}}>
              <span className="text-sm font-semibold text-white">Submit Ticket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background - adapts to dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container relative py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Phone Mockup - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Decorative elements */}
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 dark:bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent/20 dark:bg-accent/10 blur-3xl" />
            
            <HowItWorksPhoneMockup />
          </motion.div>

          {/* Text Content - Right Side */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={defaultTransition}
            className="text-white dark:text-foreground"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Instant
              <br />
              <span className="dark:text-primary">Academic Support</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/90 dark:text-muted-foreground">
              Submit tickets directly to the right department with AI-powered routing. 
              With Academic Navigator, you can get help from any facilitator instantly. 
              Experience smart classification, real-time tracking, and seamless 
              communication for every academic department.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-4">
              {[
                "Find facilitators by department or expertise",
                "AI automatically routes your ticket",
                "Track progress in real-time",
                "Get timely responses and resolutions",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 text-xs font-bold text-white/40 dark:text-muted-foreground tabular-nums w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-white/90 dark:text-foreground">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
