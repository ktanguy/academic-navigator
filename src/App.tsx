import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentPortal from "./pages/StudentPortal";
import FacilitatorDashboard from "./pages/FacilitatorDashboard";
import AdminPanel from "./pages/AdminPanel";
import Auth from "./pages/Auth";
import Directory from "./pages/Directory";
import Booking from "./pages/Booking";
import HelpDesk from "./pages/HelpDesk";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="academic-navigator-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/helpdesk" element={<HelpDesk />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              
              {/* Student routes - accessible by students, facilitators, and admins */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={["student", "facilitator", "admin"]}>
                  <StudentPortal />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={
                <ProtectedRoute allowedRoles={["student", "facilitator", "admin"]}>
                  <Booking />
                </ProtectedRoute>
              } />
              
              {/* Facilitator routes - accessible by facilitators and admins */}
              <Route path="/facilitator" element={
                <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                  <FacilitatorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes - accessible only by admins */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
