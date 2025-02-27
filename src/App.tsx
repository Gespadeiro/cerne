
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/Dashboard";
import Archive from "@/pages/Archive";
import Garbage from "@/pages/Garbage";
import CheckIn from "@/pages/CheckIn";
import InitiativeDetails from "@/pages/InitiativeDetails";
import KeyResultDetails from "@/pages/KeyResultDetails";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { AppSidebar } from "./components/app-sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <SidebarProvider>
            <div className="flex">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route 
                    path="/home" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/archive" 
                    element={
                      <ProtectedRoute>
                        <Archive />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/garbage" 
                    element={
                      <ProtectedRoute>
                        <Garbage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/check-in" 
                    element={
                      <ProtectedRoute>
                        <CheckIn />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/initiatives/:id" 
                    element={
                      <ProtectedRoute>
                        <InitiativeDetails />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/key-results/:id" 
                    element={
                      <ProtectedRoute>
                        <KeyResultDetails />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
