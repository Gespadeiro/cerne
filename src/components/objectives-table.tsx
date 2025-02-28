
import React from "react";
import { Objective, KeyResult, Initiative } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
}

export function ObjectivesTable({ objectives, onDelete, onEdit }: ObjectivesTableProps) {
  const navigate = useNavigate();

  const navigateToKeyResult = (id: string) => {
    navigate(`/key-results/${id}`);
  };

  const navigateToInitiative = (id: string) => {
    navigate(`/initiatives/${id}`);
  };

  const editKeyResult = (keyResultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/key-results/${keyResultId}/edit`);
  };

  const editInitiative = (initiativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/initiatives/${initiativeId}/edit`);
  };

  const deleteKeyResult = async (keyResultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement key result deletion logic
  };

  const deleteInitiative = async (initiativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement initiative deletion logic
  };

  const calculateProgress = (kr: KeyResult) => {
    if (kr.currentValue === undefined) return "Not started";
    
    const total = kr.goalValue - kr.startingValue;
    const current = kr.currentValue - kr.startingValue;
    const percentage = (current / total) * 100;
    
    return Math.round(percentage) + "%";
  };

  // Sort objectives by end date (closest first)
  const sortedObjectives = [...objectives].sort((a, b) => 
    a.endDate.getTime() - b.endDate.getTime()
  );

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Timeline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Starting Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Goal Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Current Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {sortedObjectives.map((objective) => (
            <React.Fragment key={objective.id}>
              {/* Objective Row */}
              <tr className="bg-muted/30 cursor-pointer">
                <td className="px-6 py-4 text-sm font-medium">
                  {objective.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(objective.startDate, "MMM d, yyyy")} - {format(objective.endDate, "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  -
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  -
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  -
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  -
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(objective)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(objective.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
              
              {/* Key Results Rows */}
              {objective.keyResults
                .filter(kr => !kr.deleted)
                .map((keyResult) => {
                  // Get initiatives for this key result
                  const keyResultInitiatives = objective.initiatives
                    .filter(init => !init.deleted && init.keyResultId === keyResult.id);
                  
                  return (
                    <React.Fragment key={keyResult.id}>
                      {/* Key Result Row */}
                      <tr 
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigateToKeyResult(keyResult.id)}
                      >
                        <td className="px-6 py-4 text-sm pl-10">
                          {keyResult.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {format(keyResult.startDate, "MMM d, yyyy")} - {format(keyResult.endDate, "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {keyResult.startingValue}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {keyResult.goalValue}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {keyResult.currentValue !== undefined ? keyResult.currentValue : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {calculateProgress(keyResult)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => editKeyResult(keyResult.id, e)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => deleteKeyResult(keyResult.id, e)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Initiatives for this specific Key Result */}
                      {keyResultInitiatives.map((initiative) => (
                        <tr 
                          key={initiative.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => navigateToInitiative(initiative.id)}
                        >
                          <td className="px-6 py-4 text-sm pl-14">
                            {initiative.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {format(initiative.startDate, "MMM d, yyyy")} - {format(initiative.endDate, "MMM d, yyyy")}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            -
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            -
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            -
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {initiative.progress !== undefined ? `${initiative.progress}%` : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => editInitiative(initiative.id, e)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => deleteInitiative(initiative.id, e)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              
              {/* Initiatives without a key result (directly under objective) */}
              {objective.initiatives
                .filter(init => !init.deleted && !init.keyResultId)
                .map((initiative) => (
                  <tr 
                    key={initiative.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigateToInitiative(initiative.id)}
                  >
                    <td className="px-6 py-4 text-sm pl-10">
                      {initiative.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(initiative.startDate, "MMM d, yyyy")} - {format(initiative.endDate, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      -
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      -
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      -
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {initiative.progress !== undefined ? `${initiative.progress}%` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => editInitiative(initiative.id, e)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => deleteInitiative(initiative.id, e)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
