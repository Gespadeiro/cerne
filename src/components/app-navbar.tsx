
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Home, LayoutDashboard, CheckSquare, Archive as ArchiveIcon, Bot } from "lucide-react";
import clsx from 'clsx';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const mobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavLink = (to: string, label: string, icon: React.ReactNode) => (
    <Link
      to={to}
      className={clsx(
        "flex items-center px-4 py-2 rounded-md transition-colors hover:bg-muted",
        isActive(to) && "bg-muted font-medium"
      )}
      onClick={closeMenu}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Link>
  );

  const renderNavbar = () => (
    <div className="flex flex-col md:flex-row md:items-center w-full">
      <div className="flex flex-col md:flex-row md:items-center flex-1 gap-1 md:gap-2">
        {renderNavLink("/", "Home", <Home size={16} />)}
        {user && (
          <>
            {renderNavLink("/dashboard", "Dashboard", <LayoutDashboard size={16} />)}
            {renderNavLink("/archive", "Archive", <ArchiveIcon size={16} />)}
            {renderNavLink("/checkin", "Check-In", <CheckSquare size={16} />)}
            {renderNavLink("/chat", "AI Assistant", <Bot size={16} />)}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <ThemeToggle />
        {user ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              signOut();
              closeMenu();
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link to="/auth" onClick={closeMenu}>Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="hidden md:inline-block">OKR Manager</span>
          </Link>
        </div>
        
        {mobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 flex flex-col gap-2">
                {renderNavbar()}
              </div>
            )}
          </>
        ) : (
          renderNavbar()
        )}
      </div>
    </header>
  );
}
