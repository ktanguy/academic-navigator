import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, BookOpen, GraduationCap, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const departments = ["All Departments", "Computer Science", "Mathematics", "Engineering", "Physics", "Business"];

const Directory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment =
      selectedDepartment === "All Departments" || teacher.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

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
              className="mb-8 text-center"
            >
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Find Your Teacher
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Browse our directory to find the right faculty member for your needs
              </p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
              className="mb-8 flex flex-col gap-4 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
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

            {/* Teacher Grid */}
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher, index) => (
                <AnimatedListItem key={teacher.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-card"
                  >
                    {/* Avatar and Status */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                        {teacher.avatar}
                      </div>
                      <Badge
                        variant={teacher.available ? "default" : "secondary"}
                        className={
                          teacher.available
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {teacher.available ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-semibold text-foreground">{teacher.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      {teacher.department}
                    </p>

                    {/* Expertise */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {teacher.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Office Hours */}
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary p-3 text-sm">
                      <Clock className="h-4 w-4 text-primary-foreground" />
                      <span className="text-primary-foreground">{teacher.officeHours}</span>
                    </div>

                    {/* Book Button */}
                    <div className="mt-auto pt-5">
                      <motion.div {...buttonMotionProps}>
                        <Button className="w-full" asChild>
                          <Link to={`/booking?teacher=${teacher.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Book Meeting
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatedListItem>
              ))}
            </StaggerContainer>

            {/* Empty State */}
            {filteredTeachers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No teachers found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
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
