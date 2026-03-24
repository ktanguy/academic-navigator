// =============================================================================
// api.ts — All the API calls the frontend makes to the backend
// =============================================================================
// This is the ONE file where the frontend talks to the backend.
// Every button click that sends or fetches data goes through here.
//
// WHY ONE FILE FOR ALL API CALLS?
//   - Easy to manage. If the backend URL changes, you only update it here.
//   - Components don't need to know the URL or how to add login tokens —
//     they just call e.g. ticketsApi.create({...}) and get the result back.
//
// WHAT'S IN THIS FILE:
//   1. The shape of all data objects (TypeScript interfaces)
//   2. Helpers to save/get the login token from the browser
//   3. One shared function that makes all requests (adds login token, handles errors)
//   4. Named groups of API calls: authApi, ticketsApi, usersApi, etc.
// =============================================================================

// =============================================================================
// BACKEND URL
// =============================================================================
// In development: React runs on port 8080, Flask runs on port 5001 → use full URL
// In production (Render): both run on the same domain → just use /api
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

// =============================================================================
// DATA SHAPES (TypeScript interfaces)
// =============================================================================
// These describe what the data from the backend looks like.
// TypeScript uses them to warn you if you try to use a field that doesn't exist.
// They match the to_dict() methods in the Python models.

/** A user account — student, facilitator, or admin */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;                   // 'student' | 'facilitator' | 'admin'
  googleAccessToken?: string;     // Only present when logged in with Google
  department?: string;
  avatar_url?: string;
  created_at: string;             // When the account was created e.g. "2026-03-24T10:00:00"
}

/** A support ticket submitted by a student */
export interface Ticket {
  id: number;
  ticket_number: string;          // Human-readable ID e.g. "TKT-001"
  subject: string;
  description: string;
  category: string;               // Final category (could be different from what AI guessed)
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'answered' | 'escalated' | 'closed' | 'resolved' | 'needs-review';

  // What the AI said about this ticket
  ai_category?: string;           // What the AI guessed
  ai_confidence?: number;         // How sure the AI was (0.0 to 1.0)
  needs_review?: boolean;         // True if the AI wasn't confident enough (below 70%)
  reviewed_by?: number;           // ID of the admin who manually reviewed it
  reviewed_at?: string;           // When it was reviewed

  user_id: number;                // Who submitted it
  user_name?: string;
  assigned_to?: number;           // Which facilitator is handling it
  department?: string;
  created_at: string;
  updated_at: string;

  // Full objects, not just IDs — the backend includes these for convenience
  submitter?: User;               // The student who submitted it
  assignee?: User;                // The facilitator assigned to it
  reviewer?: User;                // The admin who reviewed it
  responses?: TicketResponse[];   // All the replies in the conversation
}

/** A single reply in a ticket's conversation */
export interface TicketResponse {
  id: number;
  ticket_id: number;
  user_id?: number;               // Empty for automated system messages
  message: string;
  is_system: boolean;             // True = automated note (e.g. "AI classified this as...")
  created_at: string;
  user?: User;                    // Who wrote it (empty for system messages)
}

/** A meeting booking between a student and a facilitator */
export interface Appointment {
  id: number;
  student_id: number;
  facilitator_id: number;
  date: string;                   // e.g. "2026-03-25"
  time_slot: string;              // e.g. "10:00 AM"
  duration: number;               // How many minutes the meeting is
  meeting_type?: string;          // homework | capstone | grades | general | other
  meeting_mode: 'in-person' | 'video' | 'phone';
  reason?: string;
  notes?: string;
  form_data?: Record<string, unknown>;  // Extra fields that vary by meeting type
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  student?: User;
  facilitator?: User;
}

/** A time slot when a facilitator is available for bookings */
export interface OfficeHours {
  id: number;
  facilitator_id: number;
  day_of_week: number;            // 0=Monday, 1=Tuesday, ... 6=Sunday
  day_name: string;               // "Monday", "Tuesday", etc.
  start_time: string;             // "09:00" (24-hour format)
  end_time: string;               // "17:00"
  is_available: boolean;          // False means this day is blocked off
  slot_duration: number;          // How many minutes each booking takes (default: 30)
  location?: string;              // "Office 101" or "Virtual (Zoom)"
  notes?: string;
}

/** One available time slot that a student can book */
export interface AvailableSlot {
  time: string;                   // e.g. "10:00 AM"
  duration: number;
  location?: string;
}

/** An alert shown in the notification bell at the top of the page */
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;      // 'appointment' | 'escalation' | 'resolution' | 'response' etc.
  reference_id?: number;          // ID of the related ticket or appointment
  reference_type?: string;        // 'ticket' or 'appointment' — tells the app where to navigate
  is_read: boolean;               // False = shows as unread (bold / highlighted)
  created_at: string;
}

/** What the server sends back after a successful login or register */
export interface LoginResponse {
  message: string;
  token: string;                  // The login token — stored in the browser
  user: User;
}

/** What the server sends back when something goes wrong */
export interface ApiError {
  error: string;
}

// =============================================================================
// SAVING THE LOGIN TOKEN IN THE BROWSER
// =============================================================================
// After logging in, we store the token in localStorage so the user stays logged
// in even after closing and reopening the browser tab.
// We also store the user object so we don't need to reload it immediately.

/** Get the stored login token (null if not logged in) */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/** Save the login token after logging in */
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/** Delete the login token when logging out */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/** Get the stored user object (null if not logged in or if storage is corrupted) */
export const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    // If the stored value is broken/invalid, remove it and return null
    localStorage.removeItem('user');
    return null;
  }
};

/** Save the user object after logging in */
export const setStoredUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

/** Delete the stored user object when logging out */
export const removeStoredUser = (): void => {
  localStorage.removeItem('user');
};

// =============================================================================
// apiRequest — the shared function all API calls use
// =============================================================================
// Every API call in this file goes through this one function.
// It handles three things automatically:
//   1. Adds the login token to the request header (so the backend knows who you are)
//   2. Sends the request to the right URL
//   3. Throws an error with the backend's message if something goes wrong
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // If we have a login token, include it in every request
    ...(token && { Authorization: `Bearer ${token}` }),
    // Let the caller add extra headers if needed
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // If the backend returned an error (4xx or 5xx), throw it as an error message
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// =============================================================================
// AUTH API — login, register, logout, get current user
// =============================================================================
export const authApi = {

  /** Logs in with email and password. Saves token and user to the browser. */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Save both the token and user details so the user stays logged in
    setToken(response.token);
    setStoredUser(response.user);
    return response;
  },

  /** Creates a new student account. Saves token and user to the browser. */
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
  }): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.token);
    setStoredUser(response.user);
    return response;
  },

  /** Logs out. Tells the server, then removes the token from the browser. */
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      // Always clear saved credentials, even if the server request fails
      removeToken();
      removeStoredUser();
    }
  },

  /** Checks if the current login token is still valid and gets fresh user info. */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest<{ user: User }>('/auth/me');
    return response.user;
  },
};

// =============================================================================
// TICKETS API — submit, view, reply to, and manage support tickets
// =============================================================================
export const ticketsApi = {

  /** Gets a list of tickets. Each role automatically sees different tickets. */
  getAll: async (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tickets: Ticket[]; total: number; pages: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return apiRequest(`/tickets${query ? `?${query}` : ''}`);
  },

  /** Gets one specific ticket including all its replies. */
  getById: async (id: number): Promise<Ticket> => {
    return apiRequest(`/tickets/${id}`);
  },

  /** Submits a new support ticket. The AI will classify it automatically. */
  create: async (data: {
    subject: string;
    description: string;
    category: string;
    priority?: string;
  }): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Updates a ticket's status, priority, assignment, or category. */
  update: async (
    id: number,
    data: Partial<Pick<Ticket, 'status' | 'priority' | 'assigned_to' | 'category'>>
  ): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Adds a reply to the ticket conversation. */
  addResponse: async (
    ticketId: number,
    message: string
  ): Promise<{ message: string; response: TicketResponse }> => {
    return apiRequest(`/tickets/${ticketId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /** Moves a ticket to a different department. */
  escalate: async (
    ticketId: number,
    reason: string
  ): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest(`/tickets/${ticketId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /** Gets counts and numbers for the dashboard charts. */
  getStats: async (): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
    needs_review?: number;
    avg_ai_confidence?: number;
  }> => {
    return apiRequest('/tickets/stats');
  },

  /** Gets all tickets that are waiting for a human to review (AI wasn't confident enough). */
  getNeedsReview: async (): Promise<{ tickets: Ticket[]; count: number }> => {
    return apiRequest('/tickets/needs-review');
  },

  /** Admin reviews a flagged ticket, confirms/changes its category, and assigns it. */
  review: async (
    ticketId: number,
    data: { category: string; assign_to?: number }
  ): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest(`/tickets/${ticketId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Checks if the AI on Hugging Face is currently reachable. */
  getClassifierInfo: async (): Promise<{
    using_ai: boolean;
    api_url: string;
    api_available: boolean;
    model: string;
    fallback: string;
    categories: string[];
  }> => {
    return apiRequest('/tickets/classifier-info');
  },

  /**
   * Sends text directly to Hugging Face to test the AI classifier.
   * Used in the admin panel to test the AI interactively.
   * Goes directly to HF — does NOT go through our backend.
   */
  testClassification: async (text: string): Promise<{
    category: string;
    confidence: number;
    model: string;
  }> => {
    const response = await fetch('https://tkwizera-student-support-api.hf.space/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    if (data.predicted_category) {
      return {
        category: data.predicted_category,
        confidence: data.confidence,
        model: 'AI Classifier (Hugging Face)',
      };
    }
    throw new Error('Classification failed');
  },
};

// =============================================================================
// USERS API — view and manage user accounts
// =============================================================================
export const usersApi = {

  /**
   * Gets a list of users. Can be filtered by role or department.
   * Used by: the Staff Directory (shows facilitators), the Admin Panel (shows everyone).
   */
  getAll: async (params?: {
    role?: string;
    department?: string;
  }): Promise<User[]> => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.department) searchParams.set('department', params.department);

    const query = searchParams.toString();
    const response = await apiRequest<{ users: User[] }>(`/users${query ? `?${query}` : ''}`);
    return response.users;
  },

  /** Gets one user's full profile. */
  getById: async (id: number): Promise<User> => {
    const response = await apiRequest<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  /** Gets all facilitators. Used by the appointment booking form. */
  getFacilitators: async (): Promise<User[]> => {
    const response = await apiRequest<{ facilitators: User[] }>('/users/facilitators');
    return response.facilitators || [];
  },

  /**
   * Updates a user's profile.
   * Admins can change anything including role.
   * Regular users can only update their own name, department, and profile picture.
   */
  update: async (
    id: number,
    data: Partial<Pick<User, 'name' | 'email' | 'department' | 'avatar_url' | 'role'>>
  ): Promise<{ message: string; user: User }> => {
    return apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** Gets ticket and appointment counts for one user. Used on the profile page. */
  getStats: async (userId: number): Promise<{
    tickets_submitted: number;
    tickets_resolved: number;
    appointments_count: number;
  }> => {
    return apiRequest(`/users/${userId}/stats`);
  },
};

// =============================================================================
// APPOINTMENTS API — book, confirm, and cancel meetings
// =============================================================================
export const appointmentsApi = {

  /**
   * Gets appointments for the current user.
   * Students see their own. Facilitators see their own. Admins see all.
   */
  getAll: async (params?: {
    status?: string;
    facilitator_id?: number;
  }): Promise<Appointment[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.facilitator_id) searchParams.set('facilitator_id', params.facilitator_id.toString());

    const query = searchParams.toString();
    const response = await apiRequest<{ appointments: Appointment[] }>(`/appointments${query ? `?${query}` : ''}`);
    return response.appointments;
  },

  /** Gets one specific appointment. */
  getById: async (id: number): Promise<Appointment> => {
    return apiRequest(`/appointments/${id}`);
  },

  /** Books a new appointment. The facilitator gets an email notification. */
  create: async (data: {
    facilitator_id: number;
    date: string;
    time_slot: string;
    meeting_type?: string;
    meeting_mode?: string;
    reason?: string;
    form_data?: Record<string, unknown>;
  }): Promise<{ message: string; appointment: Appointment }> => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Updates an appointment — used to confirm or add notes. */
  update: async (
    id: number,
    data: Partial<Pick<Appointment, 'status' | 'notes'>>
  ): Promise<{ message: string; appointment: Appointment }> => {
    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Cancels an appointment. */
  cancel: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  /** Gets open time slots for a facilitator on a specific date. */
  getAvailableSlots: async (
    facilitatorId: number,
    date: string
  ): Promise<{ available_slots: string[] }> => {
    return apiRequest(`/appointments/available-slots?facilitator_id=${facilitatorId}&date=${encodeURIComponent(date)}`);
  },
};

// =============================================================================
// NOTIFICATIONS API — in-app alerts (the bell icon)
// =============================================================================
export const notificationsApi = {

  /**
   * Gets notifications for the current user.
   * Pass unreadOnly=true to only get unread ones (used for the badge count).
   */
  getAll: async (unreadOnly = false): Promise<{ notifications: Notification[]; unread_count: number }> => {
    const query = unreadOnly ? '?unread_only=true' : '';
    return apiRequest(`/notifications${query}`);
  },

  /** Marks one notification as read (so it stops showing as highlighted). */
  markAsRead: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  /** Marks all notifications as read at once. */
  markAllAsRead: async (): Promise<{ message: string }> => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },
};

// =============================================================================
// GMAIL (Google OAuth path — not the main email system)
// =============================================================================
// NOTE: The main email system in this app uses Gmail SMTP through the backend.
// This function is an alternative way to send email using Google's access token
// directly from the frontend. It's not actively used in the main flow.
export async function sendGmailNotification({ email, subject, message, accessToken }: {
  email: string;
  subject: string;
  message: string;
  accessToken: string;
}) {
  return fetch('/api/send_gmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, subject, message, access_token: accessToken }),
  }).then(res => res.json());
}

// =============================================================================
// HEALTH CHECK — verify the backend is running
// =============================================================================
/** Checks if the backend is alive. Returns { status: 'healthy', message: '...' } */
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  return apiRequest('/health');
};

// =============================================================================
// OFFICE HOURS API — facilitator availability and booking slots
// =============================================================================
export const officeHoursApi = {

  /** Gets all office hours. Can be filtered by facilitator or day of the week. */
  getAll: async (params?: {
    facilitator_id?: number;
    day?: number;
  }): Promise<{ office_hours: OfficeHours[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.facilitator_id) searchParams.set('facilitator_id', params.facilitator_id.toString());
    if (params?.day !== undefined) searchParams.set('day', params.day.toString());

    const query = searchParams.toString();
    return apiRequest(`/office-hours${query ? `?${query}` : ''}`);
  },

  /** Gets all the office hours for one specific facilitator. */
  getByFacilitator: async (facilitatorId: number): Promise<{
    facilitator: User;
    office_hours: OfficeHours[];
  }> => {
    return apiRequest(`/office-hours/facilitator/${facilitatorId}`);
  },

  /**
   * Gets available booking slots for a facilitator on a specific date.
   * Already excludes slots that are already booked.
   * Used by the booking form so students can see what's free.
   */
  getAvailableSlots: async (facilitatorId: number, date: string): Promise<{
    date: string;
    day_of_week: number;
    available_slots: AvailableSlot[];
    booked_slots: string[];
  }> => {
    return apiRequest(`/office-hours/facilitator/${facilitatorId}/available-slots?date=${encodeURIComponent(date)}`);
  },

  /** Creates a new availability block (facilitators only). */
  create: async (data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration?: number;
    location?: string;
    notes?: string;
    facilitator_id?: number;  // Admins can set availability for other facilitators
  }): Promise<{ message: string; office_hours: OfficeHours }> => {
    return apiRequest('/office-hours', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Updates an existing availability block. */
  update: async (
    id: number,
    data: Partial<Omit<OfficeHours, 'id' | 'facilitator_id' | 'day_name'>>
  ): Promise<{ message: string; office_hours: OfficeHours }> => {
    return apiRequest(`/office-hours/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** Deletes an availability block. */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/office-hours/${id}`, {
      method: 'DELETE',
    });
  },

  /** Gets the current facilitator's own availability schedule. */
  getMy: async (): Promise<{ office_hours: OfficeHours[] }> => {
    return apiRequest('/office-hours/my');
  },

  /**
   * Sets the whole weekly schedule at once.
   * More efficient than creating each day one by one.
   * Replaces whatever schedule existed before.
   */
  setWeeklySchedule: async (data: {
    schedule: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available?: boolean;
      slot_duration?: number;
      location?: string;
      notes?: string;
    }>;
    facilitator_id?: number;  // Admins can set another facilitator's schedule
  }): Promise<{ message: string; office_hours: OfficeHours[] }> => {
    return apiRequest('/office-hours/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
