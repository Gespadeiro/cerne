import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Initiative, Objective } from "@/lib/types";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { InitiativeDetails } from "./initiative-details";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
}

export function ObjectivesTable({ objectives, onDelete }: ObjectivesTableProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);

  const calculateProgress = (objective: Objective) => {
    if (objective.initiatives.length === 0) return 0;
    const completedInitiatives = objective.initiatives.filter(i => i.completed).length;
    return Math.round((completedInitiatives / objective.initiatives.length) * 100);
  };

  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setIsInitiativeDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Initiatives</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objectives
            .filter((obj) => !obj.deleted)
            .map((objective) => (
              <TableRow key={objective.id}>
                <TableCell className="font-medium">{objective.name}</TableCell>
                <TableCell>{objective.description}</TableCell>
                <TableCell>
                  {format(objective.startDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(objective.endDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {objective.initiatives.map((initiative) => (
                      <li 
                        key={initiative.id} 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => handleInitiativeClick(initiative)}
                      >
                        {initiative.name}
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="w-[60px]">
                    <Progress value={calculateProgress(objective)} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(objective.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <InitiativeDetails
        initiative={selectedInitiative}
        open={isInitiativeDialogOpen}
        onOpenChange={setIsInitiativeDialogOpen}
      />
    </>
  );
}