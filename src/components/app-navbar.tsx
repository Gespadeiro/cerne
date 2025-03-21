
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  LayoutDashboard, 
  Archive, 
  ClipboardCheck,
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppNavbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/check-in", label: "Check-In", icon: ClipboardCheck },
    { path: "/archive", label: "Archive", icon: Archive }
  ];

  if (!user) return null;

  return (
    <nav className="bg-card border-b p-2 sticky top-0 z-10 w-full">
      <div className="flex items-center justify-between container px-4">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold flex items-center mr-4 gradient-text hover:opacity-90 transition-opacity">
            Cerne
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"} 
                  size="sm"
                  className={`flex items-center gap-1 ${isActive(item.path) ? "bg-cerne-blue hover:bg-cerne-blue/90 text-white" : ""}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button size="sm" variant="outline" onClick={signOut} className="flex items-center gap-1 border-cerne-orange hover:bg-cerne-orange hover:text-white">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block">Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation - Centered */}
      <div className="md:hidden flex justify-center w-full pt-1 mt-1">
        <div className="flex items-center justify-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-shrink-0">
              <Button 
                variant={isActive(item.path) ? "default" : "ghost"} 
                size="icon"
                className={`w-10 h-10 ${isActive(item.path) ? "bg-cerne-blue hover:bg-cerne-blue/90 text-white" : ""}`}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

