
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Archive, 
  Trash2, 
  LogOut, 
  CheckCircle, 
  MessageSquare 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const navigate = useNavigate();
  const { signOut, isLoading } = useAuth();

  return (
    <Sidebar className="border-r-0 md:border-r p-2">
      <div className="flex flex-col gap-2 h-full">
        <div className="flex-1 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/checkin')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Check-In
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/archive')}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/garbage')}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Garbage
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start mt-auto"
          onClick={signOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </Sidebar>
  );
}
