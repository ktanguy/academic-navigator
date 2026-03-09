import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Users,
  Search,
  BookOpen,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  Brain,
  TrendingUp,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Server,
  Cloud,
} from "lucide-react";
import {
  fadeInUp,
  defaultTransition,
} from "@/components/ui/motion";

// Phone mockup base component
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

// AI Classification Mockup
const AIClassificationMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Brain className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">AI Classification</h3>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">Real-time ticket analysis</p>
      
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <p className="text-xs text-muted-foreground mb-2">Analyzing ticket...</p>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            whileInView={{ width: "92%" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs font-medium text-primary mt-2">92% Confidence</p>
      </div>

      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Detected Category</p>
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
          <BookOpen className="h-5 w-5 text-success" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">Assignment Issues</h4>
          <p className="text-xs text-muted-foreground">Academic Affairs</p>
        </div>
        <CheckCircle2 className="ml-auto h-5 w-5 text-success" />
      </div>
    </div>
  </PhoneFrame>
);

// Smart Booking Mockup
const SmartBookingMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Calendar className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Book Appointment</h3>
      
      <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">Available Slots</p>
      
      {[
        { time: "10:00 AM", date: "Today", available: true },
        { time: "2:30 PM", date: "Today", available: true },
        { time: "9:00 AM", date: "Tomorrow", available: false },
      ].map((slot, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className={`mb-2 flex items-center justify-between rounded-lg border p-3 ${
            slot.available 
              ? "border-border bg-card hover:border-primary/30" 
              : "border-border/50 bg-muted/30 opacity-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{slot.time}</p>
              <p className="text-xs text-muted-foreground">{slot.date}</p>
            </div>
          </div>
          {slot.available && (
            <div className="rounded-full bg-primary px-3 py-1">
              <span className="text-xs font-medium text-primary-foreground">Book</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  </PhoneFrame>
);

// Analytics Mockup
const AnalyticsMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <BarChart3 className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Analytics</h3>
      
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-xl font-bold text-primary">156</p>
          <p className="text-xs text-muted-foreground">Total Tickets</p>
        </div>
        <div className="rounded-lg bg-success/10 p-3">
          <p className="text-xl font-bold text-success">89%</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </div>
      </div>

      <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Weekly Trend</p>
      <div className="flex items-end justify-between gap-1 h-20 rounded-lg bg-muted/30 p-3">
        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-primary"
            initial={{ height: 0 }}
            whileInView={{ height: `${height}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-xs text-muted-foreground flex-1 text-center">{d}</span>
        ))}
      </div>
    </div>
  </PhoneFrame>
);

// Cost-Effective Mockup
const CostEffectiveMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <DollarSign className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Infrastructure</h3>
      <p className="mb-3 mt-1 text-xs text-muted-foreground">Free-tier powered</p>
      
      {[
        { name: "Hugging Face", desc: "AI Models", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
        { name: "Google Colab", desc: "Training", icon: Cloud, color: "text-success", bg: "bg-success/10" },
        { name: "Render", desc: "Hosting", icon: Server, color: "text-accent", bg: "bg-accent/10" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg}`}>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Free</span>
        </motion.div>
      ))}
    </div>
  </PhoneFrame>
);

// Smart Escalation Mockup
const SmartEscalationMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Zap className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Smart Routing</h3>
      
      <div className="mt-3 rounded-xl border border-success/30 bg-success/10 p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-foreground">High Confidence</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auto-assigned</span>
          <span className="text-xs font-medium text-success">92%</span>
        </div>
        <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
          <div className="h-full w-[92%] bg-success rounded-full" />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium text-foreground">Low Confidence</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Flagged for review</span>
          <span className="text-xs font-medium text-warning">58%</span>
        </div>
        <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
          <div className="h-full w-[58%] bg-warning rounded-full" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ArrowUpRight className="h-4 w-4" />
        <span>70% confidence threshold</span>
      </div>
    </div>
  </PhoneFrame>
);

// Staff Directory Mockup
const StaffDirectoryMockup = () => (
  <PhoneFrame>
    <div className="px-4 pb-6 pt-2">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Users className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Staff Directory</h3>
      
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search staff...</span>
      </div>

      {[
        { name: "Dr. Sarah Chen", dept: "Academic Affairs", avatar: "SC" },
        { name: "Prof. James Wilson", dept: "IT Support", avatar: "JW" },
      ].map((staff, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="mt-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {staff.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground text-sm">{staff.name}</h4>
              <p className="text-xs text-muted-foreground">{staff.dept}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary">
              <Calendar className="h-3 w-3" />
              Book
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-secondary py-1.5 text-xs font-medium text-secondary-foreground">
              <Mail className="h-3 w-3" />
              Email
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </PhoneFrame>
);

// Feature Section Component
interface FeatureSectionProps {
  step: string;
  badge: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  mockup: React.ReactNode;
  reverse?: boolean;
  mockupBg?: string;
}

const FeatureSection = ({ step, badge, title, description, linkText, linkHref, mockup, reverse, mockupBg = "bg-secondary/50 dark:bg-secondary/30" }: FeatureSectionProps) => (
  <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${reverse ? 'lg:grid-flow-dense' : ''}`}>
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      transition={defaultTransition}
      className={reverse ? 'lg:col-start-2' : ''}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs font-bold text-muted-foreground/50 tabular-nums">{step}</span>
        <span className="h-px flex-1 max-w-[32px] bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{badge}</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] leading-tight">
        {title}
      </h2>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
        {description}
      </p>
      <div className="mt-8">
        <Link to={linkHref} className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: reverse ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative flex items-center justify-center rounded-2xl ${mockupBg} py-12 ${reverse ? 'lg:col-start-1' : ''}`}
    >
      {mockup}
    </motion.div>
  </div>
);

export const Features = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container space-y-24 md:space-y-32">
        <FeatureSection
          step="01"
          badge="AI Classification"
          title="Your ticket goes to the right person. Every time."
          description="DistilBERT reads your request and routes it across 5 academic departments with 85%+ accuracy — no dropdowns, no guessing, no wrong inboxes."
          linkText="Try the Help Desk"
          linkHref="/helpdesk"
          mockup={<AIClassificationMockup />}
          mockupBg="bg-[#0D1A63]/5 dark:bg-[#0D1A63]/20"
        />

        <FeatureSection
          step="02"
          badge="Smart Booking"
          title="See who's free and book in one tap."
          description="Real-time availability, context-aware forms, and instant confirmation. No more emailing back and forth to find a time that works."
          linkText="Book an appointment"
          linkHref="/booking"
          mockup={<SmartBookingMockup />}
          reverse
          mockupBg="bg-success/5 dark:bg-success/10"
        />

        <FeatureSection
          step="03"
          badge="Analytics"
          title="See what's working — and what isn't."
          description="Live dashboards show ticket volume, resolution rates, and AI confidence by department. Built for coordinators who make decisions based on evidence."
          linkText="View the dashboard"
          linkHref="/admin"
          mockup={<AnalyticsMockup />}
          mockupBg="bg-accent/5 dark:bg-accent/10"
        />

        <FeatureSection
          step="04"
          badge="Infrastructure"
          title="Built on free-tier tools that actually scale."
          description="Hugging Face for AI, Google Colab for training, Render for hosting. No expensive licenses. No infrastructure lock-in. Ready to deploy anywhere."
          linkText="How it's built"
          linkHref="/helpdesk"
          mockup={<CostEffectiveMockup />}
          reverse
          mockupBg="bg-warning/5 dark:bg-warning/10"
        />

        <FeatureSection
          step="05"
          badge="Routing"
          title="Low confidence? A human reviews it."
          description="Tickets above 70% confidence are auto-assigned. Below that, they're flagged for manual review. Nothing slips through the cracks."
          linkText="See how routing works"
          linkHref="/helpdesk"
          mockup={<SmartEscalationMockup />}
          mockupBg="bg-destructive/5 dark:bg-destructive/10"
        />

        <FeatureSection
          step="06"
          badge="Directory"
          title="Know who to talk to before you send a ticket."
          description="Browse facilitators by department, see their office hours, and book directly. No more guessing which professor handles what."
          linkText="Browse the directory"
          linkHref="/directory"
          mockup={<StaffDirectoryMockup />}
          reverse
          mockupBg="bg-primary/5 dark:bg-primary/10"
        />
      </div>
    </section>
  );
};
