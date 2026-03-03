import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  FileText,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  AlertTriangle,
  Accessibility,
} from "lucide-react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PageTransition,
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentsApi, usersApi, User, sendGmailNotification, officeHoursApi, AvailableSlot } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const meetingReasons = [
  { id: "homework", label: "Homework Help", icon: BookOpen, description: "Get help with assignments" },
  { id: "capstone", label: "Capstone Project", icon: GraduationCap, description: "Discuss your final project" },
  { id: "grades", label: "Grades Discussion", icon: FileText, description: "Review your academic progress" },
  { id: "general", label: "General Discussion", icon: MessageSquare, description: "Open conversation" },
  { id: "other", label: "Other", icon: HelpCircle, description: "Something else" },
];

const meetingModes = [
  { id: "in-person", label: "In-Person", icon: MapPin, description: "Meet at the facilitator's office" },
  { id: "virtual", label: "Virtual (Zoom)", icon: Video, description: "Online video meeting" },
  { id: "phone", label: "Phone Call", icon: Phone, description: "Voice call only" },
];

const urgencyLevels = [
  { id: "low", label: "Low", description: "No deadline pressure", color: "bg-muted text-muted-foreground" },
  { id: "medium", label: "Medium", description: "Within the next week", color: "bg-warning/15 text-warning" },
  { id: "high", label: "Urgent", description: "Within 48 hours", color: "bg-destructive/15 text-destructive" },
];

const timeSlots = [
  { time: "9:00 AM", available: true },
  { time: "9:30 AM", available: false },
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: false },
  { time: "11:30 AM", available: true },
  { time: "1:00 PM", available: true },
  { time: "1:30 PM", available: true },
  { time: "2:00 PM", available: false },
  { time: "2:30 PM", available: true },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: false },
];

// Generate dynamic week days starting from today
const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayOfWeek = date.getDay();
    // Weekend days are not available
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    days.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format for API
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // "Jan 29" format for display
      day: date.toLocaleDateString('en-US', { weekday: 'short' }), // "Wed" format
      available: !isWeekend,
    });
  }
  
  return days;
};

const Booking = () => {
  const weekDays = generateWeekDays();
  const [searchParams] = useSearchParams();
  const teacherId = searchParams.get("teacher");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  // Helper to format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [facilitators, setFacilitators] = useState<User[]>([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState<number | null>(teacherId ? parseInt(teacherId) : null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    subject: "",
    courseCode: "",
    description: "",
    priorAttempts: "",
    preferredLanguage: "",
    accessibilityNeeds: false,
    accessibilityDetails: "",
    file: null as File | null,
  });
  const [isBooked, setIsBooked] = useState(false);

  // Fetch facilitators on mount
  useEffect(() => {
    const fetchFacilitators = async () => {
      try {
        const users = await usersApi.getFacilitators();
        setFacilitators(users);
        if (teacherId && !selectedFacilitator) {
          setSelectedFacilitator(parseInt(teacherId));
        }
      } catch (error) {
        console.error("Failed to fetch facilitators:", error);
      }
    };
    fetchFacilitators();
  }, [teacherId]);

  // Fetch available slots from office hours when date and facilitator are selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedFacilitator && selectedDate) {
        setIsLoadingSlots(true);
        try {
          // Use the office hours API to get real availability
          const response = await officeHoursApi.getAvailableSlots(selectedFacilitator, selectedDate);
          setAvailableSlots(response.available_slots || []);
          setBookedSlots(response.booked_slots || []);
        } catch (error) {
          console.error("Failed to fetch available slots:", error);
          // Fall back to demo time slots
          const fallbackSlots: AvailableSlot[] = timeSlots
            .filter(s => s.available)
            .map(s => ({ time: s.time, duration: 30 }));
          setAvailableSlots(fallbackSlots);
          setBookedSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        // Reset slots when no facilitator or date selected
        setAvailableSlots([]);
        setBookedSlots([]);
      }
    };
    fetchSlots();
  }, [selectedFacilitator, selectedDate]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit appointment
      if (!isAuthenticated) {
        toast({
          title: "Sign in required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setIsSubmitting(true);
      try {
        // Build dynamic form data based on meeting type
        const dynamicFormData: Record<string, unknown> = {
          student_id: formData.studentId,
          subject: formData.subject,
          description: formData.description,
          urgency: selectedUrgency,
          accessibility_needs: formData.accessibilityNeeds,
        };
        
        // Add type-specific fields
        if (selectedReason === 'homework') {
          dynamicFormData.course_code = formData.courseCode;
          dynamicFormData.prior_attempts = formData.priorAttempts;
        } else if (selectedReason === 'capstone') {
          dynamicFormData.project_title = formData.subject;
          dynamicFormData.current_progress = formData.description;
        } else if (selectedReason === 'grades') {
          dynamicFormData.course_assessment = formData.subject;
          dynamicFormData.concerns = formData.description;
        }
        
        if (formData.accessibilityNeeds && formData.accessibilityDetails) {
          dynamicFormData.accessibility_details = formData.accessibilityDetails;
        }

        const bookingDetails = {
          facilitator_id: selectedFacilitator!,
          date: selectedDate,
          time_slot: selectedTime,
          meeting_type: selectedReason,
          meeting_mode: selectedMode,
          reason: `${formData.subject}: ${formData.description}`,
          form_data: dynamicFormData,
        };

        await appointmentsApi.create(bookingDetails);

        // After booking is successful, send Gmail notification
        if (user && user.email && user.googleAccessToken) {
          await sendGmailNotification({
            email: user.email,
            subject: 'Appointment Booked',
            message: `Your appointment for ${formData.subject} is confirmed.`,
            accessToken: user.googleAccessToken,
          });
        }

        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been scheduled successfully.",
        });
        setIsBooked(true);
      } catch (error) {
        toast({
          title: "Booking Failed",
          description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedReason !== "" && selectedMode !== "";
      case 2:
        return selectedDate !== "" && selectedTime !== "";
      case 3:
        return formData.studentId !== "" && formData.subject !== "" && formData.description !== "" && selectedUrgency !== "";
      default:
        return true;
    }
  };

  const renderReasonSpecificFields = () => {
    switch (selectedReason) {
      case "homework":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Assignment/Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Calculus Problem Set 3"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">What do you need help with?</Label>
              <Textarea
                id="description"
                placeholder="Describe the specific problems or concepts you're struggling with..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        );
      case "capstone":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Project Title</Label>
              <Input
                id="subject"
                placeholder="e.g., AI-Powered Student Support System"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Current Progress & Questions</Label>
              <Textarea
                id="description"
                placeholder="Describe your project status and what guidance you need..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        );
      case "grades":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Course & Assessment</Label>
              <Input
                id="subject"
                placeholder="e.g., CS101 Midterm Exam"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">What would you like to discuss?</Label>
              <Textarea
                id="description"
                placeholder="Describe your concerns about your grade or feedback..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Topic</Label>
              <Input
                id="subject"
                placeholder="What would you like to discuss?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                placeholder="Provide more details about your request..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </>
        );
    }
  };

  if (isBooked) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-8">
          <PageTransition>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mx-auto max-w-md text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success">
                <Check className="h-10 w-10 text-success-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Meeting Booked!</h1>
              <p className="mt-3 text-muted-foreground">
                Your meeting has been scheduled successfully. You'll receive a confirmation email shortly.
              </p>
              <div className="mt-6 rounded-xl bg-card p-5 shadow-card">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{formatDateForDisplay(selectedDate)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{selectedTime}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium text-foreground">
                    {meetingModes.find((m) => m.id === selectedMode)?.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Topic</span>
                  <span className="font-medium text-foreground">{formData.subject}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/student">Back to Portal</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/directory">Book Another</Link>
                </Button>
              </div>
            </motion.div>
          </PageTransition>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <PageTransition>
          <div className="container max-w-3xl">
            {/* Progress */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        s < step
                          ? "bg-success text-success-foreground"
                          : s === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < step ? <Check className="h-5 w-5" /> : s}
                    </div>
                    {s < 4 && (
                      <div
                        className={`h-1 w-16 sm:w-24 md:w-32 ${
                          s < step ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground sm:text-sm">
                <span>Reason</span>
                <span>Schedule</span>
                <span>Details</span>
                <span>Review</span>
              </div>
            </motion.div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    What's the reason for your meeting?
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {meetingReasons.map((reason) => (
                      <motion.button
                        key={reason.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`flex items-start gap-4 rounded-xl p-5 text-left transition-colors ${
                          selectedReason === reason.id
                            ? "bg-primary text-primary-foreground shadow-elevated"
                            : "bg-card shadow-card hover:shadow-elevated"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                            selectedReason === reason.id
                              ? "bg-primary-foreground/20"
                              : "bg-secondary"
                          }`}
                        >
                          <reason.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{reason.label}</h3>
                          <p
                            className={`mt-1 text-sm ${
                              selectedReason === reason.id
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {reason.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Meeting Mode */}
                  <h3 className="mb-4 mt-8 text-lg font-semibold text-foreground">
                    How would you like to meet?
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {meetingModes.map((mode) => (
                      <motion.button
                        key={mode.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-colors ${
                          selectedMode === mode.id
                            ? "bg-primary text-primary-foreground shadow-elevated"
                            : "bg-card shadow-card hover:shadow-elevated"
                        }`}
                      >
                        <mode.icon className="h-6 w-6" />
                        <span className="font-semibold">{mode.label}</span>
                        <span className={`text-xs ${selectedMode === mode.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {mode.description}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Choose a date and time
                  </h2>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="h-4 w-4" />
                      Select Date
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {weekDays.map((day) => (
                        <motion.button
                          key={day.date}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!day.available}
                          onClick={() => setSelectedDate(day.date)}
                          className={`flex min-w-[80px] flex-col items-center rounded-xl p-4 transition-colors ${
                            !day.available
                              ? "cursor-not-allowed bg-muted/50 text-muted-foreground opacity-50"
                              : selectedDate === day.date
                              ? "bg-primary text-primary-foreground shadow-elevated"
                              : "bg-card shadow-card hover:shadow-elevated"
                          }`}
                        >
                          <span className="text-xs">{day.day}</span>
                          <span className="mt-1 font-semibold">{day.displayDate}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4" />
                      Select Time
                      {isLoadingSlots && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                    </div>
                    {!selectedDate ? (
                      <p className="text-sm text-muted-foreground">Please select a date first</p>
                    ) : availableSlots.length === 0 && !isLoadingSlots ? (
                      <p className="text-sm text-muted-foreground">No available slots on this date. The facilitator may not have office hours scheduled.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {availableSlots.map((slot) => (
                          <motion.button
                            key={slot.time}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                              selectedTime === slot.time
                                ? "bg-success text-success-foreground"
                                : "bg-card shadow-card hover:bg-success/10 hover:text-success"
                            }`}
                          >
                            <div>{slot.time}</div>
                            {slot.duration && (
                              <div className="text-xs opacity-70">{slot.duration} min</div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                    {bookedSlots.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Already booked times:</p>
                        <div className="flex flex-wrap gap-2">
                          {bookedSlots.map((slot) => (
                            <span key={slot} className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-success" /> Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-destructive/30" /> Booked
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Provide meeting details
                  </h2>
                  <div className="space-y-6 rounded-xl bg-card p-6 shadow-card">
                    {/* Student Info Section */}
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Student Information
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="studentId">Student ID *</Label>
                          <Input
                            id="studentId"
                            placeholder="e.g., STU-20240001"
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseCode">Course Code</Label>
                          <Input
                            id="courseCode"
                            placeholder="e.g., CS301, MATH201"
                            value={formData.courseCode}
                            onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Reason-specific fields */}
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Meeting Details
                      </h3>
                      <div className="space-y-4">
                        {renderReasonSpecificFields()}
                      </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Urgency */}
                    <div>
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Urgency Level *
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {urgencyLevels.map((level) => (
                          <motion.button
                            key={level.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedUrgency(level.id)}
                            className={`flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-colors ${
                              selectedUrgency === level.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <AlertTriangle className={`h-5 w-5 ${level.id === "high" ? "text-destructive" : level.id === "medium" ? "text-warning" : "text-muted-foreground"}`} />
                            <span className="font-semibold text-foreground">{level.label}</span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Prior Attempts */}
                    <div className="space-y-2">
                      <Label htmlFor="priorAttempts">Have you tried resolving this on your own?</Label>
                      <Select
                        value={formData.priorAttempts}
                        onValueChange={(value) => setFormData({ ...formData, priorAttempts: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No, this is my first attempt</SelectItem>
                          <SelectItem value="self-study">Yes, through self-study/research</SelectItem>
                          <SelectItem value="peers">Yes, discussed with peers</SelectItem>
                          <SelectItem value="office-hours">Yes, attended office hours before</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label>Upload Supporting Documents (Optional)</Label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag & drop or click to upload (PDF, DOC, images)
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Max 10MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Accessibility */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="accessibility"
                          checked={formData.accessibilityNeeds}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, accessibilityNeeds: checked as boolean })
                          }
                        />
                        <Label htmlFor="accessibility" className="flex items-center gap-2 text-sm">
                          <Accessibility className="h-4 w-4 text-muted-foreground" />
                          I need accessibility accommodations
                        </Label>
                      </div>
                      {formData.accessibilityNeeds && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Textarea
                            placeholder="Please describe your accommodation needs (e.g., sign language interpreter, screen reader compatible materials, wheelchair accessible room)..."
                            rows={3}
                            value={formData.accessibilityDetails}
                            onChange={(e) => setFormData({ ...formData, accessibilityDetails: e.target.value })}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Review your booking
                  </h2>
                  <div className="space-y-4 rounded-xl bg-card p-6 shadow-card">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Student ID</span>
                      <span className="font-medium text-foreground">{formData.studentId}</span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Meeting Type</span>
                      <span className="font-medium capitalize text-foreground">
                        {meetingReasons.find((r) => r.id === selectedReason)?.label}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Meeting Mode</span>
                      <span className="font-medium text-foreground">
                        {meetingModes.find((m) => m.id === selectedMode)?.label}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium text-foreground">
                        {formatDateForDisplay(selectedDate)} at {selectedTime}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    {formData.courseCode && (
                      <>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-muted-foreground">Course</span>
                          <span className="font-medium text-foreground">{formData.courseCode}</span>
                        </div>
                        <div className="border-t border-border" />
                      </>
                    )}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Topic</span>
                      <span className="font-medium text-foreground">{formData.subject}</span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Urgency</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        urgencyLevels.find((u) => u.id === selectedUrgency)?.color
                      }`}>
                        {urgencyLevels.find((u) => u.id === selectedUrgency)?.label}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="py-3">
                      <span className="text-muted-foreground">Details</span>
                      <p className="mt-2 text-sm text-foreground">{formData.description}</p>
                    </div>
                    {formData.accessibilityNeeds && (
                      <>
                        <div className="border-t border-border" />
                        <div className="py-3">
                          <span className="text-muted-foreground">Accessibility Needs</span>
                          <p className="mt-2 text-sm text-foreground">{formData.accessibilityDetails}</p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <motion.div {...buttonMotionProps}>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </motion.div>
              <motion.div {...buttonMotionProps}>
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                  {step === 4 ? "Confirm Booking" : "Continue"}
                  {step < 4 && <ChevronRight className="h-4 w-4" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
