
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

  const onInitiativeSubmit = async (data: any) => {
    try {
      const { data: newInitiative, error } = await supabase
        .from('initiatives')
        .insert({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
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
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
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
        </div>
      </div>
      <div className="mt-6 max-w-7xl mx-auto">
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
          <ObjectivesTable
            objectives={objectives}
            onDelete={handleDeleteObjective}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
