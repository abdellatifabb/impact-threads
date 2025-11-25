import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import DonorDashboard from "./pages/donor/DonorDashboard";
import FamilyDetail from "./pages/donor/FamilyDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDonors from "./pages/admin/AdminDonors";
import AdminFamilies from "./pages/admin/AdminFamilies";
import AdminCaseManagers from "./pages/admin/AdminCaseManagers";
import AdminAssignments from "./pages/admin/AdminAssignments";
import CaseManagerDashboard from "./pages/case-manager/CaseManagerDashboard";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/family/:familyId"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <FamilyDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="donors" element={<AdminDonors />} />
                  <Route path="families" element={<AdminFamilies />} />
                  <Route path="case-managers" element={<AdminCaseManagers />} />
                  <Route path="assignments" element={<AdminAssignments />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          
          {/* Case Manager Routes */}
          <Route
            path="/case-manager/*"
            element={
              <ProtectedRoute allowedRoles={['case_manager']}>
                <CaseManagerDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Family Routes */}
          <Route
            path="/family"
            element={
              <ProtectedRoute allowedRoles={['family']}>
                <FamilyDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
