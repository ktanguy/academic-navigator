import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeInUp, defaultTransition, buttonMotionProps } from "@/components/ui/motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["student", "facilitator", "admin"], { required_error: "Please select a role" }),
});

type UserRole = "student" | "facilitator" | "admin";

const roleInfo = {
  student: {
    icon: User,
    label: "Student",
    description: "Access appointments, tickets, and staff directory",
  },
  facilitator: {
    icon: Users,
    label: "Facilitator",
    description: "Manage requests, office hours, and student support",
  },
  admin: {
    icon: Shield,
    label: "Administrator",
    description: "Full platform access and analytics",
  },
};

// --- Theme wrapper for Auth page ---
const AuthPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div className="w-full max-w-md rounded-2xl bg-card/95 shadow-xl dark:shadow-2xl dark:shadow-black/20 p-8 border border-border">
      {children}
    </div>
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as UserRole | "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    let redirectTo: string | null = null;

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Call real login API
        const user = await login(formData.email, formData.password);
        
        console.log("Login successful, user:", user);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Set redirect path based on user role
        if (user.role === 'admin') {
          redirectTo = "/admin";
        } else if (user.role === 'facilitator') {
          redirectTo = "/facilitator";
        } else {
          redirectTo = "/student";
        }
      } else {
        const result = signupSchema.safeParse(formData);

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Call real register API
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });

        // Log out immediately so user has to log in
        await logout();

        toast({
          title: "Account created!",
          description: "Please sign in with your new credentials.",
        });

        // Switch to login mode instead of redirecting
        setIsLogin(true);
        setFormData({ name: "", email: formData.email, password: "", role: "" });
        // Don't redirect - stay on auth page
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    // Navigate after state updates are complete
    if (redirectTo) {
      console.log("Navigating to:", redirectTo);
      navigate(redirectTo);
    }
  };

  return (
    <AuthPageWrapper>
      <div className="mx-auto w-full max-w-md">
        {/* Mobile Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={defaultTransition}
          className="mb-8 flex items-center gap-2.5 lg:hidden"
        >
          <span className="text-lg font-semibold text-foreground">UniCenter</span>
        </motion.div>

        {/* Form Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Join the platform to get started"}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="role"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label>Select your role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <info.icon className="h-4 w-4" />
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {roleInfo[formData.role as UserRole]?.description}
                  </motion.p>
                )}
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <motion.div {...buttonMotionProps}>
            <Button
              type="submit"
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                  />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Toggle */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </AuthPageWrapper>
  );
};

export default Auth;