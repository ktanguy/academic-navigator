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
import { Button } from "@/components/ui/button";

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
  badge: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  mockup: React.ReactNode;
  reverse?: boolean;
}

const FeatureSection = ({ badge, title, description, linkText, linkHref, mockup, reverse }: FeatureSectionProps) => (
  <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${reverse ? 'lg:grid-flow-dense' : ''}`}>
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      transition={defaultTransition}
      className={reverse ? 'lg:col-start-2' : ''}
    >
      <span className="inline-block rounded-full border border-border bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary uppercase tracking-wide">
        {badge}
      </span>
      <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">
        <Button size="lg" variant="outline" className="group" asChild>
          <Link to={linkHref}>
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: reverse ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 py-12 ${reverse ? 'lg:col-start-1' : ''}`}
    >
      {mockup}
    </motion.div>
  </div>
);

export const Features = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container space-y-24 md:space-y-32">
        {/* Section 1: AI Classification */}
        <FeatureSection
          badge="AI Classification"
          title="Intelligent ticket categorization powered by AI."
          description="AI-powered ticket categorization achieving 85%+ accuracy across 5 academic categories. DistilBERT analyzes your request in real-time and routes it to the right department automatically."
          linkText="Try Help Desk"
          linkHref="/helpdesk"
          mockup={<AIClassificationMockup />}
        />

        {/* Section 2: Smart Booking */}
        <FeatureSection
          badge="Smart Booking"
          title="Book appointments with context-aware scheduling."
          description="Dynamic appointment booking with context-aware forms that collect relevant information upfront for efficient resolution. See real-time availability and book with one click."
          linkText="Book Now"
          linkHref="/booking"
          mockup={<SmartBookingMockup />}
          reverse
        />

        {/* Section 3: Institutional Analytics */}
        <FeatureSection
          badge="Institutional Analytics"
          title="Real-time insights into support patterns."
          description="Real-time dashboard showing support patterns, facilitator workload, and AI classification performance. Make data-driven decisions to improve student support."
          linkText="View Analytics"
          linkHref="/admin"
          mockup={<AnalyticsMockup />}
        />

        {/* Section 4: Cost-Effective Design */}
        <FeatureSection
          badge="Cost-Effective Design"
          title="Enterprise features on a free-tier budget."
          description="Built on free-tier infrastructure — Hugging Face, Google Colab, and Render — suitable for resource-constrained institutions. No expensive licenses or servers required."
          linkText="Learn More"
          linkHref="/helpdesk"
          mockup={<CostEffectiveMockup />}
          reverse
        />

        {/* Section 5: Smart Escalation */}
        <FeatureSection
          badge="Smart Escalation"
          title="Automatic routing with confidence thresholds."
          description="Automatic routing with 70% confidence threshold — high-confidence tickets auto-assign, low-confidence ones flag for human review. Never miss an edge case."
          linkText="See How It Works"
          linkHref="/helpdesk"
          mockup={<SmartEscalationMockup />}
        />

        {/* Section 6: Staff Directory */}
        <FeatureSection
          badge="Staff Directory"
          title="Find and connect with facilitators instantly."
          description="Centralized facilitator directory with office hours, department info, and one-click appointment booking. Know exactly who can help and when they're available."
          linkText="Browse Directory"
          linkHref="/directory"
          mockup={<StaffDirectoryMockup />}
          reverse
        />
      </div>
    </section>
  );
};
