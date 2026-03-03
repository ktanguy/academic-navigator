import { useState, useCallback, useEffect } from "react";
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
  BookOpen,
  Home,
  UserCog,
  HeartPulse,
  Monitor,
  FileText,
  GraduationCap,
  LucideIcon,
  Filter,
  Building2,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ticketsApi, Ticket } from "@/services/api";
import { OfficeHoursManager } from "@/components/OfficeHoursManager";

// Escalation destinations based on the proposal
const escalationDestinations: {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    id: "academic-affairs",
    name: "Academic Affairs",
    description: "Grade appeals, course issues, academic policies",
    icon: BookOpen,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "student-life",
    name: "Student Life Department",
    description: "Housing, extracurriculars, student wellbeing",
    icon: Home,
    color: "text-green-500 bg-green-500/10",
  },
  {
    id: "dean-of-students",
    name: "Dean of Students",
    description: "Serious academic or personal matters",
    icon: UserCog,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "health-services",
    name: "Health Services (Nurse)",
    description: "Medical accommodations, health concerns",
    icon: HeartPulse,
    color: "text-red-500 bg-red-500/10",
  },
  {
    id: "it-support",
    name: "IT Support",
    description: "Technical issues, system access, Canvas problems",
    icon: Monitor,
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    id: "registrar",
    name: "Registrar's Office",
    description: "Transcripts, enrollment, official documents",
    icon: FileText,
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    id: "capstone-committee",
    name: "Capstone Committee",
    description: "Capstone project approvals, advisor assignments",
    icon: GraduationCap,
    color: "text-indigo-500 bg-indigo-500/10",
  },
];

// Map AI categories to departments
const categoryToDepartment: Record<string, string> = {
  "Assignment Issues": "academic-affairs",
  "Grade Appeals": "academic-affairs",
  "Capstone": "capstone-committee",
  "Administrative": "registrar",
  "General Inquiry": "student-life",
  "Technical Issues": "it-support",
  "Health Concerns": "health-services",
};

const requests = [
  {
    id: 1,
    student: "Jordan Mugisha",
    subject: "Assignment Submission Error",
    summary: "Can't submit assignment on Canvas — upload keeps failing before deadline",
    aiConfidence: 92,
    aiCategory: "Assignment Issues",
    department: "academic-affairs",
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
    department: "academic-affairs",
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
    department: "capstone-committee",
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
    department: "registrar",
    aiSuggestion: "Auto-resolved — provided step-by-step instructions via knowledge base.",
    priority: "low",
    time: "1 hour ago",
    status: "resolved",
  },
  {
    id: 5,
    student: "Grace Iradukunda",
    subject: "Canvas Login Issues",
    summary: "Unable to access Canvas LMS - password reset not working",
    aiConfidence: 88,
    aiCategory: "Technical Issues",
    department: "it-support",
    aiSuggestion: "Auto-assigned — IT Support ticket. Check SSO integration status.",
    priority: "high",
    time: "45 min ago",
    status: "new",
  },
  {
    id: 6,
    student: "Emmanuel Habimana",
    subject: "Housing Application Status",
    summary: "Inquiring about on-campus housing application for next semester",
    aiConfidence: 91,
    aiCategory: "General Inquiry",
    department: "student-life",
    aiSuggestion: "Auto-assigned — Student Life inquiry. Provide housing portal link.",
    priority: "low",
    time: "2 hours ago",
    status: "new",
  },
  {
    id: 7,
    student: "Clarisse Uwase",
    subject: "Medical Accommodation Request",
    summary: "Requesting exam accommodations due to medical condition",
    aiConfidence: 87,
    aiCategory: "Health Concerns",
    department: "health-services",
    aiSuggestion: "Auto-assigned — Requires medical documentation verification.",
    priority: "high",
    time: "1 hour ago",
    status: "new",
  },
  {
    id: 8,
    student: "Patrick Niyonzima",
    subject: "Dean's List Inquiry",
    summary: "Question about requirements for Dean's List recognition",
    aiConfidence: 82,
    aiCategory: "Administrative",
    department: "dean-of-students",
    aiSuggestion: "Auto-assigned — Provide Dean's List criteria from student handbook.",
    priority: "low",
    time: "3 hours ago",
    status: "new",
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

// Transform API ticket to display format
interface DisplayRequest {
  id: number;
  student: string;
  subject: string;
  summary: string;
  aiConfidence: number;
  aiCategory: string;
  department: string;
  aiSuggestion: string;
  priority: string;
  time: string;
  status: string;
}

const transformTicketToRequest = (ticket: Ticket): DisplayRequest => {
  const aiConfidence = ticket.ai_confidence ?? Math.floor(Math.random() * 40 + 60);
  const aiCategory = ticket.category || "General Inquiry";
  const department = categoryToDepartment[aiCategory] || "student-life";
  
  // Get user name from submitter object or user_name field
  const studentName = ticket.submitter?.name || ticket.user_name || "Unknown Student";
  
  // Map status - treat 'closed' as resolved
  const isResolved = ticket.status === "closed" || ticket.status === "resolved";
  const displayStatus = isResolved ? "resolved" : (aiConfidence < 70 ? "needs-review" : "new");
  
  return {
    id: ticket.id,
    student: studentName,
    subject: ticket.subject,
    summary: ticket.description,
    aiConfidence,
    aiCategory,
    department,
    aiSuggestion: aiConfidence >= 70 
      ? `Auto-assigned — confidence ≥70%. Category: ${aiCategory}` 
      : `Flagged for review — confidence <70%. Requires manual categorization.`,
    priority: ticket.priority || "medium",
    time: new Date(ticket.created_at).toLocaleString(),
    status: displayStatus,
  };
};

const FacilitatorDashboard = () => {
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DisplayRequest | null>(null);
  const [resolvedIds, setResolvedIds] = useState<number[]>([]);
  const [escalatedIds, setEscalatedIds] = useState<number[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [escalationNotes, setEscalationNotes] = useState("");
  const [escalationUrgency, setEscalationUrgency] = useState("normal");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [displayRequests, setDisplayRequests] = useState<DisplayRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRequests: 0,
    aiResolved: 0,
    avgResponse: "4m",
    satisfaction: "94%",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketsApi.getAll();
        const tickets = response.tickets || [];
        const transformed = tickets.map(transformTicketToRequest);
        setDisplayRequests(transformed);
        
        // Calculate stats
        const resolved = transformed.filter(r => r.status === "resolved");
        const aiResolvedCount = resolved.filter(r => r.aiConfidence >= 70).length;
        setStats({
          activeRequests: transformed.filter(r => r.status !== "resolved").length,
          aiResolved: aiResolvedCount,
          avgResponse: "4m",
          satisfaction: "94%",
        });
        
        // Track already resolved tickets
        setResolvedIds(resolved.map(r => r.id));
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        // Fall back to demo data
        const transformed = requests.map((r, idx) => ({ ...r, id: r.id || idx + 1 }));
        setDisplayRequests(transformed);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
  }, []);

  // Filter requests based on selected department and status
  const filteredRequests = displayRequests.filter((request) => {
    const matchesDepartment = departmentFilter === "all" || request.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "resolved" && resolvedIds.includes(request.id)) ||
      (statusFilter === "escalated" && escalatedIds.includes(request.id)) ||
      (statusFilter === "needs-review" && request.status === "needs-review" && !resolvedIds.includes(request.id) && !escalatedIds.includes(request.id)) ||
      (statusFilter === "open" && request.status === "new" && !resolvedIds.includes(request.id) && !escalatedIds.includes(request.id));
    return matchesDepartment && matchesStatus;
  });

  const handleEscalate = (request: DisplayRequest) => {
    setSelectedRequest(request);
    setSelectedDestination("");
    setEscalationNotes("");
    setEscalationUrgency("normal");
    setEscalateOpen(true);
  };

  const handleView = (request: DisplayRequest) => {
    setSelectedRequest(request);
    setViewOpen(true);
  };

  const handleConfirmEscalation = async () => {
    if (!selectedDestination) {
      toast({
        title: "Select Destination",
        description: "Please select where to escalate this request.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update ticket status via API
      await ticketsApi.update(selectedRequest!.id, { 
        status: "escalated",
        category: selectedDestination 
      });
      
      const destination = escalationDestinations.find(d => d.id === selectedDestination);
      setEscalatedIds((prev) => [...prev, selectedRequest!.id]);
      setEscalateOpen(false);
      toast({
        title: "Request Escalated",
        description: `"${selectedRequest?.subject}" has been escalated to ${destination?.name}.`,
      });
    } catch (error) {
      toast({
        title: "Escalation Failed",
        description: "Failed to escalate the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolve = useCallback(async (request: DisplayRequest) => {
    try {
      await ticketsApi.update(request.id, { status: "closed" });
      setResolvedIds((prev) => [...prev, request.id]);
      toast({
        title: "Ticket Resolved",
        description: `"${request.subject}" has been marked as resolved.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Resolve",
        description: "Could not mark ticket as resolved. Please try again.",
        variant: "destructive",
      });
    }
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
                  value: stats.activeRequests.toString(),
                  change: "+3",
                  positive: false,
                },
                {
                  icon: Sparkles,
                  label: "AI Resolved",
                  value: stats.aiResolved.toString(),
                  change: "+8",
                  positive: true,
                },
                {
                  icon: Clock,
                  label: "Avg. Response",
                  value: stats.avgResponse,
                  change: "-2m",
                  positive: true,
                },
                {
                  icon: TrendingUp,
                  label: "Satisfaction",
                  value: stats.satisfaction,
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
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Request Queue
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filteredRequests.length} tickets)
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Department Filter */}
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[200px]">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="font-medium">All Departments</span>
                      </SelectItem>
                      {escalationDestinations.map((dest) => {
                        const IconComponent = dest.icon;
                        const count = requests.filter(r => r.department === dest.id).length;
                        return (
                          <SelectItem key={dest.id} value={dest.id}>
                            <div className="flex items-center gap-2">
                              <div className={`flex h-5 w-5 items-center justify-center rounded ${dest.color}`}>
                                <IconComponent className="h-3 w-3" />
                              </div>
                              <span>{dest.name}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {count}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-primary" />
                          Open
                        </div>
                      </SelectItem>
                      <SelectItem value="needs-review">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          Needs Review
                        </div>
                      </SelectItem>
                      <SelectItem value="escalated">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-3 w-3 text-warning" />
                          Escalated
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          Resolved
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {(departmentFilter !== "all" || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDepartmentFilter("all");
                        setStatusFilter("all");
                      }}
                      className="text-muted-foreground"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filter Badge */}
              {departmentFilter !== "all" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2"
                >
                  {(() => {
                    const dept = escalationDestinations.find(d => d.id === departmentFilter);
                    if (!dept) return null;
                    const IconComponent = dept.icon;
                    return (
                      <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${dept.color}`}>
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">Viewing: {dept.name}</span>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredRequests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-dashed p-8 text-center"
                    >
                      <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-muted-foreground">No tickets match your filters</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setDepartmentFilter("all");
                          setStatusFilter("all");
                        }}
                      >
                        Clear all filters
                      </Button>
                    </motion.div>
                  ) : (
                  filteredRequests.map((request, index) => (
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
                            <div className="flex flex-wrap items-center gap-2">
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
                              {/* Department Badge */}
                              {(() => {
                                const dept = escalationDestinations.find(d => d.id === request.department);
                                if (!dept) return null;
                                const IconComponent = dept.icon;
                                return (
                                  <Badge variant="outline" className={`${dept.color} border-transparent`}>
                                    <IconComponent className="mr-1 h-3 w-3" />
                                    {dept.name}
                                  </Badge>
                                );
                              })()}
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
                              {escalatedIds.includes(request.id) && (
                                <Badge
                                  variant="outline"
                                  className="bg-warning/10 text-warning"
                                >
                                  <ArrowUpRight className="mr-1 h-3 w-3" />
                                  Escalated
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
                          {!resolvedIds.includes(request.id) && !escalatedIds.includes(request.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEscalate(request)}
                            >
                              Escalate
                            </Button>
                          )}
                          {!resolvedIds.includes(request.id) && !escalatedIds.includes(request.id) && (
                            <Button size="sm" onClick={() => handleResolve(request)}>Resolve</Button>
                          )}
                          {resolvedIds.includes(request.id) && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          )}
                          {escalatedIds.includes(request.id) && (
                            <Badge variant="outline" className="bg-warning/10 text-warning">
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                              Escalated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Office Hours Management */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.3 }}
              className="mt-8"
            >
              <OfficeHoursManager />
            </motion.div>
          </div>
        </PageTransition>
      </main>
      <Footer />

      {/* Escalation Modal */}
      <AnimatePresence>
        {escalateOpen && (
          <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
            <DialogContent className="max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-warning" />
                    Escalate Request
                  </DialogTitle>
                  <DialogDescription>
                    Escalating: <span className="font-medium text-foreground">{selectedRequest?.subject}</span>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-4">
                  {/* Destination Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Escalate To <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department or team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {escalationDestinations.map((dest) => {
                          const IconComponent = dest.icon;
                          return (
                            <SelectItem key={dest.id} value={dest.id}>
                              <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${dest.color}`}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{dest.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedDestination && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2"
                      >
                        {(() => {
                          const dest = escalationDestinations.find(d => d.id === selectedDestination);
                          if (!dest) return null;
                          const IconComponent = dest.icon;
                          return (
                            <>
                              <div className={`flex h-6 w-6 items-center justify-center rounded ${dest.color}`}>
                                <IconComponent className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs text-muted-foreground">{dest.description}</span>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>

                  {/* Urgency Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Urgency Level</Label>
                    <RadioGroup
                      value={escalationUrgency}
                      onValueChange={setEscalationUrgency}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="normal" />
                        <Label htmlFor="normal" className="cursor-pointer text-sm font-normal">
                          Normal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="urgent" id="urgent" />
                        <Label htmlFor="urgent" className="cursor-pointer text-sm font-normal text-warning">
                          Urgent
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="critical" id="critical" />
                        <Label htmlFor="critical" className="cursor-pointer text-sm font-normal text-destructive">
                          Critical
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Escalation Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Escalation Notes
                    </Label>
                    <Textarea
                      placeholder="Add context for the receiving team (what you've tried, relevant details, etc.)..."
                      rows={4}
                      value={escalationNotes}
                      onChange={(e) => setEscalationNotes(e.target.value)}
                    />
                  </div>

                  {/* Request Summary */}
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Request Summary</p>
                    <p className="text-sm text-foreground">{selectedRequest?.summary}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedRequest?.aiCategory}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        From: {selectedRequest?.student}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setEscalateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmEscalation}
                    className="bg-warning text-warning-foreground hover:bg-warning/90"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Confirm Escalation
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* View Request Modal */}
      <AnimatePresence>
        {viewOpen && selectedRequest && (
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {selectedRequest.subject}
                  </DialogTitle>
                  <DialogDescription>
                    Ticket Details
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                      {selectedRequest.student
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedRequest.student}</p>
                      <p className="text-sm text-muted-foreground">Submitted {selectedRequest.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-auto ${
                        priorityColors[selectedRequest.priority as keyof typeof priorityColors]
                      }`}
                    >
                      {selectedRequest.priority} priority
                    </Badge>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3 rounded-lg border p-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm text-foreground">{selectedRequest.summary}</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">AI Analysis</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{selectedRequest.aiCategory}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Confidence Score</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-secondary">
                            <div 
                              className={`h-full rounded-full ${
                                selectedRequest.aiConfidence >= 70 ? 'bg-success' : 'bg-warning'
                              }`}
                              style={{ width: `${selectedRequest.aiConfidence}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${
                            selectedRequest.aiConfidence >= 70 ? 'text-success' : 'text-warning'
                          }`}>
                            {selectedRequest.aiConfidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs text-muted-foreground">AI Suggestion</Label>
                      <p className="mt-1 text-sm text-foreground">{selectedRequest.aiSuggestion}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-muted-foreground">Current Status:</Label>
                    {resolvedIds.includes(selectedRequest.id) ? (
                      <Badge className="bg-success/10 text-success border-success/40">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Resolved
                      </Badge>
                    ) : escalatedIds.includes(selectedRequest.id) ? (
                      <Badge className="bg-warning/10 text-warning border-warning/40">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        Escalated
                      </Badge>
                    ) : selectedRequest.status === "needs-review" ? (
                      <Badge className="bg-warning/10 text-warning border-warning/40">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Needs Review
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-primary/40">
                        <Clock className="mr-1 h-3 w-3" />
                        Open
                      </Badge>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" onClick={() => setViewOpen(false)}>
                    Close
                  </Button>
                  {!resolvedIds.includes(selectedRequest.id) && !escalatedIds.includes(selectedRequest.id) && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setViewOpen(false);
                          handleEscalate(selectedRequest);
                        }}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Escalate
                      </Button>
                      <Button onClick={() => {
                        handleResolve(selectedRequest);
                        setViewOpen(false);
                      }}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Resolve
                      </Button>
                    </>
                  )}
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
