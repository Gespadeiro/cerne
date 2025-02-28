
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
    { path: "/check-in", label: "Check In", icon: ClipboardCheck },
    { path: "/archive", label: "Archive", icon: Archive }
  ];

  if (!user) return null;

  return (
    <nav className="bg-card border-b p-2 sticky top-0 z-10 w-full">
      <div className="flex items-center justify-between container px-4">
        <div className="flex items-center space-x-2">
          <Link to="/home" className="text-xl font-bold flex items-center mr-4 text-cerne-blue hover:text-cerne-orange transition-colors">
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
      
      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto px-2 py-1 mt-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className="mx-1 flex-shrink-0">
            <Button 
              variant={isActive(item.path) ? "default" : "ghost"} 
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-1 px-2 ${isActive(item.path) ? "bg-cerne-blue hover:bg-cerne-blue/90 text-white" : ""}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
