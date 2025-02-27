
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Archive from "@/pages/Archive";
import CheckIn from "@/pages/CheckIn";
import InitiativeDetails from "@/pages/InitiativeDetails";
import KeyResultDetails from "@/pages/KeyResultDetails";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Index from "@/pages/Index";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <SidebarProvider>
          <div className="flex min-h-svh">
            <AppSidebar />
            <main className="flex-1 min-h-svh overflow-x-hidden bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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
                  path="/archive"
                  element={
                    <ProtectedRoute>
                      <Archive />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/initiative/:id"
                  element={
                    <ProtectedRoute>
                      <InitiativeDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/key-result/:id"
                  element={
                    <ProtectedRoute>
                      <KeyResultDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
