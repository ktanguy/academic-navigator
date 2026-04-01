import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Search,
  Filter,
  Eye,
  BookOpen,
  GraduationCap,
  FileText,
  HelpCircle,
  AlertTriangle,
  Zap,
  X,
  Paperclip,
  User,
  Building2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageTransition,
  StaggerContainer,
  AnimatedListItem,
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";
import { useAuth } from "@/contexts/AuthContext";
import { ticketsApi, Ticket, sendGmailNotification } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Ticket categories with icons
const ticketCategories = [
  { id: "assignment", label: "Assignment Issues", icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "grades", label: "Grade Appeals", icon: FileText, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "capstone", label: "Capstone Project", icon: GraduationCap, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  { id: "administrative", label: "Administrative", icon: Building2, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "technical", label: "Technical Support", icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-500/10" },
  { id: "general", label: "General Inquiry", icon: HelpCircle, color: "text-green-500", bgColor: "bg-green-500/10" },
];

// Priority levels
const priorityLevels = [
  { id: "low", label: "Low", description: "General questions, no deadline", color: "bg-muted text-muted-foreground", icon: Clock },
  { id: "medium", label: "Medium", description: "Within a week", color: "bg-warning/15 text-warning", icon: AlertCircle },
  { id: "high", label: "High", description: "Urgent, within 48 hours", color: "bg-destructive/15 text-destructive", icon: AlertTriangle },
];

// FAQ items
const faqItems = [
  { question: "How do I reset my Canvas password?", answer: "Go to Canvas login page and click 'Forgot Password'. Follow the email instructions." },
  { question: "When are office hours?", answer: "Check the Directory page for each facilitator's office hours schedule." },
  { question: "How do I request a transcript?", answer: "Submit an Administrative ticket or visit the Registrar's Office directly." },
  { question: "Where can I find capstone guidelines?", answer: "Capstone guidelines are available on the Student Portal under Resources." },
];


const statusConfig = {
  open: { color: "bg-warning text-warning-foreground", icon: Clock, label: "Open" },
  "in-progress": { color: "bg-primary text-primary-foreground", icon: Loader2, label: "In Progress" },
  answered: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Answered" },
  escalated: { color: "bg-destructive text-destructive-foreground", icon: ArrowUpRight, label: "Escalated" },
  closed: { color: "bg-muted text-muted-foreground", icon: CheckCircle2, label: "Closed" },
};

// Default status for unknown status values
const defaultStatus = { color: "bg-muted text-muted-foreground", icon: Clock, label: "Unknown" };

// Helper function to safely get status config
const getStatusConfig = (status: string | undefined | null) => {
  if (!status) return defaultStatus;
  return statusConfig[status as keyof typeof statusConfig] || defaultStatus;
};

// Display ticket type that works for both API and demo data
interface DisplayTicket {
  id: number | string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  ai_category?: string;
  ai_confidence?: number;
  created_at?: string;
  updated_at?: string;
  assignee?: { name: string } | null;
  department?: string;
  responses?: Array<{ from?: string; message: string; time?: string; created_at?: string; user?: { name: string } }>;
}

const HelpDesk = () => {
  const [ticketText, setTicketText] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTicketOpen, setViewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<DisplayTicket | null>(null);
  const [showFaq, setShowFaq] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [aiResult, setAiResult] = useState({
    category: "",
    confidence: 0,
    suggestions: [] as string[],
    estimatedTime: "",
    assignedTo: "",
    ticketNumber: "",
  });

  // Fetch user tickets on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserTickets();
    }
  }, [isAuthenticated]);

  const fetchUserTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const response = await ticketsApi.getAll();
      setUserTickets(response.tickets);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSendReply = async (ticketId: number) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await ticketsApi.addResponse(ticketId, replyText.trim());
      setReplyText("");
      toast({ title: "Reply sent", description: "Your message has been added to the ticket." });
      await fetchUserTickets();
    } catch (error) {
      toast({ title: "Failed to send", description: error instanceof Error ? error.message : "Could not send reply.", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Use API tickets if authenticated, otherwise show demo tickets
  const displayTickets: DisplayTicket[] = isAuthenticated 
    ? userTickets.map(t => ({
        id: t.id,
        ticket_number: t.ticket_number,
        subject: t.subject,
        description: t.description,
        category: t.category,
        status: t.status,
        priority: t.priority,
        ai_category: t.ai_category,
        ai_confidence: t.ai_confidence ? t.ai_confidence * 100 : undefined,
        created_at: t.created_at,
        updated_at: t.updated_at,
        assignee: t.assignee,
        department: t.department,
        responses: t.responses?.map(r => ({
          message: r.message,
          created_at: r.created_at,
          user: r.user,
        })),
      }))
    : [];

  // Filter tickets
  const filteredTickets = displayTickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get category info
  const getCategoryInfo = (categoryId: string | undefined | null) => {
    if (!categoryId) {
      return ticketCategories[5]; // Default to "general"
    }
    return ticketCategories.find(c => c.id === categoryId) || ticketCategories[5];
  };

  const handleSubmit = async () => {
    if (!ticketText.trim() || !ticketSubject.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isAuthenticated) {
        // Use real API for authenticated users
        const response = await ticketsApi.create({
          subject: ticketSubject,
          description: ticketText,
          category: selectedCategory || "general",
          priority: selectedPriority || "medium",
        });
        
        const ticket = response.ticket;
        const categoryInfo = getCategoryInfo(ticket.ai_category || ticket.category);
        
        setAiResult({
          category: categoryInfo.label,
          confidence: Math.round((ticket.ai_confidence || 0.85) * 100),
          suggestions: [
            `Ticket ${ticket.ticket_number} created successfully`,
            "You can track status updates in real-time from this page",
            ticket.priority === "high" ? "Flagged as urgent - prioritized in queue" : "Expected response within 24-48 hours",
          ],
          estimatedTime: ticket.priority === "high" ? "4-8 hours" : ticket.priority === "medium" ? "24-48 hours" : "2-3 days",
          assignedTo: ticket.assignee?.name || "Support Team",
          ticketNumber: ticket.ticket_number,
        });
        
        // Refresh tickets list
        fetchUserTickets();
        
        toast({
          title: "Ticket Submitted",
          description: `Your ticket ${ticket.ticket_number} has been created.`,
        });
      } else {
        // Demo mode for unauthenticated users
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const detectedCategory = selectedCategory || "assignment";
        const categoryInfo = getCategoryInfo(detectedCategory);
        
        setAiResult({
          category: categoryInfo.label,
          confidence: Math.floor(Math.random().toString(36).substr(2, 6).toUpperCase()),
          suggestions: [
            `Ticket auto-assigned to ${detectedCategory === "technical" ? "IT Support" : "Academic Affairs"} facilitator`,
            "Expected response within 24 hours based on current queue",
            "Sign in to track your tickets and receive updates",
            selectedPriority === "high" ? "Flagged as urgent - prioritized in queue" : "Check FAQ section for immediate answers",
          ],
          estimatedTime: selectedPriority === "high" ? "4-8 hours" : selectedPriority === "medium" ? "24-48 hours" : "2-3 days",
          assignedTo: detectedCategory === "technical" ? "IT Support Team" : "Dr. Sarah Chen",
          ticketNumber: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowResult(true);
    }
  };

  const handleNewTicket = () => {
    setTicketText("");
    setTicketSubject("");
    setSelectedCategory("");
    setSelectedPriority("");
    setUploadedFiles([]);
    setShowResult(false);
    setAiResult({ category: "", confidence: 0, suggestions: [], estimatedTime: "", assignedTo: "", ticketNumber: "" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== fileName));
  };

  async function handleTicketResolved(ticket: DisplayTicket) {
    // ...existing ticket resolution logic...

    // After ticket is resolved, send Gmail notification
    if (user && user.email && user.googleAccessToken) {
      await sendGmailNotification({
        email: user.email,
        subject: 'Ticket Resolved',
        message: `Your ticket '${ticket.subject}' has been resolved.`,
        accessToken: user.googleAccessToken,
      });
    }
  }

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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Help Desk</h1>
                  <p className="mt-2 text-muted-foreground">
                    Submit a support ticket and get help from our team
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setShowFaq(!showFaq)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Quick FAQ
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Guest Notice Banner */}
            {!isAuthenticated && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.02 }}
                className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Browsing as Guest</h3>
                      <p className="text-sm text-muted-foreground">
                        You can still submit tickets and browse FAQ. Sign in to track your tickets and get faster responses.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/auth">Sign In</a>
                    </Button>
                    <Button size="sm" asChild>
                      <a href="/auth">Create Account</a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.05 }}
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                { icon: MessageSquare, label: "Open Tickets", value: userTickets.filter(t => t.status === "open").length, color: "bg-warning" },
                { icon: Loader2, label: "In Progress", value: userTickets.filter(t => t.status === "in-progress").length, color: "bg-primary" },
                { icon: CheckCircle2, label: "Resolved", value: userTickets.filter(t => t.status === "answered" || t.status === "closed").length, color: "bg-success" },
                { icon: Clock, label: "Avg. Response", value: "< 24h", color: "bg-blue-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* FAQ Section (Collapsible) */}
            <AnimatePresence>
              {showFaq && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="rounded-xl bg-card p-6 shadow-card">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Zap className="h-5 w-5 text-warning" />
                        Quick Answers
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowFaq(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {faqItems.map((faq, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-lg bg-secondary/50 p-4"
                        >
                          <p className="font-medium text-foreground">{faq.question}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                        {/* Subject */}
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input 
                            id="subject" 
                            placeholder="Brief summary of your issue"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                          />
                        </div>

                        {/* Category Selection */}
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {ticketCategories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id === selectedCategory ? "" : category.id)}
                                className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                                  selectedCategory === category.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <category.icon className={`h-4 w-4 ${category.color}`} />
                                <span className="text-xs font-medium">{category.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Describe your problem *</Label>
                          <Textarea
                            id="description"
                            placeholder="Please provide as much detail as possible about your issue..."
                            rows={5}
                            value={ticketText}
                            onChange={(e) => setTicketText(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            {ticketText.length}/1000 characters
                          </p>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                          <Label>Priority Level</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {priorityLevels.map((priority) => (
                              <button
                                key={priority.id}
                                onClick={() => setSelectedPriority(priority.id)}
                                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-colors ${
                                  selectedPriority === priority.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <priority.icon className={`h-4 w-4 ${
                                  priority.id === "high" ? "text-destructive" :
                                  priority.id === "medium" ? "text-warning" : "text-muted-foreground"
                                }`} />
                                <span className="text-xs font-medium">{priority.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                          <Label>Attachments (Optional)</Label>
                          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 transition-colors hover:border-primary/50">
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              multiple
                              onChange={handleFileUpload}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium text-foreground">
                                  Click to upload or drag & drop
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  PNG, JPG, PDF up to 10MB
                                </p>
                              </div>
                            </label>
                          </div>
                          {/* Uploaded Files */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-foreground">{file}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => removeFile(file)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <motion.div {...buttonMotionProps}>
                          <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!ticketText.trim() || !ticketSubject.trim() || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
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
                        {/* Submission Result */}
                        <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 dark:bg-card dark:from-transparent dark:to-transparent dark:border dark:border-border">
                          <div className="mb-4 flex items-center gap-2 text-primary-foreground dark:text-white">
                            <CheckCircle2 className="h-5 w-5 text-primary-foreground dark:text-white" />
                            <span className="font-semibold">
                              Ticket Submitted Successfully
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {aiResult.category}
                              </p>
                            </div>
                            <div className="rounded-lg bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Assigned To</p>
                              <p className="mt-1 font-semibold text-foreground">
                                {aiResult.assignedTo}
                              </p>
                            </div>
                            <div className="rounded-lg bg-card p-4 shadow-sm sm:col-span-2">
                              <p className="text-xs text-muted-foreground">Est. Response Time</p>
                              <p className="mt-1 font-semibold text-foreground">
                                {aiResult.estimatedTime}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="mb-2 text-xs text-primary-foreground/70 dark:text-white/70">
                              What happens next
                            </p>
                            <ul className="space-y-2">
                              <motion.li
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-2 text-sm text-primary-foreground dark:text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                Your ticket has been assigned to a facilitator
                              </motion.li>
                              <motion.li
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 text-sm text-primary-foreground dark:text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                You'll receive email updates on progress
                              </motion.li>
                              <motion.li
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 text-sm text-primary-foreground dark:text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                Track status updates from "Your Tickets" section
                              </motion.li>
                            </ul>
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center justify-center rounded-lg bg-success/10 p-4"
                        >
                          <CheckCircle2 className="mr-2 h-5 w-5 text-success" />
                          <span className="font-medium text-success">
                            Ticket {aiResult.ticketNumber || "TKT-006"} submitted successfully!
                          </span>
                        </motion.div>

                        {/* Guest Sign-up Prompt */}
                        {!isAuthenticated && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">Create an account to track your ticket</h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Sign up to receive email notifications, track status updates, and get faster responses.
                                </p>
                                <div className="mt-3 flex gap-2">
                                  <Button size="sm" asChild>
                                    <a href="/auth">Create Account</a>
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href="/auth">Sign In</a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

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
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Your Tickets</h2>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="answered">Answered</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <StaggerContainer className="space-y-4">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const statusInfo = getStatusConfig(ticket.status);
                      const StatusIcon = statusInfo.icon;
                      const categoryInfo = getCategoryInfo(ticket.category);
                      return (
                        <AnimatedListItem key={ticket.id}>
                          <motion.div
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                                  <span className="text-xs text-muted-foreground">{ticket.id}</span>
                                  {ticket.priority === "high" && (
                                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                  )}
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                  {ticket.description}
                                </p>
                              </div>
                              <Badge
                                className={statusInfo.color}
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                <span className={`flex items-center gap-1 rounded-full px-2 py-1 ${categoryInfo.bgColor}`}>
                                  <categoryInfo.icon className={`h-3 w-3 ${categoryInfo.color}`} />
                                  <span className={categoryInfo.color}>{categoryInfo.label}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.assignee?.name || "Unassigned"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {ticket.updated_at || ticket.created_at}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setViewTicketOpen(true);
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </motion.div>
                        </AnimatedListItem>
                      );
                    })
                  ) : (
                    <div className="rounded-xl bg-card p-8 text-center shadow-card">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 font-semibold text-foreground">No tickets found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </StaggerContainer>
              </motion.div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />

      {/* View Ticket Dialog */}
      <Dialog open={viewTicketOpen} onOpenChange={setViewTicketOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedTicket.ticket_number} • Created {selectedTicket.created_at}
                    </DialogDescription>
                  </div>
                  <Badge
                    className={getStatusConfig(selectedTicket.status).color}
                  >
                    {getStatusConfig(selectedTicket.status).label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Ticket Info Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="mt-1 font-medium text-foreground">
                      {getCategoryInfo(selectedTicket.category).label}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className={`mt-1 font-medium capitalize ${
                      selectedTicket.priority === "high" ? "text-destructive" :
                      selectedTicket.priority === "medium" ? "text-warning" : "text-muted-foreground"
                    }`}>
                      {selectedTicket.priority}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="mt-1 font-medium text-foreground">{selectedTicket.assignee?.name || "Unassigned"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="mt-1 font-medium text-foreground">{selectedTicket.department}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="mb-2 font-semibold text-foreground">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                </div>

                {/* Conversation Thread */}
                {selectedTicket.responses.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-foreground">Conversation</h4>
                    <div className="space-y-3">
                      {selectedTicket.responses.map((response, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`rounded-lg p-4 ${
                            response.from === "AI Assistant" || response.from === "System"
                              ? "bg-secondary/50"
                              : "bg-primary/5 border border-primary/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {response.from === "System" ? (
                                <AlertCircle className="h-4 w-4 text-warning" />
                              ) : (
                                <User className="h-4 w-4 text-success" />
                              )}
                              <span className="font-medium text-foreground text-sm">{response.from}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{response.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{response.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                <div className="border-t border-border pt-4">
                  <Label htmlFor="reply">Add a reply</Label>
                  <div className="mt-2 flex gap-2">
                    <Textarea
                      id="reply"
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button
                      className="shrink-0"
                      disabled={!replyText.trim() || isSendingReply}
                      onClick={() => selectedTicket && handleSendReply(selectedTicket.id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HelpDesk;
