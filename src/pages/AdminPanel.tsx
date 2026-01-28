import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  StaggerContainer,
  AnimatedListItem,
  AnimatedCard,
  fadeInUp,
  slideInRight,
  defaultTransition,
} from "@/components/ui/motion";

// Animated counter component
const AnimatedCounter = ({
  value,
  duration = 1500,
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(incrementTime, 10));
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// Animated bar chart
const AnimatedBar = ({
  percentage,
  label,
  delay,
}: {
  percentage: number;
  label: string;
  delay: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{percentage}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ delay, duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full bg-primary"
      />
    </div>
  </div>
);

const analyticsData = [
  {
    icon: Users,
    label: "Total Students",
    value: 12847,
    change: "+12%",
    positive: true,
  },
  {
    icon: MessageSquare,
    label: "Support Tickets",
    value: 1429,
    change: "-8%",
    positive: true,
  },
  {
    icon: Sparkles,
    label: "AI Resolutions",
    value: 892,
    change: "+23%",
    positive: true,
  },
  {
    icon: BarChart3,
    label: "Avg. Satisfaction",
    value: 94,
    suffix: "%",
    change: "+3%",
    positive: true,
  },
];

const recentActivity = [
  {
    id: 1,
    action: "New facilitator added",
    user: "Dr. James Wilson",
    time: "2 min ago",
    type: "user",
  },
  {
    id: 2,
    action: "AI model updated",
    user: "System",
    time: "15 min ago",
    type: "system",
  },
  {
    id: 3,
    action: "Report generated",
    user: "Admin",
    time: "1 hour ago",
    type: "report",
  },
  {
    id: 4,
    action: "Settings modified",
    user: "Admin",
    time: "2 hours ago",
    type: "settings",
  },
];

const departmentStats = [
  { label: "Academic Affairs", percentage: 85 },
  { label: "Financial Aid", percentage: 72 },
  { label: "Student Housing", percentage: 91 },
  { label: "Career Services", percentage: 68 },
  { label: "IT Support", percentage: 79 },
];

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState<"analytics" | "users" | "settings">(
    "analytics"
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <PageTransition>
          <div className="container">
            {/* Header */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="mt-2 text-muted-foreground">
                  Platform analytics and management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>Export Report</Button>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="mb-8 flex gap-1 rounded-lg bg-card p-1">
              {[
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "users", label: "User Management", icon: Users },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveSection(tab.id as "analytics" | "users" | "settings")
                  }
                  className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeSection === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeSection === tab.id && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute inset-0 rounded-md bg-accent"
                      style={{ zIndex: -1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeSection === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Analytics Cards */}
                  <StaggerContainer className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {analyticsData.map((stat, index) => (
                      <AnimatedListItem key={stat.label}>
                        <AnimatedCard className="rounded-xl bg-card p-5 shadow-card">
                          <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                              <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span
                              className={`flex items-center gap-0.5 text-xs font-medium ${
                                stat.positive ? "text-success" : "text-destructive"
                              }`}
                            >
                              {stat.change}
                              {stat.positive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </span>
                          </div>
                          <div className="mt-4">
                            <p className="text-2xl font-bold text-foreground">
                              <AnimatedCounter value={stat.value} />
                              {stat.suffix || ""}
                            </p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </div>
                        </AnimatedCard>
                      </AnimatedListItem>
                    ))}
                  </StaggerContainer>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Department Performance */}
                    <motion.div
                      initial="initial"
                      animate="animate"
                      variants={fadeInUp}
                      transition={{ ...defaultTransition, delay: 0.2 }}
                      className="rounded-xl bg-card p-6 shadow-card"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Department Performance
                        </h3>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-5">
                        {departmentStats.map((dept, index) => (
                          <AnimatedBar
                            key={dept.label}
                            label={dept.label}
                            percentage={dept.percentage}
                            delay={0.3 + index * 0.1}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      initial="initial"
                      animate="animate"
                      variants={slideInRight}
                      transition={{ ...defaultTransition, delay: 0.3 }}
                      className="rounded-xl bg-card p-6 shadow-card"
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Recent Activity
                        </h3>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.4 + index * 0.08,
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {activity.action}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {activity.user}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {activity.time}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeSection === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search users..." className="pl-10" />
                    </div>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                    <Button>Add User</Button>
                  </div>

                  <div className="rounded-xl bg-card shadow-card">
                    <div className="grid grid-cols-5 gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-muted-foreground">
                      <span>Name</span>
                      <span>Email</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                    {[
                      {
                        name: "Dr. Sarah Chen",
                        email: "s.chen@university.edu",
                        role: "Facilitator",
                        status: "Active",
                      },
                      {
                        name: "Mark Johnson",
                        email: "m.johnson@university.edu",
                        role: "Facilitator",
                        status: "Active",
                      },
                      {
                        name: "Emily Rodriguez",
                        email: "e.rodriguez@university.edu",
                        role: "Admin",
                        status: "Active",
                      },
                      {
                        name: "James Wilson",
                        email: "j.wilson@university.edu",
                        role: "Facilitator",
                        status: "Pending",
                      },
                    ].map((user, index) => (
                      <motion.div
                        key={user.email}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.2,
                          ease: "easeOut",
                        }}
                        className="grid grid-cols-5 items-center gap-4 border-b border-border px-6 py-4 last:border-0"
                      >
                        <span className="font-medium text-foreground">{user.name}</span>
                        <span className="text-muted-foreground">{user.email}</span>
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "Active"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }
                        >
                          {user.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="grid gap-6"
                >
                  {[
                    {
                      title: "AI Configuration",
                      description: "Configure AI model settings and confidence thresholds",
                    },
                    {
                      title: "Notification Settings",
                      description: "Manage email and push notification preferences",
                    },
                    {
                      title: "Integration Settings",
                      description: "Connect with LMS, SIS, and other university systems",
                    },
                    {
                      title: "Security & Privacy",
                      description: "FERPA compliance and data protection settings",
                    },
                  ].map((setting, index) => (
                    <motion.div
                      key={setting.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-between rounded-xl bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground">{setting.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <Button variant="outline">
                        Configure
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
