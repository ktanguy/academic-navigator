import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Role = "student" | "facilitator" | "admin";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role
  // Admin can access everything
  if (user.role === "admin") {
    return <>{children}</>;
  }

  // Facilitator can access facilitator and student pages
  if (user.role === "facilitator" && (allowedRoles.includes("facilitator") || allowedRoles.includes("student"))) {
    return <>{children}</>;
  }

  // Student can only access student pages
  if (user.role === "student" && allowedRoles.includes("student")) {
    return <>{children}</>;
  }

  // Redirect to appropriate dashboard if role not allowed
  if (user.role === "facilitator") {
    return <Navigate to="/facilitator" replace />;
  }
  
  return <Navigate to="/student" replace />;
};

export default ProtectedRoute;
