import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Calendar,
  GraduationCap,
  BookOpen,
  Lightbulb,
} from "lucide-react";

// Floating card data with icons and colors - using dark mode compatible classes
const floatingCards = [
  {
    id: 1,
    icon: GraduationCap,
    bgColor: "bg-gray-900 dark:bg-gray-100",
    iconColor: "text-white dark:text-gray-900",
    position: "left-[15%] top-[15%]",
    rotation: "-rotate-12",
    delay: 0,
  },
  {
    id: 2,
    icon: Users,
    bgColor: "bg-teal-100 dark:bg-teal-900/50",
    iconColor: "text-teal-600 dark:text-teal-400",
    position: "left-[40%] top-[5%]",
    rotation: "rotate-6",
    delay: 0.1,
  },
  {
    id: 3,
    icon: BookOpen,
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    position: "right-[20%] top-[12%]",
    rotation: "-rotate-6",
    delay: 0.2,
  },
  {
    id: 4,
    icon: MessageSquare,
    bgColor: "bg-rose-100 dark:bg-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    position: "left-[8%] top-[45%]",
    rotation: "rotate-12",
    delay: 0.3,
  },
  {
    id: 5,
    icon: Lightbulb,
    bgColor: "bg-sky-100 dark:bg-sky-900/50",
    iconColor: "text-sky-600 dark:text-sky-400",
    position: "right-[10%] top-[40%]",
    rotation: "-rotate-12",
    delay: 0.4,
  },
];

// Floating Card Component
const FloatingCard = ({ card }: { card: typeof floatingCards[0] }) => {
  const Icon = card.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: card.delay, duration: 0.6, ease: "easeOut" }}
      className={`absolute ${card.position} hidden md:block`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
        className={`${card.rotation}`}
      >
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.bgColor} shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/10 lg:h-20 lg:w-20`}>
          <Icon className={`h-7 w-7 ${card.iconColor} lg:h-9 lg:w-9`} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Stats = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F6FCFA] via-[#E6F1ED] to-[#D6F5EF] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 md:py-32 lg:py-40">
      {/* Floating Cards */}
      {floatingCards.map((card) => (
        <FloatingCard key={card.id} card={card} />
      ))}

      {/* Center Content */}
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4"
          >
            By the numbers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Support that<br />moves fast.
          </motion.h2>

          {/* Stats row below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { value: "87%", label: "AI Accuracy" },
              { value: "70%", label: "Confidence Threshold" },
              { value: "5", label: "Departments Covered" },
              { value: "$0", label: "Deployment Cost" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-primary">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
