import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Objective } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ObjectiveForm } from "@/components/objective-form";
import { InitiativeForm } from "@/components/initiative-form";
import { KeyResultForm } from "@/components/key-result-form";
import { ObjectivesTable } from "@/components/objectives-table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash } from "lucide-react";

const Archive = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
        .eq('deleted', true)
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

      // Fetch latest key result check-ins for current values and confidence
      const keyResultIds = keyResultsData.map(kr => kr.id);
      let keyResultCurrentValues = {};
      let keyResultConfidenceLevels = {};
      
      if (keyResultIds.length > 0) {
        // Get the latest check-in for each key result
        for (const keyResultId of keyResultIds) {
          const { data: checkInsData, error: checkInsError } = await supabase
            .from('key_result_check_ins')
            .select('*')
            .eq('key_result_id', keyResultId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!checkInsError && checkInsData && checkInsData.length > 0) {
            keyResultCurrentValues[keyResultId] = checkInsData[0].current_value;
            keyResultConfidenceLevels[keyResultId] = checkInsData[0].confidence_level;
          }
        }
      }

      // Fetch latest initiative check-ins for progress values and confidence
      const initiativeIds = initiativesData.map(init => init.id);
      let initiativeProgress = {};
      let initiativeConfidenceLevels = {};
      
      if (initiativeIds.length > 0) {
        // Get the latest check-in for each initiative
        for (const initiativeId of initiativeIds) {
          const { data: initiativeCheckInsData, error: initiativeCheckInsError } = await supabase
            .from('initiative_check_ins')
            .select('*')
            .eq('initiative_id', initiativeId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!initiativeCheckInsError && initiativeCheckInsData && initiativeCheckInsData.length > 0) {
            initiativeProgress[initiativeId] = initiativeCheckInsData[0].progress_percentage;
            initiativeConfidenceLevels[initiativeId] = initiativeCheckInsData[0].confidence_level;
          }
        }
      }

      // Map the data to our frontend types
      const mappedObjectives = objectivesData.map(obj => {
        const objectiveInitiatives = initiativesData
          .filter(init => init.objective_id === obj.id)
          .map(init => ({
            id: init.id,
            name: init.name,
            description: init.description,
            objectiveId: init.objective_id,
            keyResultId: init.key_result_id || undefined,
            startDate: new Date(init.start_date),
            endDate: new Date(init.end_date),
            deleted: init.deleted,
            completed: init.completed,
            progress: initiativeProgress[init.id] !== undefined ? initiativeProgress[init.id] : undefined,
            confidenceLevel: initiativeConfidenceLevels[init.id] !== undefined ? initiativeConfidenceLevels[init.id] : undefined
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
            currentValue: keyResultCurrentValues[kr.id] !== undefined ? keyResultCurrentValues[kr.id] : undefined,
            confidenceLevel: keyResultConfidenceLevels[kr.id] !== undefined ? keyResultConfidenceLevels[kr.id] : undefined,
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

  const handleRestoreObjective = async (id: string) => {
    try {
      const { error } = await supabase
        .from('objectives')
        .update({ deleted: false })
        .eq('id', id);

      if (error) throw error;

      setObjectives((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, deleted: false } : obj))
      );

      toast({
        title: "Objective restored",
        description: "The objective has been restored successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error restoring objective",
        description: error.message || "An error occurred while restoring the objective.",
        variant: "destructive",
      });
      console.error("Error restoring objective:", error);
    }
  };

  const handleDeletePermanently = async (id: string) => {
    try {
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setObjectives((prev) => prev.filter((obj) => obj.id !== id));

      toast({
        title: "Objective deleted permanently",
        description: "The objective has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting objective permanently",
        description: error.message || "An error occurred while deleting the objective permanently.",
        variant: "destructive",
      });
      console.error("Error deleting objective permanently:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading archived objectives...</div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-start mb-6">
          <h1 className="text-4xl font-bold gradient-text mb-4">Archive</h1>
          <p className="text-muted-foreground w-full">
            Review and manage your archived objectives, key results, and initiatives. Restore items or delete them permanently.
          </p>
        </div>
        <div className="mt-6 w-full">
          {objectives.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-lg">
              <h2 className="text-2xl font-semibold mb-2">No archived objectives</h2>
              <p className="text-muted-foreground mb-6">
                Archived objectives will appear here.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Description</th>
                    <th className="py-3 px-6">Start Date</th>
                    <th className="py-3 px-6">End Date</th>
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {objectives.map((objective) => (
                    <tr key={objective.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="py-4 px-6">{objective.name}</td>
                      <td className="py-4 px-6">{objective.description}</td>
                      <td className="py-4 px-6">{objective.startDate.toLocaleDateString()}</td>
                      <td className="py-4 px-6">{objective.endDate.toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <Button size="sm" onClick={() => handleRestoreObjective(objective.id)}>
                          Restore
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePermanently(objective.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
