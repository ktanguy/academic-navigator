import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, authApi, getStoredUser, getToken, removeToken, removeStoredUser } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; role?: string; department?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize user from localStorage synchronously to avoid flash
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token is invalid or expired
      removeToken();
      removeStoredUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Validate the token with the server
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    // Ensure context is fully updated before proceeding
    await refreshUser();
    return response.user;
  };

  const register = async (data: { email: string; password: string; name: string; role?: string; department?: string }) => {
    const response = await authApi.register(data);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  // Google OAuth callback handler
  const handleGoogleAuth = async (code: string) => {
    // Exchange code for access token and user info
    const res = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data && data.user && data.access_token) {
      setUser({ ...data.user, googleAccessToken: data.access_token });
    }
  };

  // Listen for Google OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && window.location.pathname === '/auth/google/callback') {
      handleGoogleAuth(code);
      // Remove code from URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
