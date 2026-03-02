// API Service Layer for Academic Navigator

// In production, use relative URL (served from same origin)
// In development, use localhost:5001
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  googleAccessToken?: string;
  department?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'answered' | 'escalated' | 'closed' | 'resolved';
  ai_category?: string;
  ai_confidence?: number;
  user_id: number;
  user_name?: string;
  assigned_to?: number;
  department?: string;
  created_at: string;
  updated_at: string;
  submitter?: User;
  assignee?: User;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  user_id?: number;
  message: string;
  is_system: boolean;
  created_at: string;
  user?: User;
}

export interface Appointment {
  id: number;
  student_id: number;
  facilitator_id: number;
  date: string;
  time_slot: string;
  duration: number;
  meeting_type?: string;
  meeting_mode: 'in-person' | 'video' | 'phone';
  reason?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  student?: User;
  facilitator?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  reference_id?: number;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    // Invalid JSON in localStorage, clear it
    localStorage.removeItem('user');
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem('user');
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(response.token);
    setStoredUser(response.user);
    return response;
  },

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

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
      removeStoredUser();
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest<{ user: User }>('/auth/me');
    return response.user;
  },
};

// Tickets API
export const ticketsApi = {
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

  getById: async (id: number): Promise<Ticket> => {
    return apiRequest(`/tickets/${id}`);
  },

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

  update: async (
    id: number,
    data: Partial<Pick<Ticket, 'status' | 'priority' | 'assigned_to' | 'category'>>
  ): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addResponse: async (
    ticketId: number,
    message: string
  ): Promise<{ message: string; response: TicketResponse }> => {
    return apiRequest(`/tickets/${ticketId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  escalate: async (
    ticketId: number,
    reason: string
  ): Promise<{ message: string; ticket: Ticket }> => {
    return apiRequest(`/tickets/${ticketId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getStats: async (): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
  }> => {
    return apiRequest('/tickets/stats');
  },

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

  testClassification: async (text: string): Promise<{
    category: string;
    confidence: number;
    model: string;
  }> => {
    // Call the remote classifier directly for testing (Hugging Face Spaces)
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

// Users API
export const usersApi = {
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

  getById: async (id: number): Promise<User> => {
    const response = await apiRequest<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  getFacilitators: async (): Promise<User[]> => {
    const response = await apiRequest<{ facilitators: User[] }>('/users/facilitators');
    return response.facilitators || [];
  },

  update: async (
    id: number,
    data: Partial<Pick<User, 'name' | 'department' | 'avatar_url'>>
  ): Promise<{ message: string; user: User }> => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStats: async (userId: number): Promise<{
    tickets_submitted: number;
    tickets_resolved: number;
    appointments_count: number;
  }> => {
    return apiRequest(`/users/${userId}/stats`);
  },
};

// Appointments API
export const appointmentsApi = {
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

  getById: async (id: number): Promise<Appointment> => {
    return apiRequest(`/appointments/${id}`);
  },

  create: async (data: {
    facilitator_id: number;
    date: string;
    time_slot: string;
    meeting_type?: string;
    meeting_mode?: string;
    reason?: string;
  }): Promise<{ message: string; appointment: Appointment }> => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: number,
    data: Partial<Pick<Appointment, 'status' | 'notes'>>
  ): Promise<{ message: string; appointment: Appointment }> => {
    return apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  getAvailableSlots: async (
    facilitatorId: number,
    date: string
  ): Promise<{ available_slots: string[] }> => {
    return apiRequest(`/appointments/available-slots?facilitator_id=${facilitatorId}&date=${encodeURIComponent(date)}`);
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (unreadOnly = false): Promise<{ notifications: Notification[]; unread_count: number }> => {
    const query = unreadOnly ? '?unread_only=true' : '';
    return apiRequest(`/notifications${query}`);
  },

  markAsRead: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },
};

// Gmail Notification
export async function sendGmailNotification({ email, subject, message, accessToken }: {
  email: string;
  subject: string;
  message: string;
  accessToken: string;
}) {
  return fetch('/api/send_gmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, subject, message, access_token: accessToken }),
  }).then(res => res.json());
}

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  return apiRequest('/health');
};
