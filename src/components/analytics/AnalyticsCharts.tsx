import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { fadeInUp, defaultTransition } from "@/components/ui/motion";

// Ticket category data with AI classification stats
const ticketCategoryData = [
  { name: "Course Registration", count: 342, aiAccuracy: 94, color: "#06142E" },
  { name: "Financial Aid", count: 287, aiAccuracy: 89, color: "#3b82f6" },
  { name: "Academic Appeals", count: 198, aiAccuracy: 82, color: "#8b5cf6" },
  { name: "Housing", count: 156, aiAccuracy: 91, color: "#22c55e" },
  { name: "Career Services", count: 124, aiAccuracy: 88, color: "#f59e0b" },
  { name: "IT Support", count: 98, aiAccuracy: 95, color: "#ec4899" },
];

// Monthly trend data
const monthlyTrendData = [
  { month: "Sep", tickets: 420, appointments: 380, aiResolved: 180 },
  { month: "Oct", tickets: 580, appointments: 420, aiResolved: 290 },
  { month: "Nov", tickets: 650, appointments: 480, aiResolved: 350 },
  { month: "Dec", tickets: 480, appointments: 350, aiResolved: 260 },
  { month: "Jan", tickets: 720, appointments: 520, aiResolved: 420 },
];

// AI Classification performance
const classificationData = [
  { name: "High Confidence (>85%)", value: 58, color: "#22c55e" },
  { name: "Medium Confidence (60-85%)", value: 28, color: "#f59e0b" },
  { name: "Low Confidence (<60%)", value: 14, color: "#ef4444" },
];

// Facilitator workload
const facilitatorWorkload = [
  { name: "Dr. Sarah Chen", tickets: 45, appointments: 28, color: "#06142E" },
  { name: "Mark Johnson", tickets: 38, appointments: 32, color: "#3b82f6" },
  { name: "Dr. Emily Rodriguez", tickets: 52, appointments: 24, color: "#8b5cf6" },
  { name: "James Wilson", tickets: 31, appointments: 35, color: "#22c55e" },
  { name: "Lisa Park", tickets: 42, appointments: 29, color: "#f59e0b" },
];

export const TicketCategoryChart = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.1 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <h3 className="mb-6 text-lg font-semibold text-foreground">
      Tickets by Category
    </h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ticketCategoryData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120} 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number, name: string) => [value, name === "count" ? "Tickets" : "AI Accuracy %"]}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]}
            name="Tickets"
          >
            {ticketCategoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const TrendChart = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.2 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <h3 className="mb-6 text-lg font-semibold text-foreground">
      Monthly Trends
    </h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tickets" 
            stroke="#06142E" 
            strokeWidth={2}
            dot={{ fill: "#06142E", strokeWidth: 2 }}
            name="Total Tickets"
          />
          <Line 
            type="monotone" 
            dataKey="appointments" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2 }}
            name="Appointments"
          />
          <Line 
            type="monotone" 
            dataKey="aiResolved" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: "#22c55e", strokeWidth: 2 }}
            name="AI Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const AIClassificationChart = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.3 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <h3 className="mb-6 text-lg font-semibold text-foreground">
      AI Classification Confidence
    </h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={classificationData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) => `${value}%`}
            labelLine={false}
          >
            {classificationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value}%`, "Tickets"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 space-y-2">
      {classificationData.map((item) => (
        <div key={item.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
          </div>
          <span className="font-medium text-foreground">{item.value}%</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export const FacilitatorWorkloadChart = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.4 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <h3 className="mb-6 text-lg font-semibold text-foreground">
      Facilitator Workload Distribution
    </h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={facilitatorWorkload}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={11}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend />
          <Bar 
            dataKey="tickets" 
            radius={[4, 4, 0, 0]}
            name="Tickets"
          >
            {facilitatorWorkload.map((entry, index) => (
              <Cell key={`cell-tickets-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <Bar 
            dataKey="appointments" 
            radius={[4, 4, 0, 0]}
            name="Appointments"
          >
            {facilitatorWorkload.map((entry, index) => (
              <Cell key={`cell-appts-${index}`} fill={entry.color} opacity={0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

// AI Category Accuracy Table
export const CategoryAccuracyTable = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.2 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <h3 className="mb-6 text-lg font-semibold text-foreground">
      AI Classification Accuracy by Category
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
              Category
            </th>
            <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
              Total Tickets
            </th>
            <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
              AI Accuracy
            </th>
            <th className="pb-3 text-left text-sm font-medium text-muted-foreground pl-4">
              Performance
            </th>
          </tr>
        </thead>
        <tbody>
          {ticketCategoryData.map((category, index) => (
            <motion.tr
              key={category.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="border-b border-border last:border-0"
            >
              <td className="py-3 text-sm font-medium text-foreground">
                {category.name}
              </td>
              <td className="py-3 text-right text-sm text-foreground">
                {category.count}
              </td>
              <td className="py-3 text-right text-sm font-semibold text-foreground">
                {category.aiAccuracy}%
              </td>
              <td className="py-3 pl-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.aiAccuracy}%` }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        category.aiAccuracy >= 90
                          ? "bg-success"
                          : category.aiAccuracy >= 80
                          ? "bg-accent"
                          : "bg-warning"
                      }`}
                    />
                  </div>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);