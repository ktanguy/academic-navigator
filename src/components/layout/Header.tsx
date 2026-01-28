import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonMotionProps, quickTransition } from "@/components/ui/motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/student", label: "Student Portal" },
  { href: "/facilitator", label: "Facilitator" },
  { href: "/admin", label: "Admin" },
];

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            AcademicAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              {location.pathname === link.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-x-2 -bottom-[1px] h-0.5 bg-primary"
                  transition={quickTransition}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <motion.div {...buttonMotionProps}>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </motion.div>
          <motion.div {...buttonMotionProps}>
            <Button size="sm">Get Started</Button>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={quickTransition}
            className="border-t border-border bg-card md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  Sign In
                </Button>
                <Button size="sm" className="w-full justify-center">
                  Get Started
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
