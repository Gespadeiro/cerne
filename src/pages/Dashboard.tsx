import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, addDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Objective,
  KeyResult,
  Initiative,
} from "@/lib/types";
import { ObjectiveForm } from "@/components/objective-form";
import { KeyResultForm } from "@/components/key-result-form";
import { InitiativeForm } from "@/components/initiative-form";
import { NoObjectivesMessage } from "@/components/check-in/NoObjectivesMessage";
import { ObjectiveCard } from "@/components/objective-card";
import { supabase } from "@/integrations/supabase/client";
import { AISuggestionsButton } from "@/components/ai-suggestions/ai-suggestions-button";
import { v4 as uuidv4 } from "uuid";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [objectiveId, setObjectiveId] = useState<string | null>(null);
  const [keyResultId, setKeyResultId] = useState<string | null>(null);
  const [objectiveToDelete, setObjectiveToDelete] = useState<string | null>(null);
  const [keyResultToDelete, setKeyResultToDelete] = useState<string | null>(null);
  const [initiativeToDelete, setInitiativeToDelete] = useState<string | null>(null);
  const [objectiveToEdit, setObjectiveToEdit] = useState<string | null>(null);
  const [keyResultToEdit, setKeyResultToEdit] = useState<string | null>(null);
  const [initiativeToEdit, setInitiativeToEdit] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchObjectives();
    fetchKeyResults();
    fetchInitiatives();
  }, []);

  const fetchObjectives = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        throw error;
      }

      const objectivesWithDateObjects = data.map((objective) => ({
        ...objective,
        startDate: new Date(objective.start_date),
        endDate: new Date(objective.end_date),
      }));

      setObjectives(objectivesWithDateObjects);
    } catch (error) {
      console.error("Error fetching objectives:", error);
      toast({
        title: "Error fetching objectives",
        description: "Failed to load objectives. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKeyResults = async () => {
    try {
      const { data, error } = await supabase
        .from("key_results")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        throw error;
      }

      const keyResultsWithDateObjects = data.map((keyResult) => ({
        ...keyResult,
        startDate: new Date(keyResult.start_date),
        endDate: new Date(keyResult.end_date),
      }));

      setKeyResults(keyResultsWithDateObjects);
    } catch (error) {
      console.error("Error fetching key results:", error);
      toast({
        title: "Error fetching key results",
        description: "Failed to load key results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchInitiatives = async () => {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        throw error;
      }

      const initiativesWithDateObjects = data.map((initiative) => ({
        ...initiative,
        startDate: new Date(initiative.start_date),
        endDate: new Date(initiative.end_date),
      }));

      setInitiatives(initiativesWithDateObjects);
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      toast({
        title: "Error fetching initiatives",
        description: "Failed to load initiatives. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateObjective = async (
    values: Omit<Objective, "id" | "deleted" | "initiatives" | "keyResults">
  ) => {
    try {
      const { data, error } = await supabase.from("objectives").insert([
        {
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
          check_in_frequency: values.checkInFrequency,
          deleted: false,
        },
      ]);

      if (error) {
        throw error;
      }

      fetchObjectives();
      setIsObjectiveDialogOpen(false);
      toast({
        title: "Objective created",
        description: "Your objective has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating objective:", error);
      toast({
        title: "Error creating objective",
        description: "There was an error creating the objective.",
        variant: "destructive",
      });
    }
  };

  const handleCreateKeyResult = async (
    values: Omit<KeyResult, "id" | "deleted" | "currentValue" | "confidenceLevel">
  ) => {
    if (!objectiveId) {
      toast({
        title: "Error creating key result",
        description: "Objective ID is required to create a key result.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from("key_results").insert([
        {
          objective_id: objectiveId,
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
          starting_value: values.startingValue,
          goal_value: values.goalValue,
          deleted: false,
        },
      ]);

      if (error) {
        throw error;
      }

      fetchKeyResults();
      fetchObjectives();
      setIsKeyResultDialogOpen(false);
      toast({
        title: "Key result created",
        description: "Your key result has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating key result:", error);
      toast({
        title: "Error creating key result",
        description: "There was an error creating the key result.",
        variant: "destructive",
      });
    }
  };

  const handleCreateInitiative = async (
    values: Omit<Initiative, "id" | "deleted" | "completed" | "progress" | "confidenceLevel">
  ) => {
    try {
      const { data, error } = await supabase.from("initiatives").insert([
        {
          objective_id: values.objectiveId,
          key_result_id: values.keyResultId,
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
          completed: false,
          deleted: false,
        },
      ]);

      if (error) {
        throw error;
      }

      fetchInitiatives();
      fetchObjectives();
      setIsInitiativeDialogOpen(false);
      toast({
        title: "Initiative created",
        description: "Your initiative has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating initiative:", error);
      toast({
        title: "Error creating initiative",
        description: "There was an error creating the initiative.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("objectives")
        .update({ deleted: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchObjectives();
      setObjectiveToDelete(null);
      toast({
        title: "Objective deleted",
        description: "The objective has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting objective:", error);
      toast({
        title: "Error deleting objective",
        description: "There was an error deleting the objective.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKeyResult = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("key_results")
        .update({ deleted: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchKeyResults();
      fetchObjectives();
      setKeyResultToDelete(null);
      toast({
        title: "Key result deleted",
        description: "The key result has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting key result:", error);
      toast({
        title: "Error deleting key result",
        description: "There was an error deleting the key result.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInitiative = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .update({ deleted: true })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchInitiatives();
      fetchObjectives();
      setInitiativeToDelete(null);
      toast({
        title: "Initiative deleted",
        description: "The initiative has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting initiative:", error);
      toast({
        title: "Error deleting initiative",
        description: "There was an error deleting the initiative.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateObjective = async (
    id: string,
    values: Omit<Objective, "id" | "deleted" | "initiatives" | "keyResults">
  ) => {
    try {
      const { data, error } = await supabase
        .from("objectives")
        .update({
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
          check_in_frequency: values.checkInFrequency,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchObjectives();
      setObjectiveToEdit(null);
      toast({
        title: "Objective updated",
        description: "The objective has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating objective:", error);
      toast({
        title: "Error updating objective",
        description: "There was an error updating the objective.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateKeyResult = async (
    id: string,
    values: Omit<KeyResult, "id" | "deleted" | "currentValue" | "confidenceLevel">
  ) => {
    try {
      const { data, error } = await supabase
        .from("key_results")
        .update({
          objective_id: values.objectiveId,
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
          starting_value: values.startingValue,
          goal_value: values.goalValue,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchKeyResults();
      fetchObjectives();
      setKeyResultToEdit(null);
      toast({
        title: "Key result updated",
        description: "The key result has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating key result:", error);
      toast({
        title: "Error updating key result",
        description: "There was an error updating the key result.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInitiative = async (
    id: string,
    values: Omit<Initiative, "id" | "deleted" | "completed" | "progress" | "confidenceLevel">
  ) => {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .update({
          objective_id: values.objectiveId,
          key_result_id: values.keyResultId,
          name: values.name,
          description: values.description,
          start_date: new Date(values.startDate).toISOString(),
          end_date: new Date(values.endDate).toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      fetchInitiatives();
      fetchObjectives();
      setInitiativeToEdit(null);
      toast({
        title: "Initiative updated",
        description: "The initiative has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating initiative:", error);
      toast({
        title: "Error updating initiative",
        description: "There was an error updating the initiative.",
        variant: "destructive",
      });
    }
  };

  const handleToggleInitiativeStatus = async (initiative: Initiative) => {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .update({ completed: !initiative.completed })
        .eq("id", initiative.id);

      if (error) {
        throw error;
      }

      fetchInitiatives();
      toast({
        title: "Initiative status updated",
        description: `Initiative marked as ${
          !initiative.completed ? "completed" : "incomplete"
        }.`,
      });
    } catch (error) {
      console.error("Error updating initiative status:", error);
      toast({
        title: "Error updating initiative status",
        description: "There was an error updating the initiative status.",
        variant: "destructive",
      });
    }
  };

  const activeObjectives = objectives.filter((objective) => !objective.deleted);
  const allKeyResults = keyResults.filter((keyResult) => !keyResult.deleted);
  const allInitiatives = initiatives.filter((initiative) => !initiative.deleted);

  const upcomingCheckIns = activeObjectives.filter((objective) => {
    const nextCheckInDate = addDays(
      new Date(objective.startDate),
      objective.checkInFrequency
    );
    const now = new Date();
    return nextCheckInDate >= now;
  });

  const findObjectiveById = (id: string) => {
    return objectives.find((objective) => objective.id === id);
  };

  const findKeyResultById = (id: string) => {
    return keyResults.find((keyResult) => keyResult.id === id);
  };

  const handleAddKeyResultClick = (objectiveId: string) => {
    setObjectiveId(objectiveId);
    setIsKeyResultDialogOpen(true);
  };

  const handleAddInitiativeClick = (objectiveId: string) => {
    setObjectiveId(objectiveId);
    setIsInitiativeDialogOpen(true);
  };

  // Add these new functions to handle bulk adding of key results and initiatives
  const handleAddKeyResults = async (keyResults: any[]) => {
    try {
      // Create multiple key results in Supabase
      for (const keyResult of keyResults) {
        const { data, error } = await supabase
          .from("key_results")
          .insert([
            {
              id: keyResult.id,
              objective_id: keyResult.objectiveId,
              name: keyResult.name,
              description: keyResult.description,
              start_date: new Date(keyResult.startDate).toISOString(),
              end_date: new Date(keyResult.endDate).toISOString(),
              starting_value: keyResult.startingValue,
              goal_value: keyResult.goalValue,
              deleted: false,
            },
          ]);

        if (error) throw error;
      }

      // Refresh objectives to get updated data
      fetchObjectives();
    } catch (error) {
      console.error("Error adding key results:", error);
      toast({
        title: "Error adding key results",
        description: "There was an error adding the key results.",
        variant: "destructive",
      });
    }
  };

  const handleAddInitiatives = async (initiatives: any[]) => {
    try {
      // Create multiple initiatives in Supabase
      for (const initiative of initiatives) {
        const { data, error } = await supabase
          .from("initiatives")
          .insert([
            {
              id: initiative.id,
              objective_id: initiative.objectiveId,
              name: initiative.name,
              description: initiative.description,
              start_date: new Date(initiative.startDate).toISOString(),
              end_date: new Date(initiative.endDate).toISOString(),
              completed: false,
              deleted: false,
            },
          ]);

        if (error) throw error;
      }

      // Refresh objectives to get updated data
      fetchObjectives();
    } catch (error) {
      console.error("Error adding initiatives:", error);
      toast({
        title: "Error adding initiatives",
        description: "There was an error adding the initiatives.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <Button onClick={() => setIsObjectiveDialogOpen(true)}>
            New Objective
          </Button>
        </div>
      </header>

      {objectives.length === 0 && !isLoading ? (
        <NoObjectivesMessage />
      ) : (
        <div className="space-y-8">
          {/* Active Objectives */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Active Objectives</h2>
            <div className="grid gap-6">
              {activeObjectives.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  onAddKeyResult={() => handleAddKeyResultClick(objective.id)}
                  onAddInitiative={() => handleAddInitiativeClick(objective.id)}
                  onAddKeyResults={handleAddKeyResults}
                  onAddInitiatives={handleAddInitiatives}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Check-ins */}
          {upcomingCheckIns.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Check-ins</h2>
              <div className="grid gap-4">
                {upcomingCheckIns.map((objective) => (
                  <Link
                    to="/check-in"
                    key={objective.id}
                    className="block border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{objective.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        Check-in every {objective.checkInFrequency}{" "}
                        {objective.checkInFrequency === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tables Section */}
          <section className="space-y-8">
            <div>
              <TableHeader
                title="Key Results"
                buttonText="New Key Result"
                onClick={() => setIsKeyResultDialogOpen(true)}
              />
              <div className="rounded-md border bg-background shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allKeyResults.map((keyResult) => (
                      <KeyResultRow
                        key={keyResult.id}
                        keyResult={keyResult}
                        objective={findObjectiveById(keyResult.objectiveId)}
                        onDelete={() => handleDeleteKeyResult(keyResult.id)}
                        onEdit={() => handleEditKeyResult(keyResult.id)}
                      />
                    ))}
                    {allKeyResults.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No key results found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <TableHeader
                title="Initiatives"
                buttonText="New Initiative"
                onClick={() => setIsInitiativeDialogOpen(true)}
              />
              <div className="rounded-md border bg-background shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Key Result</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allInitiatives.map((initiative) => (
                      <InitiativeRow
                        key={initiative.id}
                        initiative={initiative}
                        objective={findObjectiveById(initiative.objectiveId)}
                        keyResult={
                          initiative.keyResultId
                            ? findKeyResultById(initiative.keyResultId)
                            : undefined
                        }
                        onDelete={() => handleDeleteInitiative(initiative.id)}
                        onEdit={() => handleEditInitiative(initiative.id)}
                        onToggleStatus={() =>
                          handleToggleInitiativeStatus(initiative)
                        }
                      />
                    ))}
                    {allInitiatives.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No initiatives found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Objective Dialog */}
      <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Objective</DialogTitle>
            <DialogDescription>
              Add a new objective to track your goals.
            </DialogDescription>
          </DialogHeader>
          <ObjectiveForm onSubmit={handleCreateObjective} />
        </DialogContent>
      </Dialog>

      {/* Key Result Dialog */}
      <Dialog open={isKeyResultDialogOpen} onOpenChange={setIsKeyResultDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Key Result</DialogTitle>
            <DialogDescription>
              Add a new key result to measure your objective.
            </DialogDescription>
          </DialogHeader>
          <KeyResultForm
            objectives={objectives}
            onSubmit={handleCreateKeyResult}
          />
        </DialogContent>
      </Dialog>

      {/* Initiative Dialog */}
      <Dialog open={isInitiativeDialogOpen} onOpenChange={setIsInitiativeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Initiative</DialogTitle>
            <DialogDescription>
              Add a new initiative to achieve your key result.
            </DialogDescription>
          </DialogHeader>
          <InitiativeForm
            objectives={objectives}
            onSubmit={handleCreateInitiative}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Objective Confirmation Dialog */}
      <Dialog open={objectiveToDelete !== null} onOpenChange={setObjectiveToDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Objective</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this objective? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setObjectiveToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteObjective(objectiveToDelete!)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Key Result Confirmation Dialog */}
      <Dialog open={keyResultToDelete !== null} onOpenChange={setKeyResultToDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Key Result</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this key result? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setKeyResultToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteKeyResult(keyResultToDelete!)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Initiative Confirmation Dialog */}
      <Dialog open={initiativeToDelete !== null} onOpenChange={setInitiativeToDelete}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Initiative</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this initiative? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setInitiativeToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteInitiative(initiativeToDelete!)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Objective Dialog */}
      <Dialog open={objectiveToEdit !== null} onOpenChange={setObjectiveToEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
            <DialogDescription>
              Edit the details of your objective.
            </DialogDescription>
          </DialogHeader>
          {objectiveToEdit && (
            <ObjectiveForm
              objective={findObjectiveById(objectiveToEdit)}
              onSubmit={(values) => handleUpdateObjective(objectiveToEdit, values)}
              submitButtonText="Update Objective"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Key Result Dialog */}
      <Dialog open={keyResultToEdit !== null} onOpenChange={setKeyResultToEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
            <DialogDescription>
              Edit the details of your key result.
            </DialogDescription>
          </DialogHeader>
          {keyResultToEdit && (
            <KeyResultForm
              objectives={objectives}
              keyResult={findKeyResultById(keyResultToEdit)}
              onSubmit={(values) => handleUpdateKeyResult(keyResultToEdit, values)}
              submitButtonText="Update Key Result"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Initiative Dialog */}
      <Dialog open={initiativeToEdit !== null} onOpenChange={setInitiativeToEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
            <DialogDescription>
              Edit the details of your initiative.
            </DialogDescription>
          </DialogHeader>
          {initiativeToEdit && (
            <InitiativeForm
              objectives={objectives}
              initiative={findInitiativeById(initiativeToEdit)}
              onSubmit={(values) => handleUpdateInitiative(initiativeToEdit, values)}
              submitButtonText="Update Initiative"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function findInitiativeById(initiativeToEdit: string | null): Initiative | undefined {
    return initiatives.find((initiative) => initiative.id === initiativeToEdit);
  }

  function TableHeader({
    title,
    buttonText,
    onClick,
  }: {
    title: string;
    buttonText: string;
    onClick: () => void;
  }) {
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    );
  }

  function KeyResultRow({
    keyResult,
    objective,
    onDelete,
    onEdit,
  }: {
    keyResult: KeyResult;
    objective: Objective | undefined;
    onDelete: () => void;
    onEdit: () => void;
  }) {
    const progress =
      objective && keyResult
        ? Math.round(
            ((keyResult.startingValue - keyResult.goalValue) /
              (keyResult.startingValue - (keyResult.currentValue || keyResult.startingValue))) *
              100
          )
        : 0;

    return (
      <TableRow>
        <TableCell className="font-medium">{keyResult.name}</TableCell>
        <TableCell>{objective?.name}</TableCell>
        <TableCell>{format(new Date(keyResult.startDate), "PPP")}</TableCell>
        <TableCell>{format(new Date(keyResult.endDate), "PPP")}</TableCell>
        <TableCell>{progress}%</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  function InitiativeRow({
    initiative,
    objective,
    keyResult,
    onDelete,
    onEdit,
    onToggleStatus,
  }: {
    initiative: Initiative;
    objective: Objective | undefined;
    keyResult: KeyResult | undefined;
    onDelete: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
  }) {
    return (
      <TableRow>
        <TableCell className="font-medium">{initiative.name}</TableCell>
        <TableCell>{objective?.name}</TableCell>
        <TableCell>{keyResult?.name || "N/A"}</TableCell>
        <TableCell>{format(new Date(initiative.startDate), "PPP")}</TableCell>
        <TableCell>{format(new Date(initiative.endDate), "PPP")}</TableCell>
        <TableCell>
          <Button variant="outline" size="sm" onClick={onToggleStatus}>
            {initiative.completed ? "Completed" : "Incomplete"}
          </Button>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
