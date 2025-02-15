
import { useState } from "react";
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

const Dashboard = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, deleted: true } : obj))
    );
    toast({
      title: "Objective deleted",
      description: "The objective has been moved to the garbage",
    });
  };

  const onObjectiveSubmit = (data: any) => {
    const newObjective: Objective = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      checkInFrequency: data.checkInFrequency,
      deleted: false,
      initiatives: [],
      keyResults: [],
    };

    setObjectives((prev) => [...prev, newObjective]);
    setIsObjectiveDialogOpen(false);
    toast({
      title: "Objective created",
      description: "Your new objective has been created successfully",
    });
  };

  const onInitiativeSubmit = (data: any) => {
    const newInitiative = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      objectiveId: data.objectiveId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      deleted: false,
      completed: false,
    };

    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === data.objectiveId
          ? { ...obj, initiatives: [...obj.initiatives, newInitiative] }
          : obj
      )
    );
    setIsInitiativeDialogOpen(false);
    toast({
      title: "Initiative created",
      description: "Your new initiative has been created successfully",
    });
  };

  const onKeyResultSubmit = (data: any) => {
    const newKeyResult = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      objectiveId: data.objectiveId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      startingValue: data.startingValue,
      goalValue: data.goalValue,
      deleted: false,
    };

    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === data.objectiveId
          ? { ...obj, keyResults: [...obj.keyResults, newKeyResult] }
          : obj
      )
    );
    setIsKeyResultDialogOpen(false);
    toast({
      title: "Key Result created",
      description: "Your new key result has been created successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
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
      <div className="mt-6">
        <ObjectivesTable
          objectives={objectives}
          onDelete={handleDeleteObjective}
        />
      </div>
    </div>
  );
};

export default Dashboard;
