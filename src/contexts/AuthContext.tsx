// =============================================================================
// AuthContext.tsx — Keeps track of who is logged in, across the whole app
// =============================================================================
// This file answers one question for every component in the app: "who is logged in?"
//
// WHAT IS REACT CONTEXT?
//   Normally, if multiple parts of the app need the same data, you'd have to
//   pass it down through every component in between — which gets messy.
//   Context is a shortcut: you put data in one place (here), and any component
//   can read it directly. No passing props through every level.
//
//   Instead of: App → Layout → Header → UserMenu (passing "user" each time)
//   Any component can just do: const { user } = useAuth()
//
// HOW LOGIN WORKS IN THIS APP:
//   1. User enters email + password and clicks "Login"
//   2. The backend checks the password and sends back a token (like a key card)
//   3. We save the token in the browser's localStorage (survives page refreshes)
//   4. On every page load, we ask the server "is this token still valid?"
//      (catches expired tokens, deleted accounts, etc.)
//   5. When the user logs out, we delete the token from localStorage
//
// HOW COMPONENTS USE THIS:
//   import { useAuth } from '@/contexts/AuthContext'
//   const { user, isAuthenticated, login, logout } = useAuth()
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, authApi, getStoredUser, getToken, removeToken, removeStoredUser } from '@/services/api';

// This describes everything this file provides to the rest of the app
interface AuthContextType {
  user: User | null;              // The logged-in user, or null if nobody is logged in
  isLoading: boolean;             // True while we're checking if the token is still valid
  isAuthenticated: boolean;       // Simple true/false — is someone logged in?
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; role?: string; department?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // Re-fetch the user's info from the server
}

// Create the context. undefined means "not set up yet" — useAuth() will catch this.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// AuthProvider — wraps the entire app (see main.tsx or App.tsx)
// =============================================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {

  // ---------------------------------------------------------------------------
  // STATE — what we track
  // ---------------------------------------------------------------------------

  // Start with whatever user is saved in the browser's localStorage.
  // Why read it immediately instead of waiting? So there's no flicker where
  // the page briefly shows "not logged in" before it finishes loading.
  // The (() => getStoredUser()) syntax means: run this once right now, at startup.
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  // While we're asking the server "is this token still valid?", isLoading = true.
  // The app shows a loading screen until this is done.
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // refreshUser — check with the server that the login token is still valid
  // ---------------------------------------------------------------------------
  // This is wrapped in useCallback so it doesn't get recreated on every render,
  // which would cause the useEffect below to run in an infinite loop.
  const refreshUser = useCallback(async () => {
    const token = getToken();

    // If there's no token saved, the user is definitely not logged in
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Ask the server: "is this token still valid? who does it belong to?"
      // If the token is expired or fake, this will throw an error
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token is expired or the account was deleted — clear everything
      removeToken();
      removeStoredUser();
      setUser(null);
    } finally {
      // Whether it worked or not, we're done loading
      setIsLoading(false);
    }
  }, []); // Empty array means this function never changes after the first render

  // Run refreshUser once when the app first loads
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ---------------------------------------------------------------------------
  // login — send credentials to the server and save the result
  // ---------------------------------------------------------------------------
  const login = async (email: string, password: string) => {
    // authApi.login() calls the backend and saves the token in localStorage
    const response = await authApi.login(email, password);
    setUser(response.user);

    // Also call refreshUser() to get the very latest user data from the server.
    // This ensures the user object in the app is always up to date.
    await refreshUser();
    return response.user;
  };

  // ---------------------------------------------------------------------------
  // register — create a new account and save the result
  // ---------------------------------------------------------------------------
  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
  }) => {
    // authApi.register() calls the backend and saves the token in localStorage
    // Note: the backend always creates the account as 'student' — role is ignored
    const response = await authApi.register(data);
    setUser(response.user);
    return response.user;
  };

  // ---------------------------------------------------------------------------
  // logout — remove credentials and clear the user from the app
  // ---------------------------------------------------------------------------
  const logout = async () => {
    // Tell the server we're logging out
    // (For this app, the server doesn't need to do anything special for JWT tokens,
    // but we still call it — useful if a token blocklist is added later)
    await authApi.logout();
    // authApi.logout() already removed the token from localStorage
    setUser(null); // Update the app state so it re-renders to show the login page
  };

  // ---------------------------------------------------------------------------
  // Google OAuth — handles login with Google
  // ---------------------------------------------------------------------------
  const handleGoogleAuth = async (code: string) => {
    // When the user logs in with Google, Google gives us a short-lived "code".
    // We send that code to our backend, which exchanges it for the user's info.
    const res = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();

    // If the backend returned a user and access token, save them
    if (data && data.user && data.access_token) {
      setUser({ ...data.user, googleAccessToken: data.access_token });
    }
  };

  // After Google redirects the user back to the app, grab the code from the URL.
  // Google puts it in the URL like: /auth/google/callback?code=xxxxx
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && window.location.pathname === '/auth/google/callback') {
      handleGoogleAuth(code);
      // Clean the URL — remove the ?code=... part so it doesn't trigger again
      window.history.replaceState({}, document.title, '/');
    }
  }, []); // Only run once when the page loads

  // ---------------------------------------------------------------------------
  // Provide everything to child components
  // ---------------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,  // !!null = false, !!{...} = true
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

// =============================================================================
// useAuth — the hook components use to access login state
// =============================================================================
// Any component can call:
//   const { user, isAuthenticated, login, logout } = useAuth()
//
// If someone forgets to wrap their app with <AuthProvider>, this throws an error
// so they know exactly what went wrong.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
