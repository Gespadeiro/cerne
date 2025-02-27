
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
    // Delay the loading state slightly to ensure authentication is checked
    const timer = setTimeout(() => {
      if (user) {
        fetchDashboardData();
      } else {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Make sure user exists before proceeding
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const today = new Date().toISOString();
      
      console.log("Fetching objectives data...");
      
      // Fetch active objectives (not deleted, start date <= today, end date >= today)
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('id')
        .eq('deleted', false)
        .eq('user_id', user.id)
        .lte('start_date', today)
        .gte('end_date', today);

      if (objectivesError) {
        console.error("Error fetching objectives:", objectivesError);
        throw objectivesError;
      }
      
      console.log("Objectives data:", objectivesData);
      
      // Get objectives IDs for other queries
      const objectiveIds = objectivesData?.map(obj => obj.id) || [];
      setActiveObjectives(objectiveIds.length);
      
      // Fetch completed objectives
      const { data: completedData, error: completedError } = await supabase
        .from('objectives')
        .select('id')
        .eq('deleted', true)
        .eq('user_id', user.id);
        
      if (completedError) {
        console.error("Error fetching completed objectives:", completedError);
        throw completedError;
      }
      
      setCompletedObjectives(completedData?.length || 0);
      
      // Only proceed with related queries if we have objectives
      if (objectiveIds.length > 0) {
        console.log("Fetching key results and initiatives...");
        
        // Fetch active key results
        const { data: keyResultsData, error: keyResultsError } = await supabase
          .from('key_results')
          .select('id')
          .eq('deleted', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .in('objective_id', objectiveIds);
          
        if (keyResultsError) {
          console.error("Error fetching key results:", keyResultsError);
          throw keyResultsError;
        }
        
        setActiveKeyResults(keyResultsData?.length || 0);
        
        // Fetch active initiatives
        const { data: initiativesData, error: initiativesError } = await supabase
          .from('initiatives')
          .select('id')
          .eq('deleted', false)
          .eq('completed', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .in('objective_id', objectiveIds);
          
        if (initiativesError) {
          console.error("Error fetching initiatives:", initiativesError);
          throw initiativesError;
        }
        
        setActiveInitiatives(initiativesData?.length || 0);
        
        // Calculate today's check-ins
        const { data: objectivesWithFrequency, error: freqError } = await supabase
          .from('objectives')
          .select('id, check_in_frequency, start_date')
          .eq('deleted', false)
          .in('id', objectiveIds);
          
        if (freqError) {
          console.error("Error fetching objectives with frequency:", freqError);
          throw freqError;
        }
        
        let todayCheckInsCount = 0;
        
        objectivesWithFrequency?.forEach(obj => {
          const startDate = new Date(obj.start_date);
          const today = new Date();
          const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart % obj.check_in_frequency === 0) {
            todayCheckInsCount++;
          }
        });
        
        setTodayCheckIns(todayCheckInsCount);
      } else {
        // Reset related counts if there are no active objectives
        setActiveKeyResults(0);
        setActiveInitiatives(0);
        setTodayCheckIns(0);
      }
      
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      console.log("Finished fetching dashboard data");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Welcome to Cerne</h1>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-7 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {user ? (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-xl mb-4">Please sign in to see your dashboard</p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="px-8 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Sign In
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
