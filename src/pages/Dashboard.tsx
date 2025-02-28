
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const Dashboard = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isEditObjectiveDialogOpen, setIsEditObjectiveDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
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

  const handleDeleteObjective = async (id: string) => {
    try {
      const { error } = await supabase
        .from('objectives')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      setObjectives((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, deleted: true } : obj))
      );

      toast({
        title: "Objective deleted",
        description: "The objective has been moved to the garbage",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting objective",
        description: error.message || "An error occurred while deleting the objective.",
        variant: "destructive",
      });
      console.error("Error deleting objective:", error);
    }
  };

  const handleEditObjective = (objective: Objective) => {
    setSelectedObjective(objective);
    setIsEditObjectiveDialogOpen(true);
  };

  const onObjectiveSubmit = async (data: any) => {
    if (!user) return;

    try {
      const { data: newObjective, error } = await supabase
        .from('objectives')
        .insert({
          name: data.name,
          description: data.description,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          check_in_frequency: data.checkInFrequency,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newObjectiveFormatted: Objective = {
        id: newObjective.id,
        name: newObjective.name,
        description: newObjective.description,
        startDate: new Date(newObjective.start_date),
        endDate: new Date(newObjective.end_date),
        checkInFrequency: newObjective.check_in_frequency,
        deleted: false,
        initiatives: [],
        keyResults: [],
        userId: newObjective.user_id
      };

      setObjectives((prev) => [...prev, newObjectiveFormatted]);
      setIsObjectiveDialogOpen(false);
      
      toast({
        title: "Objective created",
        description: "Your new objective has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error creating objective",
        description: error.message || "An error occurred while creating the objective.",
        variant: "destructive",
      });
      console.error("Error creating objective:", error);
    }
  };

  const onObjectiveEdit = async (data: any) => {
    if (!selectedObjective) return;

    try {
      const { error } = await supabase
        .from('objectives')
        .update({
          name: data.name,
          description: data.description,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          check_in_frequency: data.checkInFrequency,
        })
        .eq('id', selectedObjective.id);

      if (error) throw error;

      // Update the local state
      setObjectives(prevObjectives =>
        prevObjectives.map(obj =>
          obj.id === selectedObjective.id
            ? {
                ...obj,
                name: data.name,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                checkInFrequency: data.checkInFrequency,
              }
            : obj
        )
      );

      setIsEditObjectiveDialogOpen(false);
      setSelectedObjective(null);
      
      toast({
        title: "Objective updated",
        description: "Your objective has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating objective",
        description: error.message || "An error occurred while updating the objective.",
        variant: "destructive",
      });
      console.error("Error updating objective:", error);
    }
  };

  const onInitiativeSubmit = async (data: any) => {
    try {
      const { data: newInitiative, error } = await supabase
        .from('initiatives')
        .insert({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          key_result_id: data.keyResultId || null,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newInitiativeFormatted = {
        id: newInitiative.id,
        name: newInitiative.name,
        description: newInitiative.description,
        objectiveId: newInitiative.objective_id,
        keyResultId: newInitiative.key_result_id || undefined,
        startDate: new Date(newInitiative.start_date),
        endDate: new Date(newInitiative.end_date),
        deleted: false,
        completed: false,
      };

      setObjectives((prev) =>
        prev.map((obj) =>
          obj.id === data.objectiveId
            ? { ...obj, initiatives: [...obj.initiatives, newInitiativeFormatted] }
            : obj
        )
      );
      
      setIsInitiativeDialogOpen(false);
      
      toast({
        title: "Initiative created",
        description: "Your new initiative has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error creating initiative",
        description: error.message || "An error occurred while creating the initiative.",
        variant: "destructive",
      });
      console.error("Error creating initiative:", error);
    }
  };

  const onKeyResultSubmit = async (data: any) => {
    try {
      const { data: newKeyResult, error } = await supabase
        .from('key_results')
        .insert({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          starting_value: data.startingValue,
          goal_value: data.goalValue,
        })
        .select()
        .single();

      if (error) throw error;

      const newKeyResultFormatted = {
        id: newKeyResult.id,
        name: newKeyResult.name,
        description: newKeyResult.description,
        objectiveId: newKeyResult.objective_id,
        startDate: new Date(newKeyResult.start_date),
        endDate: new Date(newKeyResult.end_date),
        startingValue: Number(newKeyResult.starting_value),
        goalValue: Number(newKeyResult.goal_value),
        deleted: false,
      };

      setObjectives((prev) =>
        prev.map((obj) =>
          obj.id === data.objectiveId
            ? { ...obj, keyResults: [...obj.keyResults, newKeyResultFormatted] }
            : obj
        )
      );
      
      setIsKeyResultDialogOpen(false);
      
      toast({
        title: "Key Result created",
        description: "Your new key result has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error creating key result",
        description: error.message || "An error occurred while creating the key result.",
        variant: "destructive",
      });
      console.error("Error creating key result:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your objectives...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8 w-full">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Objective</DialogTitle>
                <DialogDescription>
                  Create a new objective to track your goals
                </DialogDescription>
              </DialogHeader>
              <ObjectiveForm onSubmit={onObjectiveSubmit} />
            </DialogContent>
          </Dialog>

          <Dialog open={isKeyResultDialogOpen} onOpenChange={setIsKeyResultDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Key Result
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Key Result</DialogTitle>
                <DialogDescription>
                  Create a new key result for an existing objective
                </DialogDescription>
              </DialogHeader>
              <KeyResultForm 
                objectives={objectives}
                onSubmit={onKeyResultSubmit}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isInitiativeDialogOpen} onOpenChange={setIsInitiativeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Initiative
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Initiative</DialogTitle>
                <DialogDescription>
                  Create a new initiative for an existing objective
                </DialogDescription>
              </DialogHeader>
              <InitiativeForm 
                objectives={objectives}
                onSubmit={onInitiativeSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-6 w-full">
        {objectives.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">No objectives yet</h2>
            <p className="text-muted-foreground mb-6">Create your first objective to get started</p>
            <Button onClick={() => setIsObjectiveDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Objective
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <ObjectivesTable
              objectives={objectives}
              onDelete={handleDeleteObjective}
              onEdit={handleEditObjective}
            />
          </div>
        )}
      </div>

      {/* Edit Objective Dialog */}
      <Dialog open={isEditObjectiveDialogOpen} onOpenChange={setIsEditObjectiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
            <DialogDescription>
              Update your objective details
            </DialogDescription>
          </DialogHeader>
          {selectedObjective && (
            <ObjectiveForm 
              onSubmit={onObjectiveEdit} 
              objective={selectedObjective}
              submitButtonText="Update Objective"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
