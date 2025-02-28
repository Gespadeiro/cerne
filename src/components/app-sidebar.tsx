
import { LayoutDashboard, Home, Archive, ClipboardCheck, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Check-in",
    url: "/check-in",
    icon: ClipboardCheck,
  },
  {
    title: "Archive",
    url: "/archive",
    icon: Archive,
  },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out from your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cerne</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="absolute bottom-20 left-4 right-4">
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="justify-start" onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>{user.email}</span>
            </Button>
            <Button variant="ghost" size="sm" className="justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <ThemeToggle />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
