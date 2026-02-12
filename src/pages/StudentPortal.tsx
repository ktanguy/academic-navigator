import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
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
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";

const appointments = [
  {
    id: 1,
    title: "Academic Advising",
    facilitator: "Dr. Sarah Chen",
    date: "Jan 30, 2026",
    time: "2:00 PM",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Financial Aid Consultation",
    facilitator: "Mark Johnson",
    date: "Feb 2, 2026",
    time: "10:30 AM",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Career Counseling",
    facilitator: "Dr. Emily Rodriguez",
    date: "Jan 25, 2026",
    time: "3:00 PM",
    status: "completed",
  },
];

const tickets = [
  {
    id: "TKT-001",
    subject: "Course Registration Help",
    status: "open",
    priority: "high",
    lastUpdate: "2 hours ago",
  },
  {
    id: "TKT-002",
    subject: "Transcript Request",
    status: "in-progress",
    priority: "medium",
    lastUpdate: "1 day ago",
  },
  {
    id: "TKT-003",
    subject: "Housing Application Query",
    status: "resolved",
    priority: "low",
    lastUpdate: "3 days ago",
  },
];

const statusConfig = {
  open: { color: "bg-warning text-warning-foreground", label: "Open" },
  "in-progress": { color: "bg-primary text-primary-foreground", label: "In Progress" },
  resolved: { color: "bg-success text-success-foreground", label: "Resolved" },
};

const priorityConfig = {
  high: "border-destructive/50 bg-destructive/5",
  medium: "border-warning/50 bg-warning/5",
  low: "border-border",
};

const StudentPortal = () => {
  const [activeTab, setActiveTab] = useState<"appointments" | "tickets">("appointments");
  const navigate = useNavigate();

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
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, Alex
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your appointments and support tickets
              </p>
            </motion.div>

            {/* Quick Stats */}
            <StaggerContainer className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Calendar, label: "Upcoming Appointments", value: "2" },
                { icon: MessageSquare, label: "Open Tickets", value: "1" },
                { icon: CheckCircle2, label: "Resolved This Month", value: "5" },
              ].map((stat, index) => (
                <AnimatedListItem key={stat.label}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center gap-4 rounded-xl bg-card p-5 shadow-card"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </motion.div>
                </AnimatedListItem>
              ))}
            </StaggerContainer>

            {/* Tabs */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-1 rounded-lg bg-card p-1">
                {[
                  { id: "appointments", label: "Appointments", icon: Calendar },
                  { id: "tickets", label: "Support Tickets", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "appointments" | "tickets")}
                    className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeStudentTab"
                        className="absolute inset-0 rounded-md bg-accent"
                        style={{ zIndex: -1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <motion.div {...buttonMotionProps}>
                <Button onClick={() => navigate(activeTab === "appointments" ? "/booking" : "/helpdesk")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {activeTab === "appointments" ? "Book Appointment" : "New Ticket"}
                </Button>
              </motion.div>
            </div>

            {/* Search */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "appointments" ? (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
                      whileHover={{ y: -2 }}
                      className="flex items-center justify-between rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                    >
                        <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                            apt.status === "completed"
                              ? "bg-success/10 text-success"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {apt.status === "completed" ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <Calendar className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{apt.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            with {apt.facilitator}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{apt.date}</p>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {apt.time}
                          </p>
                        </div>
                        <Badge
                          variant={apt.status === "completed" ? "secondary" : "default"}
                        >
                          {apt.status === "completed" ? "Completed" : "Upcoming"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
                      whileHover={{ y: -2 }}
                      className={`flex items-center justify-between rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated ${
                        priorityConfig[ticket.priority as keyof typeof priorityConfig]
                      }`}
                    >
                        <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          {ticket.status === "resolved" ? (
                            <CheckCircle2 className="h-6 w-6 text-success" />
                          ) : ticket.status === "open" ? (
                            <AlertCircle className="h-6 w-6 text-warning" />
                          ) : (
                            <MessageSquare className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {ticket.subject}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {ticket.id}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last updated {ticket.lastUpdate}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          statusConfig[ticket.status as keyof typeof statusConfig].color
                        }
                      >
                        {statusConfig[ticket.status as keyof typeof statusConfig].label}
                      </Badge>
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

export default StudentPortal;
