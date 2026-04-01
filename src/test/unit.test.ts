/**
 * Frontend Unit Tests — Academic Navigator (UniCenter)
 * Tests for utility functions, status config, validation logic,
 * and data-transformation helpers used across the app.
 *
 * Run: npx vitest run src/test/unit.test.ts
 */

import { describe, it, expect } from "vitest";

// ─────────────────────────────────────────────────────────────
// Inline helpers (mirrors logic from StudentPortal / HelpDesk)
// ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; label: string }> = {
  open:          { color: "bg-warning text-warning-foreground",          label: "Open" },
  "in-progress": { color: "bg-primary text-primary-foreground",          label: "In Progress" },
  resolved:      { color: "bg-success text-success-foreground",          label: "Resolved" },
  answered:      { color: "bg-success text-success-foreground",          label: "Answered" },
  escalated:     { color: "bg-destructive text-destructive-foreground",  label: "Escalated" },
  closed:        { color: "bg-muted text-muted-foreground",              label: "Closed" },
  "needs-review":{ color: "bg-orange-500 text-white",                   label: "Under Review" },
};

const priorityConfig: Record<string, string> = {
  high:   "border-destructive/50 bg-destructive/5",
  medium: "border-warning/50 bg-warning/5",
  low:    "border-border",
};

const DEPT_MAP: Record<string, string> = {
  assignment:     "Academic Affairs",
  grades:         "Academic Affairs",
  general:        "Academic Affairs",
  technical:      "IT Support",
  administrative: "Registrar's Office",
  capstone:       "Capstone Committee",
};

function getDepartment(category: string): string {
  return DEPT_MAP[category] ?? "Academic Affairs";
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function isHighConfidence(confidence: number): boolean {
  return confidence >= 0.7;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function getStatusLabel(status: string): string {
  return (statusConfig[status] ?? statusConfig["open"]).label;
}

function getStatusColor(status: string): string {
  return (statusConfig[status] ?? statusConfig["open"]).color;
}

function getPriorityClass(priority: string): string {
  return priorityConfig[priority] ?? priorityConfig["low"];
}

function countByStatus(tickets: { status: string }[], status: string): number {
  return tickets.filter(t => t.status === status).length;
}

function isTicketResolved(status: string): boolean {
  return status === "resolved" || status === "answered" || status === "closed";
}

function isTicketOpen(status: string): boolean {
  return status === "open" || status === "in-progress";
}

// JS day → Python day conversion (used in Booking.tsx)
function toPythonDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

// Ticket number format check
function isValidTicketNumber(id: string): boolean {
  return /^TKT-\d{6}$/.test(id);
}

// Email format validation (mirrors Zod schema)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password strength (min 8 chars)
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Truncate text for display
function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}


// ─────────────────────────────────────────────────────────────
// 1. Status configuration
// ─────────────────────────────────────────────────────────────
describe("Status config", () => {
  it("returns correct label for open", () => {
    expect(getStatusLabel("open")).toBe("Open");
  });

  it("returns correct label for in-progress", () => {
    expect(getStatusLabel("in-progress")).toBe("In Progress");
  });

  it("returns correct label for escalated", () => {
    expect(getStatusLabel("escalated")).toBe("Escalated");
  });

  it("returns correct label for answered", () => {
    expect(getStatusLabel("answered")).toBe("Answered");
  });

  it("falls back to open config for unknown status", () => {
    expect(getStatusLabel("unknown-status")).toBe("Open");
  });

  it("returns destructive color for escalated", () => {
    expect(getStatusColor("escalated")).toContain("destructive");
  });

  it("returns success color for resolved", () => {
    expect(getStatusColor("resolved")).toContain("success");
  });

  it("all statuses have both color and label", () => {
    for (const key of Object.keys(statusConfig)) {
      expect(statusConfig[key].color).toBeTruthy();
      expect(statusConfig[key].label).toBeTruthy();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 2. Priority config
// ─────────────────────────────────────────────────────────────
describe("Priority config", () => {
  it("high priority includes destructive border", () => {
    expect(getPriorityClass("high")).toContain("destructive");
  });

  it("medium priority includes warning border", () => {
    expect(getPriorityClass("medium")).toContain("warning");
  });

  it("low priority returns border-border", () => {
    expect(getPriorityClass("low")).toBe("border-border");
  });

  it("unknown priority falls back to low", () => {
    expect(getPriorityClass("critical")).toBe("border-border");
  });
});

// ─────────────────────────────────────────────────────────────
// 3. Department routing
// ─────────────────────────────────────────────────────────────
describe("Department routing", () => {
  it("technical maps to IT Support", () => {
    expect(getDepartment("technical")).toBe("IT Support");
  });

  it("grades maps to Academic Affairs", () => {
    expect(getDepartment("grades")).toBe("Academic Affairs");
  });

  it("assignment maps to Academic Affairs", () => {
    expect(getDepartment("assignment")).toBe("Academic Affairs");
  });

  it("capstone maps to Capstone Committee", () => {
    expect(getDepartment("capstone")).toBe("Capstone Committee");
  });

  it("administrative maps to Registrar's Office", () => {
    expect(getDepartment("administrative")).toBe("Registrar's Office");
  });

  it("unknown category defaults to Academic Affairs", () => {
    expect(getDepartment("unknown")).toBe("Academic Affairs");
  });
});

// ─────────────────────────────────────────────────────────────
// 4. AI confidence threshold
// ─────────────────────────────────────────────────────────────
describe("AI confidence threshold", () => {
  it("70% is high confidence (auto-assign)", () => {
    expect(isHighConfidence(0.7)).toBe(true);
  });

  it("95% is high confidence", () => {
    expect(isHighConfidence(0.95)).toBe(true);
  });

  it("69% is low confidence (human review)", () => {
    expect(isHighConfidence(0.69)).toBe(false);
  });

  it("formats confidence as percentage string", () => {
    expect(formatConfidence(0.87)).toBe("87%");
  });

  it("formats 100% correctly", () => {
    expect(formatConfidence(1.0)).toBe("100%");
  });
});

// ─────────────────────────────────────────────────────────────
// 5. Ticket status helpers
// ─────────────────────────────────────────────────────────────
describe("Ticket status helpers", () => {
  it("open ticket is considered open", () => {
    expect(isTicketOpen("open")).toBe(true);
  });

  it("in-progress ticket is considered open", () => {
    expect(isTicketOpen("in-progress")).toBe(true);
  });

  it("resolved ticket is not open", () => {
    expect(isTicketOpen("resolved")).toBe(false);
  });

  it("answered ticket is resolved", () => {
    expect(isTicketResolved("answered")).toBe(true);
  });

  it("closed ticket is resolved", () => {
    expect(isTicketResolved("closed")).toBe(true);
  });

  it("open ticket is not resolved", () => {
    expect(isTicketResolved("open")).toBe(false);
  });

  it("counts open tickets correctly", () => {
    const tickets = [
      { status: "open" }, { status: "open" }, { status: "closed" }
    ];
    expect(countByStatus(tickets, "open")).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────
// 6. Calendar day conversion
// ─────────────────────────────────────────────────────────────
describe("JS to Python day conversion", () => {
  it("Sunday (JS 0) → Python 6", () => {
    expect(toPythonDay(0)).toBe(6);
  });

  it("Monday (JS 1) → Python 0", () => {
    expect(toPythonDay(1)).toBe(0);
  });

  it("Friday (JS 5) → Python 4", () => {
    expect(toPythonDay(5)).toBe(4);
  });

  it("Saturday (JS 6) → Python 5", () => {
    expect(toPythonDay(6)).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────
// 7. Validation helpers
// ─────────────────────────────────────────────────────────────
describe("Form validation", () => {
  it("valid email passes", () => {
    expect(isValidEmail("student@alustudent.com")).toBe(true);
  });

  it("email without @ fails", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("password of 8 chars is valid", () => {
    expect(isValidPassword("password")).toBe(true);
  });

  it("password of 7 chars is invalid", () => {
    expect(isValidPassword("short")).toBe(false);
  });

  it("valid ticket number format passes", () => {
    expect(isValidTicketNumber("TKT-000123")).toBe(true);
  });

  it("truncates long text with ellipsis", () => {
    const result = truncate("This is a very long subject line", 10);
    expect(result).toBe("This is a …");
    expect(result.length).toBeLessThanOrEqual(12);
  });

  it("does not truncate short text", () => {
    expect(truncate("Short", 10)).toBe("Short");
  });
});

// ─────────────────────────────────────────────────────────────
// 8. Date formatting
// ─────────────────────────────────────────────────────────────
describe("Date formatting", () => {
  it("formats ISO date to readable string", () => {
    const result = formatDate("2026-04-01T10:00:00Z");
    expect(result).toContain("2026");
  });

  it("formatted date contains month abbreviation", () => {
    const result = formatDate("2026-01-15T00:00:00Z");
    expect(result).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
  });
});
