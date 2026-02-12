import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  StaggerContainer,
  AnimatedListItem,
  AnimatedCard,
  fadeInUp,
  defaultTransition,
} from "@/components/ui/motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
const requests = [
  {
    id: 1,
    student: "Jordan Mugisha",
    subject: "Assignment Submission Error",
    summary: "Can't submit assignment on Canvas — upload keeps failing before deadline",
    aiConfidence: 92,
    aiCategory: "Assignment Issues",
    aiSuggestion: "Auto-assigned — confidence ≥70%. Suggest checking file format and size limits.",
    priority: "high",
    time: "5 min ago",
    status: "new",
  },
  {
    id: 2,
    student: "Amara Uwimana",
    subject: "Grade Appeal - Midterm",
    summary: "Requesting review of midterm exam grading in COMP 201",
    aiConfidence: 78,
    aiCategory: "Grade Appeals",
    aiSuggestion: "Auto-assigned — confidence ≥70%. Schedule meeting with course facilitator.",
    priority: "medium",
    time: "18 min ago",
    status: "new",
  },
  {
    id: 3,
    student: "Kwame Nkrumah",
    subject: "Capstone Scope Clarification",
    summary: "Needs guidance on narrowing down capstone project scope",
    aiConfidence: 55,
    aiCategory: "Capstone",
    aiSuggestion: "Flagged for review — confidence <70%. Requires manual categorization.",
    priority: "high",
    time: "32 min ago",
    status: "needs-review",
  },
  {
    id: 4,
    student: "Fatoumata Diallo",
    subject: "Transcript Request",
    summary: "How to request official transcript for graduate school application",
    aiConfidence: 95,
    aiCategory: "Administrative",
    aiSuggestion: "Auto-resolved — provided step-by-step instructions via knowledge base.",
    priority: "low",
    time: "1 hour ago",
    status: "resolved",
  },
];

const confidenceColors = (confidence: number) => {
  if (confidence >= 70) return "bg-success/15 text-success border-success/40";
  return "bg-destructive/15 text-destructive border-destructive/40";
};

const priorityColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
};

const FacilitatorDashboard = () => {
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<(typeof requests)[0] | null>(
    null
  );
  const [resolvedIds, setResolvedIds] = useState<number[]>([4]); // id 4 is already resolved
  const { toast } = useToast();

  const handleEscalate = (request: (typeof requests)[0]) => {
    setSelectedRequest(request);
    setEscalateOpen(true);
  };

  const handleResolve = useCallback((request: (typeof requests)[0]) => {
    setResolvedIds((prev) => [...prev, request.id]);
    toast({
      title: "Ticket Resolved",
      description: `"${request.subject}" has been marked as resolved.`,
    });
  }, [toast]);

  const handleView = useCallback((request: (typeof requests)[0]) => {
    toast({
      title: request.subject,
      description: `Student: ${request.student}\nCategory: ${request.aiCategory} (${request.aiConfidence}% confidence)\n${request.summary}`,
    });
  }, [toast]);

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
                <h1 className="text-3xl font-bold text-foreground">
                  Facilitator Dashboard
                </h1>
                <p className="mt-2 text-muted-foreground">
                  AI-assisted request management
                </p>
              </div>
              <Badge variant="outline" className="gap-2 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                AI Active
              </Badge>
            </motion.div>

            {/* Stats Grid */}
            <StaggerContainer className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: MessageSquare,
                  label: "Active Requests",
                  value: "12",
                  change: "+3",
                  positive: false,
                },
                {
                  icon: Sparkles,
                  label: "AI Resolved",
                  value: "28",
                  change: "+8",
                  positive: true,
                },
                {
                  icon: Clock,
                  label: "Avg. Response",
                  value: "4m",
                  change: "-2m",
                  positive: true,
                },
                {
                  icon: TrendingUp,
                  label: "Satisfaction",
                  value: "94%",
                  change: "+2%",
                  positive: true,
                },
              ].map((stat) => (
                <AnimatedListItem key={stat.label}>
                  <AnimatedCard className="rounded-xl bg-card p-5 shadow-card">
                    <div className="flex items-center justify-between">
                       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                         <stat.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          stat.positive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {stat.change}
                        <ArrowUpRight
                          className={`h-3 w-3 ${!stat.positive && "rotate-90"}`}
                        />
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </AnimatedCard>
                </AnimatedListItem>
              ))}
            </StaggerContainer>

            {/* Request Queue */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Request Queue
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {requests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
                      whileHover={{ y: -2 }}
                      className="group rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {request.student
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-foreground">
                                {request.subject}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  priorityColors[
                                    request.priority as keyof typeof priorityColors
                                  ]
                                }
                              >
                                {request.priority}
                              </Badge>
                              {request.status === "needs-review" && (
                                <Badge
                                  variant="outline"
                                  className="bg-warning/10 text-warning"
                                >
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Needs Review
                                </Badge>
                              )}
                              {request.status === "resolved" && (
                                <Badge
                                  variant="outline"
                                  className="bg-success/10 text-success"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {request.student} • {request.time}
                            </p>
                            <p className="mt-2 text-sm text-foreground/80">
                              {request.summary}
                            </p>

                            {/* AI Suggestion - More Prominent */}
                            <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${confidenceColors(
                                    request.aiConfidence
                                  )}`}
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  AI: {request.aiConfidence}% — {(request as any).aiCategory}
                                </motion.div>
                                <span className="text-sm font-medium text-foreground">
                                  Suggested Action:
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {request.aiSuggestion}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button size="sm" variant="ghost" onClick={() => handleView(request)}>
                            View
                          </Button>
                          {!resolvedIds.includes(request.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEscalate(request)}
                            >
                              Escalate
                            </Button>
                          )}
                          {!resolvedIds.includes(request.id) && (
                            <Button size="sm" onClick={() => handleResolve(request)}>Resolve</Button>
                          )}
                          {resolvedIds.includes(request.id) && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </PageTransition>
      </main>
      <Footer />

      {/* Escalation Modal */}
      <AnimatePresence>
        {escalateOpen && (
          <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
            <DialogContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle>Escalate Request</DialogTitle>
                  <DialogDescription>
                    Escalating: {selectedRequest?.subject}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Escalation Notes
                  </label>
                  <Textarea
                    placeholder="Add context for the receiving team..."
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setEscalateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setEscalateOpen(false);
                    toast({
                      title: "Request Escalated",
                      description: `"${selectedRequest?.subject}" has been escalated to the admin team.`,
                    });
                  }}>
                    Confirm Escalation
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitatorDashboard;
