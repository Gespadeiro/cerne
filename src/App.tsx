
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
import { AppSidebar } from "./components/app-sidebar";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <SidebarProvider>
          <div className="flex">
            <AppSidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/garbage" element={<Garbage />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/initiatives/:id" element={<InitiativeDetails />} />
                <Route path="/key-results/:id" element={<KeyResultDetails />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
