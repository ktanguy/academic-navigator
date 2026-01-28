import { useState } from "react";
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
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  PageTransition,
  fadeInUp,
  defaultTransition,
  buttonMotionProps,
} from "@/components/ui/motion";

const meetingReasons = [
  { id: "homework", label: "Homework Help", icon: BookOpen, description: "Get help with assignments" },
  { id: "capstone", label: "Capstone Project", icon: GraduationCap, description: "Discuss your final project" },
  { id: "grades", label: "Grades Discussion", icon: FileText, description: "Review your academic progress" },
  { id: "general", label: "General Discussion", icon: MessageSquare, description: "Open conversation" },
  { id: "other", label: "Other", icon: HelpCircle, description: "Something else" },
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

const weekDays = [
  { date: "Jan 29", day: "Wed", available: true },
  { date: "Jan 30", day: "Thu", available: true },
  { date: "Jan 31", day: "Fri", available: false },
  { date: "Feb 1", day: "Sat", available: false },
  { date: "Feb 2", day: "Sun", available: false },
  { date: "Feb 3", day: "Mon", available: true },
  { date: "Feb 4", day: "Tue", available: true },
];

const Booking = () => {
  const [searchParams] = useSearchParams();
  const teacherId = searchParams.get("teacher");
  
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    file: null as File | null,
  });
  const [isBooked, setIsBooked] = useState(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      setIsBooked(true);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedReason !== "";
      case 2:
        return selectedDate !== "" && selectedTime !== "";
      case 3:
        return formData.subject !== "" && formData.description !== "";
      default:
        return true;
    }
  };

  const renderDynamicForm = () => {
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
            <div className="space-y-2">
              <Label>Upload Assignment (Optional)</Label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                </div>
              </div>
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
            <div className="space-y-2">
              <Label>Upload Proposal/Draft (Optional)</Label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                </div>
              </div>
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
                  <span className="font-medium text-foreground">{selectedDate}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{selectedTime}</span>
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
                          <span className="mt-1 font-semibold">{day.date}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4" />
                      Select Time
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {timeSlots.map((slot) => (
                        <motion.button
                          key={slot.time}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                            !slot.available
                              ? "cursor-not-allowed bg-destructive/10 text-destructive/50"
                              : selectedTime === slot.time
                              ? "bg-success text-success-foreground"
                              : "bg-card shadow-card hover:bg-success/10 hover:text-success"
                          }`}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-success" /> Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-destructive/30" /> Unavailable
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
                  <div className="space-y-5 rounded-xl bg-card p-6 shadow-card">
                    {renderDynamicForm()}
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
                      <span className="text-muted-foreground">Meeting Type</span>
                      <span className="font-medium capitalize text-foreground">
                        {meetingReasons.find((r) => r.id === selectedReason)?.label}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium text-foreground">
                        {selectedDate} at {selectedTime}
                      </span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Topic</span>
                      <span className="font-medium text-foreground">{formData.subject}</span>
                    </div>
                    <div className="border-t border-border" />
                    <div className="py-3">
                      <span className="text-muted-foreground">Details</span>
                      <p className="mt-2 text-sm text-foreground">{formData.description}</p>
                    </div>
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
