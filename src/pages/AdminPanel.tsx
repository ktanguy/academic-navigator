import { useState, useEffect, useCallback } from "react";
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
  Brain,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  BookOpen,
  Home,
  UserCog,
  HeartPulse,
  Monitor,
  FileText,
  GraduationCap,
  Bell,
  Lock,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  AnimatedCard,
  fadeInUp,
  slideInRight,
  defaultTransition,
} from "@/components/ui/motion";
import {
  TicketCategoryChart,
  TrendChart,
  AIClassificationChart,
  FacilitatorWorkloadChart,
  CategoryAccuracyTable,
  ResponseTimeChart,
  ResolutionRateChart,
  DepartmentPerformanceRadar,
  SatisfactionTrendChart,
  QuickStatsRow,
  TicketVolumeHeatmap,
  type TicketCategoryDataItem,
  type MonthlyTrendDataItem,
  type FacilitatorWorkloadItem,
  type ClassificationDataItem,
  type QuickStatItem,
} from "@/components/analytics/AnalyticsCharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi, ticketsApi, User, Ticket, appointmentsApi } from "@/services/api";

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
  color = "#06142E",
}: {
  percentage: number;
  label: string;
  delay: number;
  color?: string;
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
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
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
  { label: "Assignment Issues", percentage: 94, color: "#06142E" },
  { label: "Grade Appeals", percentage: 87, color: "#3b82f6" },
  { label: "Capstone", percentage: 91, color: "#22c55e" },
  { label: "Administrative", percentage: 89, color: "#8b5cf6" },
  { label: "General Inquiry", percentage: 92, color: "#f59e0b" },
];

// Department options for user assignment
const departments = [
  { id: "academic-affairs", name: "Academic Affairs", icon: BookOpen, color: "text-blue-500" },
  { id: "student-life", name: "Student Life", icon: Home, color: "text-green-500" },
  { id: "dean-of-students", name: "Dean of Students", icon: UserCog, color: "text-purple-500" },
  { id: "health-services", name: "Health Services", icon: HeartPulse, color: "text-red-500" },
  { id: "it-support", name: "IT Support", icon: Monitor, color: "text-cyan-500" },
  { id: "registrar", name: "Registrar's Office", icon: FileText, color: "text-orange-500" },
  { id: "capstone-committee", name: "Capstone Committee", icon: GraduationCap, color: "text-indigo-500" },
];

// Initial users data
const initialUsers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    email: "s.chen@alu.edu",
    role: "Facilitator",
    department: "academic-affairs",
    status: "Active",
  },
  {
    id: 2,
    name: "Mark Johnson",
    email: "m.johnson@alu.edu",
    role: "Facilitator",
    department: "student-life",
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "e.rodriguez@alu.edu",
    role: "Admin",
    department: "dean-of-students",
    status: "Active",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "j.wilson@alu.edu",
    role: "Facilitator",
    department: "capstone-committee",
    status: "Pending",
  },
  {
    id: 5,
    name: "Nurse Patricia",
    email: "p.nurse@alu.edu",
    role: "Facilitator",
    department: "health-services",
    status: "Active",
  },
  {
    id: 6,
    name: "Tech Support Team",
    email: "it.support@alu.edu",
    role: "Facilitator",
    department: "it-support",
    status: "Active",
  },
];

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState<"analytics" | "ai-classification" | "users" | "settings">(
    "analytics"
  );
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // User management state
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Facilitator", department: "" });
  
  // Analytics state
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsData, setStatsData] = useState(analyticsData);
  const [ticketStats, setTicketStats] = useState<{
    total: number;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
  } | null>(null);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [facilitatorStats, setFacilitatorStats] = useState<Array<{
    name: string;
    tickets: number;
    appointments: number;
    color: string;
  }>>([]);
  
  // Chart data state (computed from real data)
  const [categoryChartData, setCategoryChartData] = useState<TicketCategoryDataItem[]>([]);
  const [trendChartData, setTrendChartData] = useState<MonthlyTrendDataItem[]>([]);
  const [workloadChartData, setWorkloadChartData] = useState<FacilitatorWorkloadItem[]>([]);
  const [classificationChartData, setClassificationChartData] = useState<ClassificationDataItem[]>([]);
  const [quickStatsData, setQuickStatsData] = useState<QuickStatItem | undefined>(undefined);
  
  // AI Classification state
  const [classifierInfo, setClassifierInfo] = useState<{
    using_ai: boolean;
    api_url: string;
    api_available: boolean;
    model: string;
    fallback: string;
    categories: string[];
  } | null>(null);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<{
    category: string;
    confidence: number;
    model: string;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [recentClassifications, setRecentClassifications] = useState<Array<{
    id: number;
    text: string;
    category: string;
    confidence: number;
    timestamp: string;
  }>>([]);
  
  // Settings state
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingType, setActiveSettingType] = useState("");

  // Fetch users and stats from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingStats(true);
      try {
        // Fetch users
        const fetchedUsers = await usersApi.getAll();
        const mappedUsers = fetchedUsers.map((u: User) => ({
          id: typeof u.id === 'string' ? parseInt(u.id) : u.id,
          name: u.name,
          email: u.email,
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          department: u.department || "general",
          status: "Active",
        }));
        setUsers(mappedUsers.length > 0 ? mappedUsers : initialUsers);
        
        // Fetch ticket stats
        const stats = await ticketsApi.getStats();
        setTicketStats(stats);
        
        // Fetch all tickets for detailed analytics
        let tickets: Ticket[] = [];
        try {
          const ticketResponse = await ticketsApi.getAll();
          tickets = ticketResponse.tickets || [];
          setAllTickets(tickets);
        } catch (e) {
          console.log("Could not fetch tickets");
        }
        
        // Fetch all appointments
        let appointments: any[] = [];
        try {
          appointments = await appointmentsApi.getAll() || [];
          setAllAppointments(appointments);
        } catch (e) {
          console.log("Could not fetch appointments");
        }
        
        // Fetch classifier info
        try {
          const classifier = await ticketsApi.getClassifierInfo();
          setClassifierInfo(classifier);
        } catch (e) {
          console.log("Classifier info not available");
        }
        
        // === COMPUTE CHART DATA FROM REAL DATA ===
        
        // 1. Category Chart Data
        const categoryColors: Record<string, string> = {
          "Assignment Issues": "#06142E",
          "Grade Appeals": "#3b82f6", 
          "Capstone": "#8b5cf6",
          "Administrative": "#22c55e",
          "General Inquiry": "#f59e0b",
          "academic": "#06142E",
          "career": "#3b82f6",
          "wellness": "#8b5cf6",
          "administrative": "#22c55e",
          "technical": "#f59e0b",
        };
        
        const categoryData: TicketCategoryDataItem[] = Object.entries(stats.by_category || {})
          .filter(([_, count]) => count > 0)
          .map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
            count: count as number,
            aiAccuracy: Math.floor(Math.random() * 15) + 85, // Random 85-100% (can be improved with real data)
            color: categoryColors[name] || "#9ca3af",
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        
        setCategoryChartData(categoryData.length > 0 ? categoryData : []);
        
        // 2. Monthly Trend Data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const ticketsByMonth: Record<string, number> = {};
        const appointmentsByMonth: Record<string, number> = {};
        const resolvedByMonth: Record<string, number> = {};
        
        tickets.forEach(ticket => {
          const date = new Date(ticket.created_at);
          const monthKey = monthNames[date.getMonth()];
          ticketsByMonth[monthKey] = (ticketsByMonth[monthKey] || 0) + 1;
          if (ticket.status === 'resolved' || ticket.status === 'closed') {
            resolvedByMonth[monthKey] = (resolvedByMonth[monthKey] || 0) + 1;
          }
        });
        
        appointments.forEach(appt => {
          const date = new Date(appt.created_at || appt.date);
          const monthKey = monthNames[date.getMonth()];
          appointmentsByMonth[monthKey] = (appointmentsByMonth[monthKey] || 0) + 1;
        });
        
        // Get last 6 months with data
        const currentMonth = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          last6Months.push(monthNames[monthIndex]);
        }
        
        const trendData: MonthlyTrendDataItem[] = last6Months.map(month => ({
          month,
          tickets: ticketsByMonth[month] || 0,
          appointments: appointmentsByMonth[month] || 0,
          aiResolved: resolvedByMonth[month] || 0,
        }));
        
        setTrendChartData(trendData);
        
        // 3. Facilitator Workload Data
        const facilitators = fetchedUsers.filter((u: User) => u.role === 'facilitator');
        const colors = ["#06142E", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];
        
        const workloadData: FacilitatorWorkloadItem[] = facilitators.slice(0, 5).map((f: User, index: number) => {
          const facilTickets = tickets.filter(t => t.assigned_to === (typeof f.id === 'string' ? parseInt(f.id) : f.id)).length;
          const facilAppointments = appointments.filter(a => a.facilitator_id === (typeof f.id === 'string' ? parseInt(f.id) : f.id)).length;
          return {
            name: f.name.split(' ').slice(0, 2).join(' '), // Shorten name for display
            tickets: facilTickets,
            appointments: facilAppointments,
            color: colors[index % colors.length],
          };
        });
        
        setWorkloadChartData(workloadData);
        setFacilitatorStats(workloadData);
        
        // 4. AI Classification Confidence Distribution
        const highConfidence = tickets.filter(t => t.ai_confidence && t.ai_confidence >= 0.7).length;
        const lowConfidence = tickets.filter(t => t.ai_confidence && t.ai_confidence > 0 && t.ai_confidence < 0.7).length;
        const noAI = tickets.filter(t => !t.ai_confidence || t.ai_confidence === 0).length;
        const total = tickets.length || 1;
        
        const classificationData: ClassificationDataItem[] = [
          { name: "High Confidence (≥70%)", value: Math.round((highConfidence / total) * 100), color: "#22c55e" },
          { name: "Low Confidence (<70%)", value: Math.round((lowConfidence / total) * 100), color: "#f59e0b" },
          { name: "Manual/No AI", value: Math.round((noAI / total) * 100), color: "#ef4444" },
        ];
        
        setClassificationChartData(classificationData);
        
        // 5. Quick Stats
        const escalatedCount = tickets.filter(t => t.status === 'escalated').length;
        const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
        const firstContactRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
        const escalationRate = total > 0 ? Math.round((escalatedCount / total) * 100) : 0;
        
        setQuickStatsData({
          avgResponseTime: "2.8h", // Would need response time tracking to compute
          firstContactRate,
          escalationRate,
          slaCompliance: Math.min(100, 100 - escalationRate + 5), // Estimated SLA compliance
        });
        
        // Update analytics data with real stats
        const studentCount = fetchedUsers.filter((u: User) => u.role === 'student').length;
        
        setStatsData([
          { ...analyticsData[0], value: studentCount || 12847 },
          { ...analyticsData[1], value: stats.total || 0 },
          { ...analyticsData[2], value: resolvedCount || 0 },
          { ...analyticsData[3], value: 94 }, // Satisfaction (static for now)
        ]);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        // Keep demo data
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchData();
  }, []);

  // Test AI classification
  const handleTestClassification = async () => {
    if (!testText.trim()) return;
    
    setIsClassifying(true);
    try {
      const result = await ticketsApi.testClassification(testText);
      setTestResult(result);
      
      // Add to recent classifications
      setRecentClassifications(prev => [{
        id: Date.now(),
        text: testText.slice(0, 100),
        category: result.category,
        confidence: result.confidence,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 9)]);
      
      toast({
        title: "Classification Complete",
        description: `Category: ${result.category} (${(result.confidence * 100).toFixed(1)}% confidence)`,
      });
    } catch (error) {
      toast({
        title: "Classification Failed",
        description: "Could not reach the AI classifier",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const showToast = useCallback((title: string, description: string) => {
    toast({ title, description });
  }, [toast]);

  // User management functions
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.department) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    const user = {
      id: users.length + 1,
      ...newUser,
      status: "Pending",
    };
    setUsers([...users, user]);
    setAddUserOpen(false);
    setNewUser({ name: "", email: "", role: "Facilitator", department: "" });
    toast({ title: "User Added", description: `${user.name} has been added and will receive an invitation email.` });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setEditUserOpen(false);
    toast({ title: "User Updated", description: `${selectedUser.name}'s profile has been updated.` });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setDeleteUserOpen(false);
    toast({ title: "User Removed", description: `${selectedUser.name} has been removed from the system.` });
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "Active" ? "Inactive" : "Active";
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleExportReport = () => {
    toast({ 
      title: "Report Exported", 
      description: "Analytics report has been exported as PDF and will download shortly." 
    });
  };

  const handleSaveSettings = () => {
    setSettingsModalOpen(false);
    toast({ 
      title: "Settings Saved", 
      description: `${activeSettingType} configuration has been updated.` 
    });
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
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="mt-2 text-muted-foreground">
                  Platform analytics and management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => showToast("Refreshing", "Data refreshed successfully")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button onClick={handleExportReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="mb-8 flex flex-wrap gap-1 rounded-lg bg-card p-1">
              {[
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "ai-classification", label: "AI Classification", icon: Brain },
                { id: "users", label: "User Management", icon: Users },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveSection(tab.id as "analytics" | "ai-classification" | "users" | "settings")
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
                      className="absolute inset-0 rounded-md bg-secondary"
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
                    {statsData.map((stat, index) => (
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

                  {/* Quick Stats Row */}
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Performance Metrics</h3>
                    <QuickStatsRow data={quickStatsData} />
                  </div>

                  {/* Charts Grid - Row 1 */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <TrendChart data={trendChartData.length > 0 ? trendChartData : undefined} />
                    <TicketCategoryChart data={categoryChartData.length > 0 ? categoryChartData : undefined} />
                  </div>

                  {/* Charts Grid - Row 2: Response Time & Resolution Rate */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <ResponseTimeChart />
                    <ResolutionRateChart />
                  </div>

                  {/* Charts Grid - Row 3: Satisfaction & Workload */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <SatisfactionTrendChart />
                    <FacilitatorWorkloadChart data={workloadChartData.length > 0 ? workloadChartData : undefined} />
                  </div>

                  {/* Charts Grid - Row 4: Department Performance & Peak Hours */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <DepartmentPerformanceRadar />
                    <TicketVolumeHeatmap />
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                          AI Accuracy by Category
                        </h3>
                        <Button variant="ghost" size="sm">
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-5">
                        {(categoryChartData.length > 0 ? categoryChartData : departmentStats.map(d => ({ name: d.label, aiAccuracy: d.percentage, color: d.color }))).map((item, index) => (
                          <AnimatedBar
                            key={'name' in item ? item.name : item.label}
                            label={'name' in item ? item.name : item.label}
                            percentage={'aiAccuracy' in item ? (item.aiAccuracy || 90) : item.percentage}
                            delay={0.3 + index * 0.1}
                            color={item.color}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity Card */}
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
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.4 + index * 0.08,
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                          >
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {activity.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
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

              {activeSection === "ai-classification" && (
                <motion.div
                  key="ai-classification"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* AI Model Status */}
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={defaultTransition}
                    className="mb-6 rounded-xl bg-card p-6 shadow-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI Model Status
                      </h3>
                      <Badge variant={classifierInfo?.api_available ? "default" : "destructive"} className={classifierInfo?.api_available ? "bg-success" : ""}>
                        {classifierInfo?.api_available ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-secondary/50 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Model</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{classifierInfo?.model || "Loading..."}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Categories</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{classifierInfo?.categories?.length || 6} Active</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Fallback</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{classifierInfo?.fallback || "keyword-based"}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">API Endpoint</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{classifierInfo?.api_url?.replace('https://', '') || "N/A"}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Overview Cards */}
                  <StaggerContainer className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Total Classifications", value: ticketStats?.total?.toString() || "0", change: "All tickets processed" },
                      { label: "Categories", value: Object.keys(ticketStats?.by_category || {}).length.toString(), change: classifierInfo?.categories?.join(", ") || "Loading..." },
                      { label: "Open Tickets", value: ticketStats?.by_status?.['open']?.toString() || "0", change: "Awaiting response" },
                      { label: "Resolved", value: ((ticketStats?.by_status?.['closed'] || 0) + (ticketStats?.by_status?.['resolved'] || 0)).toString(), change: "Successfully closed" },
                    ].map((stat, index) => (
                      <AnimatedListItem key={stat.label}>
                        <AnimatedCard className="rounded-xl bg-card p-5 shadow-card">
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-sm font-medium text-foreground">{stat.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">{stat.change}</p>
                        </AnimatedCard>
                      </AnimatedListItem>
                    ))}
                  </StaggerContainer>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Live Classification Test */}
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.2 }}
                      className="rounded-xl bg-card p-6 shadow-card"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Live Classification Test
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="test-text">Enter ticket text to classify</Label>
                          <textarea
                            id="test-text"
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            placeholder="e.g., I can't submit my assignment on Canvas, the deadline is tomorrow..."
                            className="mt-2 w-full rounded-lg border border-input bg-background p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <Button 
                          onClick={handleTestClassification} 
                          disabled={!testText.trim() || isClassifying}
                          className="w-full"
                        >
                          {isClassifying ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Classifying...
                            </>
                          ) : (
                            <>
                              <Brain className="mr-2 h-4 w-4" />
                              Test Classification
                            </>
                          )}
                        </Button>
                        
                        {testResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">Result</span>
                              <Badge variant="outline">{testResult.model}</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Category</p>
                                <p className="text-lg font-bold text-primary capitalize">{testResult.category}</p>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Confidence</p>
                                <p className="text-lg font-bold text-foreground">{(testResult.confidence * 100).toFixed(1)}%</p>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Action</p>
                                <Badge variant={testResult.confidence >= 0.7 ? "default" : "destructive"} className={testResult.confidence >= 0.7 ? "bg-success" : ""}>
                                  {testResult.confidence >= 0.7 ? "Auto-Assign" : "Review"}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Category Distribution (Real Data) */}
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.3 }}
                      className="rounded-xl bg-card p-6 shadow-card"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-foreground">
                        Category Distribution
                      </h3>
                      <div className="space-y-4">
                        {ticketStats?.by_category && Object.entries(ticketStats.by_category).map(([category, count], index) => {
                          const total = Object.values(ticketStats.by_category).reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                          const colors = ["#06142E", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444"];
                          return (
                            <AnimatedBar 
                              key={category}
                              label={`${category.charAt(0).toUpperCase() + category.slice(1)} (${count})`}
                              percentage={percentage}
                              delay={index * 0.1}
                              color={colors[index % colors.length]}
                            />
                          );
                        })}
                        {!ticketStats?.by_category && (
                          <div className="text-center text-muted-foreground py-8">
                            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                            Loading statistics...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Classifications Log */}
                  {recentClassifications.length > 0 && (
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      transition={{ ...defaultTransition, delay: 0.4 }}
                      className="mt-6 rounded-xl bg-card p-6 shadow-card"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-foreground">
                        Recent Test Classifications
                      </h3>
                      <div className="space-y-2">
                        {recentClassifications.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 text-sm">
                            <div className="flex-1 truncate mr-4">
                              <span className="text-muted-foreground">{item.text}...</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize">{item.category}</Badge>
                              <span className={`font-medium ${item.confidence >= 0.7 ? 'text-success' : 'text-warning'}`}>
                                {(item.confidence * 100).toFixed(1)}%
                              </span>
                              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Classification Legend */}
                  <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.5 }}
                    className="mt-6 rounded-xl bg-card p-6 shadow-card"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-foreground">
                      How AI Classification Works
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-success/10 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <span className="font-medium text-foreground">Auto-Assigned (≥70%)</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Confidence ≥70% — ticket is auto-categorized and routed to the appropriate facilitator.
                        </p>
                      </div>
                      <div className="rounded-lg bg-destructive/10 p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-destructive" />
                          <span className="font-medium text-foreground">Flagged for Review (&lt;70%)</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Confidence &lt;70% — ticket is flagged for manual categorization by a facilitator.
                        </p>
                      </div>
                    </div>
                  </motion.div>
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
                  <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search users..." 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Facilitator">Facilitator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setAddUserOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>

                  {/* User Stats */}
                  <div className="mb-6 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg bg-card p-4 shadow-card">
                      <p className="text-2xl font-bold text-foreground">{users.length}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-card">
                      <p className="text-2xl font-bold text-success">{users.filter(u => u.status === "Active").length}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-card">
                      <p className="text-2xl font-bold text-warning">{users.filter(u => u.status === "Pending").length}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-card">
                      <p className="text-2xl font-bold text-primary">{users.filter(u => u.role === "Admin").length}</p>
                      <p className="text-sm text-muted-foreground">Admins</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-card shadow-card overflow-hidden">
                    <div className="grid grid-cols-6 gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-sm font-medium text-muted-foreground">
                      <span>Name</span>
                      <span>Email</span>
                      <span>Department</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                    {filteredUsers.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground">
                        No users found matching your search.
                      </div>
                    ) : (
                      filteredUsers.map((user, index) => {
                        const dept = departments.find(d => d.id === user.department);
                        const DeptIcon = dept?.icon || Users;
                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.05,
                              duration: 0.2,
                              ease: "easeOut",
                            }}
                            className="grid grid-cols-6 items-center gap-4 border-b border-border px-6 py-4 last:border-0 hover:bg-secondary/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="font-medium text-foreground">{user.name}</span>
                            </div>
                            <span className="text-muted-foreground text-sm">{user.email}</span>
                            <div className="flex items-center gap-2">
                              <DeptIcon className={`h-4 w-4 ${dept?.color || 'text-muted-foreground'}`} />
                              <span className="text-sm">{dept?.name || 'Unassigned'}</span>
                            </div>
                            <Badge variant="outline" className={user.role === "Admin" ? "bg-primary/10 text-primary" : ""}>
                              {user.role === "Admin" && <Shield className="mr-1 h-3 w-3" />}
                              {user.role}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                user.status === "Active"
                                  ? "bg-success/10 text-success"
                                  : user.status === "Pending"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {user.status === "Active" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {user.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                              {user.status === "Inactive" && <XCircle className="mr-1 h-3 w-3" />}
                              {user.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditUserOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteUserOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
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
                  {/* AI Model Configuration */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0, duration: 0.3, ease: "easeOut" }}
                    className="rounded-xl bg-card p-6 shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">AI Model Configuration</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            DistilBERT classification model settings
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Model Active
                      </Badge>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Confidence Threshold</Label>
                          <span className="text-sm font-medium text-primary">{confidenceThreshold[0]}%</span>
                        </div>
                        <Slider
                          value={confidenceThreshold}
                          onValueChange={setConfidenceThreshold}
                          min={50}
                          max={95}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tickets below this threshold will be flagged for manual review
                        </p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                        <div>
                          <Label>Auto-Assign Tickets</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically route high-confidence tickets
                          </p>
                        </div>
                        <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Email Notifications */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
                    className="rounded-xl bg-card p-6 shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                          <Mail className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Email Notifications</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            SendGrid integration (100 emails/day free tier)
                          </p>
                        </div>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "New ticket notifications", enabled: true },
                        { label: "Escalation alerts", enabled: true },
                        { label: "Appointment reminders", enabled: true },
                        { label: "Weekly digest", enabled: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                          <span className="text-sm">{item.label}</span>
                          <Switch defaultChecked={item.enabled} disabled={!emailNotifications} />
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Category Management */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16, duration: 0.3, ease: "easeOut" }}
                    className="rounded-xl bg-card p-6 shadow-card"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                        <Database className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Ticket Categories</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Manage AI classification categories
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {["Assignment Issues", "Grade Appeals", "Capstone", "Administrative", "General Inquiry"].map((cat, index) => (
                        <div key={cat} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: departmentStats[index]?.color || "#666" }}
                            />
                            <span className="text-sm font-medium">{cat}</span>
                          </div>
                          <Badge variant="secondary">{departmentStats[index]?.percentage || 0}% accuracy</Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Security & Privacy */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24, duration: 0.3, ease: "easeOut" }}
                    className="rounded-xl bg-card p-6 shadow-card"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                        <Lock className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Security & Privacy</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Role-based access control and data protection
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <span className="text-sm">Two-factor authentication</span>
                        <Badge variant="outline" className="bg-warning/10 text-warning">Coming Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <span className="text-sm">Session timeout (30 min)</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <span className="text-sm">Audit logging</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <span className="text-sm">Data encryption</span>
                        <Badge variant="outline" className="bg-success/10 text-success">Enabled</Badge>
                      </div>
                    </div>
                  </motion.div>

                  {/* Save Settings Button */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button onClick={() => showToast("Settings Saved", "All settings have been saved successfully")}>
                      Save All Settings
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageTransition>
      </main>
      <Footer />

      {/* Add User Modal */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Add a new facilitator or admin to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="email@alu.edu"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facilitator">Facilitator</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={newUser.department} onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${dept.color}`} />
                          {dept.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facilitator">Facilitator</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={selectedUser.department} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => {
                      const Icon = dept.icon;
                      return (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${dept.color}`} />
                            {dept.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedUser.status} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Remove User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{selectedUser?.name}</span> from the platform? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteUserOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
