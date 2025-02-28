
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/Dashboard";
import Archive from "@/pages/Archive";
import CheckIn from "@/pages/CheckIn";
import InitiativeDetails from "@/pages/InitiativeDetails";
import KeyResultDetails from "@/pages/KeyResultDetails";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";
import { AppNavbar } from "./components/app-navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <AppNavbar />
              <main className="flex-1 w-full">
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
                    path="/archive" 
                    element={
                      <ProtectedRoute>
                        <Archive />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkin" 
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
                    path="/initiatives/:id/edit" 
                    element={
                      <ProtectedRoute>
                        <InitiativeDetails />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/keyresults/:id" 
                    element={
                      <ProtectedRoute>
                        <KeyResultDetails />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/keyresults/:id/edit" 
                    element={
                      <ProtectedRoute>
                        <KeyResultDetails />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
