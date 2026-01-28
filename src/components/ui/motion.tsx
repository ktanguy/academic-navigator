import { motion, HTMLMotionProps, Variants, Transition } from "framer-motion";
import { forwardRef } from "react";

// Respect reduced motion preferences
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.97 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.06,
      delayChildren: 0.1,
    },
  },
};

// Animation config with proper typing
export const defaultTransition: Transition = {
  duration: prefersReducedMotion ? 0 : 0.3,
  ease: "easeOut",
};

export const quickTransition: Transition = {
  duration: prefersReducedMotion ? 0 : 0.2,
  ease: "easeOut",
};

// Page transition wrapper
export const PageTransition = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: React.ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInUp}
    transition={defaultTransition}
    {...props}
  >
    {children}
  </motion.div>
));
PageTransition.displayName = "PageTransition";

// Animated card wrapper
export const AnimatedCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: React.ReactNode; delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={scaleIn}
    transition={{ ...defaultTransition, delay }}
    whileHover={
      prefersReducedMotion
        ? {}
        : {
            y: -2,
            boxShadow:
              "0 8px 24px -8px rgba(1, 75, 170, 0.15), 0 2px 8px -2px rgba(1, 75, 170, 0.08)",
            transition: quickTransition,
          }
    }
    {...props}
  >
    {children}
  </motion.div>
));
AnimatedCard.displayName = "AnimatedCard";

// Stagger container for lists
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: React.ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="initial"
    animate="animate"
    variants={staggerContainer}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerContainer.displayName = "StaggerContainer";

// Animated list item
export const AnimatedListItem = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & { children: React.ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={fadeInUp}
    transition={defaultTransition}
    {...props}
  >
    {children}
  </motion.div>
));
AnimatedListItem.displayName = "AnimatedListItem";

// Button hover/tap animation props
export const buttonMotionProps = prefersReducedMotion
  ? {}
  : {
      whileHover: { scale: 1.03 },
      whileTap: { scale: 0.97 },
      transition: { duration: 0.2, ease: "easeOut" as const },
    };

// Counter animation hook
export const useCountUp = (end: number, duration: number = 1500) => {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: duration / 1000 },
    },
  };
};
