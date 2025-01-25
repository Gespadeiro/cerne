import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ObjectiveCard } from "@/components/objective-card";
import { Objective } from "@/lib/types";
import { List, GitBranchPlus, Plus } from "lucide-react";

const Dashboard = () => {
  const [viewType, setViewType] = useState<"list" | "tree">("list");
  const [objectives, setObjectives] = useState<Objective[]>([]);

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, deleted: true } : obj
      )
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            onClick={() => setViewType("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button
            variant={viewType === "tree" ? "default" : "outline"}
            onClick={() => setViewType("tree")}
          >
            <GitBranchPlus className="mr-2 h-4 w-4" />
            Tree View
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Objective
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Initiative
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {objectives
          .filter((obj) => !obj.deleted)
          .map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onDelete={handleDeleteObjective}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;