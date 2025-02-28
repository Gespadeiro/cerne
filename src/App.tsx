
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Garbage from "@/pages/Garbage";
import Archive from "@/pages/Archive";
import InitiativeDetails from "@/pages/InitiativeDetails";
import InitiativeEdit from "@/pages/InitiativeEdit";
import KeyResultDetails from "@/pages/KeyResultDetails";
import KeyResultEdit from "@/pages/KeyResultEdit";
import CheckIn from "@/pages/CheckIn";
import Chat from "@/pages/Chat";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/garbage" element={
                <ProtectedRoute>
                  <Garbage />
                </ProtectedRoute>
              } />

              <Route path="/archive" element={
                <ProtectedRoute>
                  <Archive />
                </ProtectedRoute>
              } />

              <Route path="/initiatives/:id" element={
                <ProtectedRoute>
                  <InitiativeDetails />
                </ProtectedRoute>
              } />

              <Route path="/initiatives/:id/edit" element={
                <ProtectedRoute>
                  <InitiativeEdit />
                </ProtectedRoute>
              } />

              <Route path="/keyresults/:id" element={
                <ProtectedRoute>
                  <KeyResultDetails />
                </ProtectedRoute>
              } />

              <Route path="/keyresults/:id/edit" element={
                <ProtectedRoute>
                  <KeyResultEdit />
                </ProtectedRoute>
              } />

              <Route path="/checkin" element={
                <ProtectedRoute>
                  <CheckIn />
                </ProtectedRoute>
              } />

              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
