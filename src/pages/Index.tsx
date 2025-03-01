
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats for snapshots
  const [activeObjectives, setActiveObjectives] = useState(0);
  const [activeKeyResults, setActiveKeyResults] = useState(0);
  const [activeInitiatives, setActiveInitiatives] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState(0);
  const [todayCheckIns, setTodayCheckIns] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString();
      
      // Fetch active objectives (not deleted, start date <= today, end date >= today)
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('id')
        .eq('deleted', false)
        .lte('start_date', today)
        .gte('end_date', today);

      if (objectivesError) throw objectivesError;
      
      // Get objectives IDs for other queries
      const objectiveIds = objectivesData.map(obj => obj.id);
      setActiveObjectives(objectiveIds.length);
      
      // Fetch completed objectives
      const { data: completedData, error: completedError } = await supabase
        .from('objectives')
        .select('id')
        .eq('deleted', true);
        
      if (completedError) throw completedError;
      setCompletedObjectives(completedData.length);
      
      if (objectiveIds.length > 0) {
        // Fetch active key results
        const { data: keyResultsData, error: keyResultsError } = await supabase
          .from('key_results')
          .select('id')
          .eq('deleted', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .in('objective_id', objectiveIds);
          
        if (keyResultsError) throw keyResultsError;
        setActiveKeyResults(keyResultsData.length);
        
        // Fetch active initiatives
        const { data: initiativesData, error: initiativesError } = await supabase
          .from('initiatives')
          .select('id')
          .eq('deleted', false)
          .eq('completed', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .in('objective_id', objectiveIds);
          
        if (initiativesError) throw initiativesError;
        setActiveInitiatives(initiativesData.length);
      }
      
      // Calculate today's check-ins
      if (objectiveIds.length > 0) {
        const { data: objectivesWithFrequency, error: freqError } = await supabase
          .from('objectives')
          .select('id, check_in_frequency, start_date')
          .eq('deleted', false)
          .in('id', objectiveIds);
          
        if (freqError) throw freqError;
        
        let todayCheckInsCount = 0;
        
        objectivesWithFrequency.forEach(obj => {
          const startDate = new Date(obj.start_date);
          const today = new Date();
          const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart % obj.check_in_frequency === 0) {
            todayCheckInsCount++;
          }
        });
        
        setTodayCheckIns(todayCheckInsCount);
      }
      
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-start mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">Welcome to Cerne</h1>
        <p className="text-muted-foreground w-full">
          Your personal OKR management system. Track your objectives, key results, and initiatives to achieve your goals.
        </p>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-7 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-9 w-12 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card 
            className="cursor-pointer" 
            onClick={() => navigate("/check-in")}
          >
            <CardHeader>
              <CardTitle>Today's Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{todayCheckIns}</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer" 
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <CardTitle>Active OKR's</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeObjectives}</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer" 
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <CardTitle>Active Key Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeKeyResults}</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer" 
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <CardTitle>Active Initiatives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeInitiatives}</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer" 
            onClick={() => navigate("/archive")}
          >
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedObjectives}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
