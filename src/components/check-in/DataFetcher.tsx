
import { useState, useEffect } from "react";
import type { Objective, CheckIn, KeyResultCheckIn, InitiativeCheckIn } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LastCheckInValues {
  [keyResultId: string]: number;
}

interface LastInitiativeValues {
  [initiativeId: string]: {
    status: string;
    percentage: number;
  };
}

interface DataFetcherProps {
  children: (data: {
    objectives: Objective[];
    isLoading: boolean;
    lastKeyResultValues: LastCheckInValues;
    lastInitiativeValues: LastInitiativeValues;
  }) => React.ReactNode;
}

export const DataFetcher: React.FC<DataFetcherProps> = ({ children }) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastKeyResultValues, setLastKeyResultValues] = useState<LastCheckInValues>({});
  const [lastInitiativeValues, setLastInitiativeValues] = useState<LastInitiativeValues>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchObjectives();
    }
  }, [user]);

  const fetchObjectives = async () => {
    try {
      setIsLoading(true);

      // Fetch objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (objectivesError) throw objectivesError;

      // Fetch initiatives for these objectives
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('deleted', false)
        .in('objective_id', objectivesData.map(obj => obj.id));

      if (initiativesError) throw initiativesError;

      // Fetch key results for these objectives
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('deleted', false)
        .in('objective_id', objectivesData.map(obj => obj.id));

      if (keyResultsError) throw keyResultsError;

      // Map the data to our frontend types
      const mappedObjectives = objectivesData.map(obj => {
        const objectiveInitiatives = initiativesData
          .filter(init => init.objective_id === obj.id)
          .map(init => ({
            id: init.id,
            name: init.name,
            description: init.description,
            objectiveId: init.objective_id,
            startDate: new Date(init.start_date),
            endDate: new Date(init.end_date),
            deleted: init.deleted,
            completed: init.completed
          }));

        const objectiveKeyResults = keyResultsData
          .filter(kr => kr.objective_id === obj.id)
          .map(kr => ({
            id: kr.id,
            name: kr.name,
            description: kr.description,
            objectiveId: kr.objective_id,
            startDate: new Date(kr.start_date),
            endDate: new Date(kr.end_date),
            startingValue: Number(kr.starting_value),
            goalValue: Number(kr.goal_value),
            deleted: kr.deleted
          }));

        return {
          id: obj.id,
          name: obj.name,
          description: obj.description,
          startDate: new Date(obj.start_date),
          endDate: new Date(obj.end_date),
          checkInFrequency: obj.check_in_frequency,
          deleted: obj.deleted,
          initiatives: objectiveInitiatives,
          keyResults: objectiveKeyResults,
          userId: obj.user_id
        };
      });

      setObjectives(mappedObjectives);
      
      // Fetch the latest check-in values for all key results
      if (keyResultsData.length > 0) {
        fetchLatestKeyResultValues(keyResultsData.map(kr => kr.id));
      }

      // Fetch the latest check-in values for all initiatives
      if (initiativesData.length > 0) {
        fetchLatestInitiativeValues(initiativesData.map(init => init.id));
      }
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred while fetching your objectives.",
        variant: "destructive",
      });
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestKeyResultValues = async (keyResultIds: string[]) => {
    try {
      // For each key result, get the latest check-in
      const { data, error } = await supabase
        .from('key_result_check_ins')
        .select('*')
        .in('key_result_id', keyResultIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create a map of key result ID to its latest value
      const latestValues: LastCheckInValues = {};
      
      // Group by key_result_id and take the most recent
      data?.forEach(checkIn => {
        if (!latestValues[checkIn.key_result_id]) {
          latestValues[checkIn.key_result_id] = Number(checkIn.current_value);
        }
      });

      setLastKeyResultValues(latestValues);
    } catch (error: any) {
      console.error("Error fetching latest key result values:", error);
    }
  };

  const fetchLatestInitiativeValues = async (initiativeIds: string[]) => {
    try {
      // For each initiative, get the latest check-in
      const { data, error } = await supabase
        .from('initiative_check_ins')
        .select('*')
        .in('initiative_id', initiativeIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Create a map of initiative ID to its latest value
      const latestValues: LastInitiativeValues = {};
      
      // Group by initiative_id and take the most recent
      data?.forEach(checkIn => {
        if (!latestValues[checkIn.initiative_id]) {
          latestValues[checkIn.initiative_id] = {
            status: checkIn.progress_status,
            percentage: Number(checkIn.progress_percentage || 0)
          };
        }
      });

      setLastInitiativeValues(latestValues);
    } catch (error: any) {
      console.error("Error fetching latest initiative values:", error);
    }
  };

  return <>{children({ objectives, isLoading, lastKeyResultValues, lastInitiativeValues })}</>;
};
