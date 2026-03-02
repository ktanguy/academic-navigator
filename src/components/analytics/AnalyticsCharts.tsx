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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { fadeInUp, defaultTransition } from "@/components/ui/motion";
import { TrendingUp, Clock, Users, CheckCircle2, AlertTriangle, Target } from "lucide-react";

// Type definitions for chart data
export interface TicketCategoryDataItem {
  name: string;
  count: number;
  aiAccuracy?: number;
  color: string;
}

export interface MonthlyTrendDataItem {
  month: string;
  tickets: number;
  appointments: number;
  aiResolved?: number;
}

export interface ClassificationDataItem {
  name: string;
  value: number;
  color: string;
}

export interface FacilitatorWorkloadItem {
  name: string;
  tickets: number;
  appointments: number;
  color: string;
}

export interface ResponseTimeDataItem {
  day: string;
  avgTime: number;
  target: number;
}

export interface ResolutionRateDataItem {
  month: string;
  firstContact: number;
  escalated: number;
  pending: number;
}

export interface QuickStatItem {
  avgResponseTime: string;
  firstContactRate: number;
  escalationRate: number;
  slaCompliance: number;
}

// Default data (used as fallback)
const defaultTicketCategoryData: TicketCategoryDataItem[] = [
  { name: "Assignment Issues", count: 342, aiAccuracy: 94, color: "#06142E" },
  { name: "Grade Appeals", count: 287, aiAccuracy: 87, color: "#3b82f6" },
  { name: "Capstone", count: 198, aiAccuracy: 91, color: "#8b5cf6" },
  { name: "Administrative", count: 156, aiAccuracy: 89, color: "#22c55e" },
  { name: "General Inquiry", count: 124, aiAccuracy: 92, color: "#f59e0b" },
];

const defaultMonthlyTrendData: MonthlyTrendDataItem[] = [
  { month: "Sep", tickets: 420, appointments: 380, aiResolved: 180 },
  { month: "Oct", tickets: 580, appointments: 420, aiResolved: 290 },
  { month: "Nov", tickets: 650, appointments: 480, aiResolved: 350 },
  { month: "Dec", tickets: 480, appointments: 350, aiResolved: 260 },
  { month: "Jan", tickets: 720, appointments: 520, aiResolved: 420 },
  { month: "Feb", tickets: 680, appointments: 490, aiResolved: 398 },
];

const defaultClassificationData: ClassificationDataItem[] = [
  { name: "High Confidence (≥70%)", value: 62, color: "#22c55e" },
  { name: "Low Confidence (<70%)", value: 24, color: "#f59e0b" },
  { name: "Flagged for Review", value: 14, color: "#ef4444" },
];

const defaultFacilitatorWorkload: FacilitatorWorkloadItem[] = [
  { name: "Dr. Sarah Chen", tickets: 45, appointments: 28, color: "#06142E" },
  { name: "Mark Johnson", tickets: 38, appointments: 32, color: "#3b82f6" },
  { name: "Dr. Emily Rodriguez", tickets: 52, appointments: 24, color: "#8b5cf6" },
  { name: "James Wilson", tickets: 31, appointments: 35, color: "#22c55e" },
  { name: "Lisa Park", tickets: 42, appointments: 29, color: "#f59e0b" },
];

const defaultResponseTimeData: ResponseTimeDataItem[] = [
  { day: "Mon", avgTime: 2.4, target: 4 },
  { day: "Tue", avgTime: 1.8, target: 4 },
  { day: "Wed", avgTime: 3.2, target: 4 },
  { day: "Thu", avgTime: 2.1, target: 4 },
  { day: "Fri", avgTime: 2.8, target: 4 },
  { day: "Sat", avgTime: 5.1, target: 4 },
  { day: "Sun", avgTime: 4.5, target: 4 },
];

const defaultResolutionRateData: ResolutionRateDataItem[] = [
  { month: "Sep", firstContact: 45, escalated: 32, pending: 23 },
  { month: "Oct", firstContact: 52, escalated: 28, pending: 20 },
  { month: "Nov", firstContact: 58, escalated: 25, pending: 17 },
  { month: "Dec", firstContact: 48, escalated: 30, pending: 22 },
  { month: "Jan", firstContact: 62, escalated: 22, pending: 16 },
  { month: "Feb", firstContact: 65, escalated: 20, pending: 15 },
];

// Department performance radar data
const departmentPerformanceData = [
  { subject: "Response Time", Academic: 92, StudentLife: 85, IT: 78, Health: 88, fullMark: 100 },
  { subject: "Resolution Rate", Academic: 88, StudentLife: 90, IT: 82, Health: 85, fullMark: 100 },
  { subject: "Satisfaction", Academic: 94, StudentLife: 92, IT: 75, Health: 90, fullMark: 100 },
  { subject: "AI Accuracy", Academic: 91, StudentLife: 87, IT: 89, Health: 83, fullMark: 100 },
  { subject: "Workload Mgmt", Academic: 85, StudentLife: 88, IT: 80, Health: 86, fullMark: 100 },
];

// Weekly ticket volume heatmap data
const weeklyVolumeData = [
  { hour: "8AM", Mon: 12, Tue: 15, Wed: 18, Thu: 14, Fri: 20, Sat: 5, Sun: 3 },
  { hour: "10AM", Mon: 28, Tue: 32, Wed: 35, Thu: 30, Fri: 38, Sat: 8, Sun: 5 },
  { hour: "12PM", Mon: 45, Tue: 48, Wed: 52, Thu: 46, Fri: 55, Sat: 12, Sun: 8 },
  { hour: "2PM", Mon: 38, Tue: 42, Wed: 45, Thu: 40, Fri: 48, Sat: 10, Sun: 6 },
  { hour: "4PM", Mon: 25, Tue: 28, Wed: 30, Thu: 26, Fri: 32, Sat: 6, Sun: 4 },
  { hour: "6PM", Mon: 15, Tue: 18, Wed: 20, Thu: 16, Fri: 22, Sat: 4, Sun: 3 },
];

// Student satisfaction trend
const satisfactionTrendData = [
  { month: "Sep", satisfaction: 88, responses: 245 },
  { month: "Oct", satisfaction: 90, responses: 312 },
  { month: "Nov", satisfaction: 87, responses: 289 },
  { month: "Dec", satisfaction: 92, responses: 198 },
  { month: "Jan", satisfaction: 94, responses: 356 },
  { month: "Feb", satisfaction: 95, responses: 378 },
];

export const TicketCategoryChart = ({ data = defaultTicketCategoryData }: { data?: TicketCategoryDataItem[] }) => (
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
        <BarChart data={data} layout="vertical">
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const TrendChart = ({ data = defaultMonthlyTrendData }: { data?: MonthlyTrendDataItem[] }) => (
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
        <LineChart data={data}>
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

export const AIClassificationChart = ({ data = defaultClassificationData }: { data?: ClassificationDataItem[] }) => (
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
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) => `${value}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
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
      {data.map((item) => (
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

export const FacilitatorWorkloadChart = ({ data = defaultFacilitatorWorkload }: { data?: FacilitatorWorkloadItem[] }) => (
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
        <BarChart data={data}>
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
            {data.map((entry, index) => (
              <Cell key={`cell-tickets-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <Bar 
            dataKey="appointments" 
            radius={[4, 4, 0, 0]}
            name="Appointments"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-appts-${index}`} fill={entry.color} opacity={0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

// AI Category Accuracy Table
export const CategoryAccuracyTable = ({ data = defaultTicketCategoryData }: { data?: TicketCategoryDataItem[] }) => (
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
          {data.map((category, index) => (
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

// Response Time Chart - Area chart showing daily response times
export const ResponseTimeChart = ({ data = defaultResponseTimeData }: { data?: ResponseTimeDataItem[] }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.2 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Average Response Time
        </h3>
        <p className="text-sm text-muted-foreground">Last 7 days (in hours)</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
        <Clock className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">2.8h avg</span>
      </div>
    </div>
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number, name: string) => [
              `${value}h`,
              name === "avgTime" ? "Avg Response" : "Target",
            ]}
          />
          <Area
            type="monotone"
            dataKey="avgTime"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#responseTimeGradient)"
            name="avgTime"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="target"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 flex items-center justify-center gap-6 text-xs">
      <span className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-blue-500" />
        Avg Response Time
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-8 border-t-2 border-dashed border-red-500" />
        4h Target
      </span>
    </div>
  </motion.div>
);

// Resolution Rate Chart - Stacked area chart
export const ResolutionRateChart = ({ data = defaultResolutionRateData }: { data?: ResolutionRateDataItem[] }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.25 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Resolution Rate Breakdown
        </h3>
        <p className="text-sm text-muted-foreground">Ticket outcomes by month (%)</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">65% First Contact</span>
      </div>
    </div>
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="firstContactGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="escalatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value}%`]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="firstContact"
            stackId="1"
            stroke="#22c55e"
            fill="url(#firstContactGradient)"
            name="First Contact Resolution"
          />
          <Area
            type="monotone"
            dataKey="escalated"
            stackId="1"
            stroke="#f59e0b"
            fill="url(#escalatedGradient)"
            name="Escalated"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stackId="1"
            stroke="#ef4444"
            fill="url(#pendingGradient)"
            name="Pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

// Department Performance Radar Chart
export const DepartmentPerformanceRadar = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.3 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground">
        Department Performance Comparison
      </h3>
      <p className="text-sm text-muted-foreground">Key metrics across departments</p>
    </div>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={departmentPerformanceData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
          />
          <Radar
            name="Academic Affairs"
            dataKey="Academic"
            stroke="#06142E"
            fill="#06142E"
            fillOpacity={0.3}
          />
          <Radar
            name="Student Life"
            dataKey="StudentLife"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
          />
          <Radar
            name="IT Support"
            dataKey="IT"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Radar
            name="Health Services"
            dataKey="Health"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
          />
          <Legend />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

// Student Satisfaction Trend Chart
export const SatisfactionTrendChart = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.35 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Student Satisfaction Trend
        </h3>
        <p className="text-sm text-muted-foreground">Monthly satisfaction scores</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
        <TrendingUp className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">+7% this semester</span>
      </div>
    </div>
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={satisfactionTrendData}>
          <defs>
            <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[80, 100]}
            unit="%"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="satisfaction"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#satisfactionGradient)"
            name="Satisfaction %"
          />
          <Bar
            yAxisId="right"
            dataKey="responses"
            fill="#06142E"
            radius={[4, 4, 0, 0]}
            opacity={0.6}
            name="Survey Responses"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

// Quick Stats Cards Component
export const QuickStatsRow = ({ data }: { data?: QuickStatItem }) => {
  const stats = [
    {
      icon: Clock,
      label: "Avg Response Time",
      value: data?.avgResponseTime || "2.8h",
      change: "-12%",
      positive: true,
      color: "bg-blue-500",
    },
    {
      icon: CheckCircle2,
      label: "First Contact Resolution",
      value: `${data?.firstContactRate || 65}%`,
      change: "+5%",
      positive: true,
      color: "bg-green-500",
    },
    {
      icon: AlertTriangle,
      label: "Escalation Rate",
      value: `${data?.escalationRate || 20}%`,
      change: "-3%",
      positive: true,
      color: "bg-orange-500",
    },
    {
      icon: Target,
      label: "SLA Compliance",
      value: `${data?.slaCompliance || 94}%`,
      change: "+2%",
      positive: true,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="rounded-xl bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <span
              className={`text-xs font-medium ${
                stat.positive ? "text-success" : "text-destructive"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Ticket Volume Heatmap (simplified version using bars)
export const TicketVolumeHeatmap = () => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    transition={{ ...defaultTransition, delay: 0.4 }}
    className="rounded-xl bg-card p-6 shadow-card"
  >
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground">
        Peak Hours Analysis
      </h3>
      <p className="text-sm text-muted-foreground">Ticket volume by day and time</p>
    </div>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyVolumeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
          <Bar dataKey="Mon" fill="#06142E" radius={[2, 2, 0, 0]} name="Monday" />
          <Bar dataKey="Tue" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Tuesday" />
          <Bar dataKey="Wed" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Wednesday" />
          <Bar dataKey="Thu" fill="#22c55e" radius={[2, 2, 0, 0]} name="Thursday" />
          <Bar dataKey="Fri" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Friday" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 rounded-lg bg-secondary/50 p-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Peak time:</span> Fridays at 12PM with an average of 55 tickets/hour
      </p>
    </div>
  </motion.div>
);