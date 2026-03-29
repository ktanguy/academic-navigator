import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, TicketCheck, CalendarCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
});

const features = [
  {
    icon: TicketCheck,
    title: "AI-Routed Tickets",
    desc: "Submit a support request and the AI routes it to the right team instantly.",
  },
  {
    icon: CalendarCheck,
    title: "Book Appointments",
    desc: "Schedule sessions with facilitators at times that work for you.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared without your consent.",
  },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('signup') !== 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !isLoading) {
      const redirectPath = user.role === 'admin' ? '/admin'
        : user.role === 'facilitator' ? '/facilitator'
        : '/student';
      navigate(redirectPath, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, isLoading]);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email: formData.email, password: formData.password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }
        const user = await login(formData.email, formData.password);
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'facilitator' ? '/facilitator' : '/student';
        navigate(redirectPath, { replace: true });
        return;
      } else {
        if (!agreedToPolicy) {
          setErrors({ policy: "You must agree to the Privacy Policy and Terms of Use to create an account." });
          setIsLoading(false);
          return;
        }
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }
        await register({ email: formData.email, password: formData.password, name: formData.name });
        await logout();
        toast({ title: "Account created!", description: "Please sign in with your new credentials." });
        setIsLogin(true);
        setFormData({ name: "", email: formData.email, password: "" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ------------------------------------------------------------------ */}
      {/* LEFT PANEL — branding                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#0D1A63' }}
      >
        {/* Logo */}
        <Link to="/" className="text-white font-semibold text-xl">
          UniCenter
        </Link>

        {/* Headline */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight"
          >
            Academic support,<br />the smart way.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-white/60 text-lg leading-relaxed max-w-sm"
          >
            Raise tickets, book sessions, and get answers. All in one place.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 space-y-6"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom note */}
        <p className="text-white/30 text-xs">
          © 2026 Academic Navigator. All rights reserved.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT PANEL — form                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center lg:hidden">
            <span className="text-lg font-semibold text-foreground">UniCenter</span>
          </Link>

          {/* Heading */}
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
            <p className="mt-2 text-muted-foreground text-sm">
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
            {/* Name field — signup only */}
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
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Privacy policy checkbox — signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToPolicy}
                      onChange={(e) => {
                        setAgreedToPolicy(e.target.checked);
                        if (errors.policy) setErrors((prev) => ({ ...prev, policy: "" }));
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I have read and agree to the{" "}
                      <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                        Terms of Use
                      </Link>.
                    </span>
                  </label>
                  {errors.policy && <p className="text-sm text-destructive">{errors.policy}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div {...buttonMotionProps} className="pt-1">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
                style={{ backgroundColor: '#0D1A63' }}
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

          {/* Switch between login / signup */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>

          {/* Privacy link — login page footer */}
          {isLogin && (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              {" · "}
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Terms of Use
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
