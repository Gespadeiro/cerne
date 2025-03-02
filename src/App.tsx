
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/Dashboard";
import Archive from "@/pages/Archive";
import CheckIn from "@/pages/CheckIn";
import InitiativeDetails from "@/pages/InitiativeDetails";
import KeyResultDetails from "@/pages/KeyResultDetails";
import KeyResultEdit from "@/pages/KeyResultEdit";
import InitiativeEdit from "@/pages/InitiativeEdit";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Landing from "@/pages/Landing";
import { AppNavbar } from "./components/app-navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <AppNavbar />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<Landing />} />
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
                  path="/initiatives/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <InitiativeEdit />
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
                <Route 
                  path="/key-results/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <KeyResultEdit />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
