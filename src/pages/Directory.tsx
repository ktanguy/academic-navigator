import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, Clock, BookOpen, GraduationCap, Filter, Mail, LayoutGrid, List, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageTransition,
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";
import { usersApi, User } from "@/services/api";

// Animation variants with proper types
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const incrementTime = Math.max((duration * 1000) / end, 10);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count}</span>;
};

const teachers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    department: "Computer Science",
    expertise: ["Programming", "Data Structures", "Algorithms"],
    officeHours: "Mon, Wed 2:00 PM - 4:00 PM",
    avatar: "SC",
    available: true,
  },
  {
    id: 2,
    name: "Prof. Michael Torres",
    department: "Mathematics",
    expertise: ["Calculus", "Linear Algebra", "Statistics"],
    officeHours: "Tue, Thu 10:00 AM - 12:00 PM",
    avatar: "MT",
    available: true,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    department: "Engineering",
    expertise: ["Capstone Projects", "Design Thinking", "Robotics"],
    officeHours: "Mon, Fri 1:00 PM - 3:00 PM",
    avatar: "ER",
    available: false,
  },
  {
    id: 4,
    name: "Prof. James Wilson",
    department: "Physics",
    expertise: ["Mechanics", "Thermodynamics", "Lab Work"],
    officeHours: "Wed, Fri 9:00 AM - 11:00 AM",
    avatar: "JW",
    available: true,
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    department: "Business",
    expertise: ["Finance", "Entrepreneurship", "Marketing"],
    officeHours: "Tue, Thu 2:00 PM - 4:00 PM",
    avatar: "LP",
    available: true,
  },
  {
    id: 6,
    name: "Prof. David Kim",
    department: "Computer Science",
    expertise: ["Web Development", "Databases", "Cloud Computing"],
    officeHours: "Mon, Wed 10:00 AM - 12:00 PM",
    avatar: "DK",
    available: false,
  },
];

const departments = ["All Departments", "Computer Science", "Mathematics", "Engineering", "Physics", "Business", "Academic Affairs", "Capstone Committee", "IT Support", "Registrar's Office"];

interface DisplayFacilitator {
  id: number | string;
  name: string;
  department: string;
  expertise: string[];
  officeHours: string;
  avatar: string;
  available: boolean;
}

const Directory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [facilitators, setFacilitators] = useState<DisplayFacilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch facilitators from API
  useEffect(() => {
    const fetchFacilitators = async () => {
      try {
        const users = await usersApi.getFacilitators();
        const displayFacilitators: DisplayFacilitator[] = users.map((user: User) => ({
          id: user.id,
          name: user.name,
          department: user.department || "General",
          expertise: getExpertiseFromDepartment(user.department),
          officeHours: "Mon, Wed 2:00 PM - 4:00 PM", // Default, could be stored in DB
          avatar: getInitials(user.name),
          available: true, // Could be based on real-time availability
        }));
        setFacilitators(displayFacilitators);
      } catch (error) {
        console.error("Failed to fetch facilitators:", error);
        // Fall back to demo data
        setFacilitators(teachers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFacilitators();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getExpertiseFromDepartment = (department?: string): string[] => {
    switch (department) {
      case "Academic Affairs":
        return ["Academic Advising", "Course Selection", "Student Support"];
      case "Capstone Committee":
        return ["Capstone Projects", "Research", "Thesis Guidance"];
      case "IT Support":
        return ["Technical Support", "Canvas Help", "System Access"];
      case "Registrar's Office":
        return ["Transcripts", "Enrollment", "Records"];
      default:
        return ["General Advising"];
    }
  };

  const filteredTeachers = facilitators.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment =
      selectedDepartment === "All Departments" || teacher.department === selectedDepartment;
    const matchesAvailability = 
      availabilityFilter === "all" || 
      (availabilityFilter === "available" && teacher.available) ||
      (availabilityFilter === "busy" && !teacher.available);
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  // Stats
  const totalFacilitators = facilitators.length;
  const availableFacilitators = facilitators.filter(f => f.available).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex-1 py-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br from-primary/5 via-transparent to-transparent"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr from-accent/5 via-transparent to-transparent"
          />
        </div>

        <PageTransition>
          <div className="container relative">
            {/* Animated Stats Banner */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mb-6 grid gap-4 sm:grid-cols-3"
            >
              {[
                { icon: Users, label: "Total Facilitators", value: totalFacilitators, color: "bg-primary", iconColor: "text-primary-foreground" },
                { icon: Clock, label: "Available Now", value: availableFacilitators, color: "bg-success", iconColor: "text-success-foreground" },
                { icon: GraduationCap, label: "Departments", value: departments.length - 1, color: "bg-blue-500", iconColor: "text-white" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group flex items-center gap-3 rounded-xl bg-card p-4 shadow-card transition-shadow hover:shadow-elevated"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-lg`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Animated Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <motion.div 
                className="relative flex-1"
                whileFocus={{ scale: 1.01 }}
              >
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </motion.div>
                <Input
                  placeholder="Search by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-shadow focus:shadow-lg focus:shadow-primary/10"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="flex gap-1 rounded-lg bg-secondary p-1"
              >
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0 transition-all"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0 transition-all"
                >
                  <List className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl bg-card p-6 shadow-card">
                    <div className="mb-4 flex items-start justify-between">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg mb-4" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Teacher Grid with AnimatePresence */}
            <AnimatePresence mode="wait">
              {!isLoading && viewMode === "grid" && (
                <motion.div
                  key="grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      variants={cardVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex h-full flex-col rounded-2xl bg-card p-6 shadow-card transition-shadow hover:shadow-elevated overflow-hidden"
                    >
                      {/* Animated gradient background on hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"
                      />

                      {/* Avatar and Status */}
                      <div className="relative mb-4 flex items-start justify-between">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-semibold text-white shadow-lg"
                        >
                          {teacher.avatar}
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge
                            variant={teacher.available ? "default" : "secondary"}
                            className={`${
                              teacher.available
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                            } transition-all group-hover:scale-105`}
                          >
                            <motion.span
                              animate={teacher.available ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`mr-1.5 h-2 w-2 rounded-full ${teacher.available ? "bg-green-300" : "bg-gray-400"}`}
                            />
                            {teacher.available ? "Available" : "Busy"}
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Info */}
                      <h3 className="relative text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {teacher.name}
                      </h3>
                      <p className="relative mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        {teacher.department}
                      </p>

                      {/* Expertise with stagger animation */}
                      <div className="relative mt-4 flex flex-wrap gap-2">
                        {teacher.expertise.map((skill, skillIndex) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + skillIndex * 0.05 }}
                          >
                            <Badge variant="secondary" className="text-xs transition-all hover:bg-primary hover:text-primary-foreground">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {/* Office Hours */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative mt-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm"
                      >
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{teacher.officeHours}</span>
                      </motion.div>

                      {/* Action Buttons */}
                      <div className="relative mt-auto pt-5 flex gap-2">
                        <motion.div {...buttonMotionProps} className="flex-1">
                          <Button className="w-full group/btn" asChild>
                            <Link to={`/booking?teacher=${teacher.id}`}>
                              <BookOpen className="mr-2 h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                              Book Now
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="outline" size="icon" asChild>
                            <a href={`mailto:facilitator${teacher.id}@university.edu`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Teacher List View */}
              {!isLoading && viewMode === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 8, scale: 1.01 }}
                      className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-card transition-shadow hover:shadow-elevated"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-lg"
                      >
                        {teacher.avatar}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{teacher.name}</h3>
                          <Badge
                            variant={teacher.available ? "default" : "secondary"}
                            className={`text-xs ${
                              teacher.available
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <span className={`mr-1 h-1.5 w-1.5 rounded-full ${teacher.available ? "bg-green-300" : "bg-gray-400"}`} />
                            {teacher.available ? "Available" : "Busy"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{teacher.department}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {teacher.officeHours}
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                        {teacher.expertise.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs transition-all hover:bg-primary hover:text-primary-foreground">
                            {skill}
                          </Badge>
                        ))}
                        {teacher.expertise.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{teacher.expertise.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" asChild>
                            <Link to={`/booking?teacher=${teacher.id}`}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Book
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                            <a href={`mailto:facilitator${teacher.id}@university.edu`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Empty State */}
            {!isLoading && filteredTeachers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="py-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-lg"
                >
                  <Search className="h-10 w-10 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground">No facilitators found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
                <motion.div {...buttonMotionProps} className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDepartment("All Departments");
                      setAvailabilityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
