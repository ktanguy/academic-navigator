import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonMotionProps, quickTransition } from "@/components/ui/motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Base public links
const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/helpdesk", label: "Help Desk" },
];

// Role-based links
const roleLinks = {
  student: [
    { href: "/student", label: "Dashboard" },
    { href: "/booking", label: "Booking" },
  ],
  facilitator: [
    { href: "/facilitator", label: "Dashboard" },
    { href: "/student", label: "Student View" },
  ],
  admin: [
    { href: "/admin", label: "Admin" },
    { href: "/facilitator", label: "Facilitator" },
    { href: "/student", label: "Student" },
  ],
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Get navigation links based on user role
  const navLinks = useMemo(() => {
    if (!isAuthenticated || !user) {
      return publicLinks;
    }
    const userRoleLinks = roleLinks[user.role as keyof typeof roleLinks] || [];
    return [...publicLinks, ...userRoleLinks];
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!user) return "/student";
    if (user.role === "admin") return "/admin";
    if (user.role === "facilitator") return "/facilitator";
    if (user.role === "student") return "/student";
    return "/student";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tight text-primary dark:text-primary select-none">
            UniCenter
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.08, duration: 0.45, type: 'spring' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 overflow-hidden
                  ${location.pathname === link.href
                    ? "text-primary-foreground bg-primary shadow-md"
                    : "text-foreground hover:text-primary hover:bg-secondary"}
                `}
              >
                <span className="relative z-10">{link.label}</span>
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 -z-10 rounded-full bg-primary opacity-90 shadow-lg"
                    transition={{ type: 'spring' }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <NotificationBell />
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.4, type: 'spring', stiffness: 180 }}
                >
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover text-popover-foreground border-border" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getDashboardLink()} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4, type: 'spring', stiffness: 180 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="ghost" size="sm" className="w-full justify-center text-foreground hover:text-primary hover:bg-secondary transition-all duration-300" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4, type: 'spring', stiffness: 180 }}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button size="sm" className="w-full justify-center bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all duration-300" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4, type: 'spring', stiffness: 180 }}
                whileHover={{ scale: 1.09 }}
                whileTap={{ scale: 0.97 }}
                className=""
              >
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all duration-300"
                  onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M21.805 10.023h-9.765v3.977h5.588c-.241 1.285-1.41 3.777-5.588 3.777-3.364 0-6.104-2.777-6.104-6.2 0-3.423 2.74-6.2 6.104-6.2 1.921 0 3.211.823 3.951 1.523l2.899-2.823c-1.646-1.523-3.77-2.477-6.85-2.477-5.418 0-9.82 4.4-9.82 9.977s4.402 9.977 9.82 9.977c5.646 0 9.396-3.977 9.396-9.523 0-.636-.07-1.123-.156-1.523z" fill="#4285F4"/>
                      <path d="M3.272 6.697l3.273 2.404c.889-1.523 2.41-2.523 4.495-2.523 1.921 0 3.211.823 3.951 1.523l2.899-2.823c-1.646-1.523-3.77-2.477-6.85-2.477-3.364 0-6.104 2.777-6.104 6.2 0 .636.07 1.123.156 1.523z" fill="#34A853"/>
                      <path d="M12.04 21.777c3.364 0 6.104-2.777 6.104-6.2 0-.636-.07-1.123-.156-1.523h-5.948v-3.977h9.765c.07.409.156.887.156 1.523 0 5.546-3.75 9.523-9.396 9.523-3.08 0-5.204-.954-6.85-2.477l3.273-2.404c.889 1.523 2.41 2.523 4.495 2.523z" fill="#FBBC05"/>
                      <path d="M21.805 10.023h-9.765v3.977h5.588c-.241 1.285-1.41 3.777-5.588 3.777-1.921 0-3.211-.823-3.951-1.523l-3.273 2.404c1.646 1.523 3.77 2.477 6.85 2.477 5.646 0 9.396-3.977 9.396-9.523 0-.636-.07-1.123-.156-1.523z" fill="#EA4335"/>
                    </g>
                  </svg>
                  Sign in with Google
                </Button>
              </motion.div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-blue-900 transition-colors hover:bg-blue-200/60 dark:text-blue-200 dark:hover:bg-blue-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-300
                      ${location.pathname === link.href
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"}
                    `}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-center text-foreground hover:text-primary hover:bg-accent transition-all duration-300" asChild>
                      <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center text-destructive border-destructive/30 hover:bg-destructive/10 transition-all duration-300" 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-center text-foreground hover:text-primary hover:bg-accent transition-all duration-300" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
