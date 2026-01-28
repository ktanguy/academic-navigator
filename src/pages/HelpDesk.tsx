import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PageTransition,
  StaggerContainer,
  AnimatedListItem,
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";

const existingTickets = [
  {
    id: "TKT-001",
    subject: "Course Registration Help",
    category: "Academic Services",
    status: "open",
    confidence: 92,
    lastUpdate: "2 hours ago",
    description: "I need help adding a course that shows as full but I have a prerequisite override.",
  },
  {
    id: "TKT-002",
    subject: "Library Access Issue",
    category: "Technical Support",
    status: "in-progress",
    confidence: 87,
    lastUpdate: "1 day ago",
    description: "My library card is not working at the entrance scanners.",
  },
  {
    id: "TKT-003",
    subject: "Scholarship Application Question",
    category: "Financial Aid",
    status: "answered",
    confidence: 95,
    lastUpdate: "3 days ago",
    description: "Question about the deadline for merit scholarship applications.",
  },
  {
    id: "TKT-004",
    subject: "Lab Equipment Request",
    category: "Facilities",
    status: "escalated",
    confidence: 78,
    lastUpdate: "5 days ago",
    description: "Need access to specialized equipment for my research project.",
  },
];

const statusConfig = {
  open: { color: "bg-warning text-warning-foreground", icon: Clock, label: "Open" },
  "in-progress": { color: "bg-primary text-primary-foreground", icon: Loader2, label: "In Progress" },
  answered: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Answered" },
  escalated: { color: "bg-destructive text-destructive-foreground", icon: ArrowUpRight, label: "Escalated" },
};

const HelpDesk = () => {
  const [ticketText, setTicketText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [aiResult, setAiResult] = useState({
    category: "",
    confidence: 0,
    suggestions: [] as string[],
  });

  const handleSubmit = async () => {
    if (!ticketText.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock AI categorization result
    setAiResult({
      category: "Academic Services",
      confidence: 89,
      suggestions: [
        "Contact the Registrar's Office",
        "Check your student portal for updates",
        "Schedule a meeting with your advisor",
      ],
    });
    
    setIsSubmitting(false);
    setShowResult(true);
  };

  const handleNewTicket = () => {
    setTicketText("");
    setShowResult(false);
    setAiResult({ category: "", confidence: 0, suggestions: [] });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };

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
              <h1 className="text-3xl font-bold text-foreground">Help Desk</h1>
              <p className="mt-2 text-muted-foreground">
                Submit a support ticket and get AI-powered assistance
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Submit Ticket */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                <div className="rounded-2xl bg-card p-6 shadow-card">
                  <h2 className="mb-5 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-lg font-semibold text-primary-foreground">
                    <MessageSquare className="h-5 w-5 text-primary-foreground" />
                    Submit a Ticket
                  </h2>

                  <AnimatePresence mode="wait">
                    {!showResult ? (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input id="subject" placeholder="Brief summary of your issue" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Describe your problem</Label>
                          <Textarea
                            id="description"
                            placeholder="Please provide as much detail as possible about your issue..."
                            rows={6}
                            value={ticketText}
                            onChange={(e) => setTicketText(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Attachments (Optional)</Label>
                          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary/50">
                            <div className="text-center">
                              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                              <p className="mt-3 text-sm font-medium text-foreground">
                                Drag & drop files here
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                or click to browse (max 10MB)
                              </p>
                            </div>
                          </div>
                        </div>

                        <motion.div {...buttonMotionProps}>
                          <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!ticketText.trim() || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Ticket
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        {/* AI Classification Result */}
                        <div className="rounded-xl bg-primary p-5">
                          <div className="mb-4 flex items-center gap-2 text-primary-foreground">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                            <span className="font-semibold">
                              AI Classification Result
                            </span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {aiResult.category}
                              </p>
                            </div>
                            <div className="rounded-lg bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Confidence</p>
                              <p
                                className={`mt-1 text-lg font-semibold ${getConfidenceColor(
                                  aiResult.confidence
                                )}`}
                              >
                                {aiResult.confidence}%
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="mb-2 text-xs text-primary-foreground/70">
                              Suggested Actions
                            </p>
                            <ul className="space-y-2">
                              {aiResult.suggestions.map((suggestion, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-primary-foreground"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-center rounded-lg bg-success/10 p-4">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-success" />
                          <span className="font-medium text-success">
                            Ticket submitted successfully!
                          </span>
                        </div>

                        <motion.div {...buttonMotionProps}>
                          <Button variant="outline" className="w-full" onClick={handleNewTicket}>
                            Submit Another Ticket
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Existing Tickets */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                <h2 className="mb-5 text-lg font-semibold text-foreground">Your Tickets</h2>
                <StaggerContainer className="space-y-4">
                  {existingTickets.map((ticket) => {
                    const StatusIcon = statusConfig[ticket.status as keyof typeof statusConfig].icon;
                    return (
                      <AnimatedListItem key={ticket.id}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                                <span className="text-xs text-muted-foreground">{ticket.id}</span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {ticket.description}
                              </p>
                            </div>
                            <Badge
                              className={
                                statusConfig[ticket.status as keyof typeof statusConfig].color
                              }
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig[ticket.status as keyof typeof statusConfig].label}
                            </Badge>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {ticket.category}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${getConfidenceColor(
                                  ticket.confidence
                                )}`}
                              >
                                {ticket.confidence}% confidence
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {ticket.lastUpdate}
                            </span>
                          </div>
                        </motion.div>
                      </AnimatedListItem>
                    );
                  })}
                </StaggerContainer>
              </motion.div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default HelpDesk;
