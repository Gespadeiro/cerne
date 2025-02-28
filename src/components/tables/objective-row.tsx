
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Check, Circle, ExternalLink, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Objective } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InitiativeRow from "./initiative-row";
import KeyResultRow from "./key-result-row";
import TableHeader from "./table-header";
import TableActionButtons from "./table-action-buttons";
import { AddSuggestionsButton } from "../ai-suggestions/add-suggestions-button";

interface ObjectiveRowProps {
  objective: Objective;
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
  onRefresh?: () => void;
}

export default function ObjectiveRow({ objective, onDelete, onEdit, onRefresh }: ObjectiveRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate progress
  const calculateProgress = () => {
    if (!objective.keyResults || objective.keyResults.length === 0) {
      return 0;
    }

    let totalProgress = 0;
    let countWithProgress = 0;

    for (const kr of objective.keyResults) {
      if (kr.startingValue !== undefined && kr.goalValue !== undefined && kr.currentValue !== undefined) {
        const range = kr.goalValue - kr.startingValue;
        if (range !== 0) {
          const progress = Math.min(
            100,
            Math.max(
              0,
              ((kr.currentValue - kr.startingValue) / range) * 100
            )
          );
          totalProgress += progress;
          countWithProgress++;
        }
      }
    }

    return countWithProgress > 0 ? totalProgress / countWithProgress : 0;
  };

  // Format progress
  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`;
  };

  // Calculate confidence
  const calculateConfidence = () => {
    if (!objective.keyResults || objective.keyResults.length === 0) {
      return null;
    }

    let totalConfidence = 0;
    let countWithConfidence = 0;

    for (const kr of objective.keyResults) {
      if (kr.confidenceLevel !== undefined) {
        totalConfidence += kr.confidenceLevel;
        countWithConfidence++;
      }
    }

    return countWithConfidence > 0 ? totalConfidence / countWithConfidence : null;
  };

  // Format confidence
  const formatConfidence = (confidence: number | null) => {
    if (confidence === null) return "-";
    return `${Math.round(confidence)}%`;
  };

  // Format dates
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleSuggestionsAdded = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <tr className="hover:bg-muted/30">
        <td className="p-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ArrowUpDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </Button>
            <span className="font-medium">{objective.name}</span>
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center">
            <div className="bg-gray-200 dark:bg-gray-700 w-full h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm">{formatProgress(calculateProgress())}</span>
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center">
            {calculateConfidence() !== null ? (
              <>
                {calculateConfidence()! >= 70 ? (
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                ) : calculateConfidence()! >= 40 ? (
                  <Circle className="h-4 w-4 text-yellow-500 mr-2" />
                ) : (
                  <Circle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>{formatConfidence(calculateConfidence())}</span>
              </>
            ) : (
              <span>-</span>
            )}
          </div>
        </td>
        <td className="p-3 text-sm">{formatDate(objective.startDate)}</td>
        <td className="p-3 text-sm">{formatDate(objective.endDate)}</td>
        <td className="p-3">
          <div className="flex justify-end items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(objective)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsConfirmDialogOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <>
          <tr>
            <td colSpan={6} className="p-0 border-b-0">
              <div className="p-4 bg-muted/20">
                <div className="mb-5">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {objective.description || "No description provided."}
                  </p>
                </div>

                {/* Key Results Section */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Key Results</h3>
                    <div className="flex gap-2">
                      <AddSuggestionsButton 
                        objective={objective} 
                        type="keyResults" 
                        onSuggestionsAdded={handleSuggestionsAdded} 
                      />
                      <Button variant="outline" size="sm" onClick={() => navigate(`/keyresults/create?objectiveId=${objective.id}`)}>
                        Add Key Result
                      </Button>
                    </div>
                  </div>

                  {objective.keyResults && objective.keyResults.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <TableHeader
                          columns={[
                            "Name",
                            "Progress",
                            "Confidence",
                            "Target",
                            "Actions",
                          ]}
                        />
                        <tbody>
                          {objective.keyResults.map((keyResult) => (
                            <KeyResultRow
                              key={keyResult.id}
                              keyResult={keyResult}
                              onView={() => navigate(`/keyresults/${keyResult.id}`)}
                              onEdit={() => navigate(`/keyresults/${keyResult.id}/edit`)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-card">
                      <p className="text-muted-foreground mb-4">No key results added yet</p>
                      <TableActionButtons
                        onAdd={() => navigate(`/keyresults/create?objectiveId=${objective.id}`)}
                        onSuggest={() => {/* Handle suggestion */}}
                        addLabel="Add Key Result"
                        suggestLabel="Get Suggestions"
                      />
                    </div>
                  )}
                </div>

                {/* Initiatives Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Initiatives</h3>
                    <div className="flex gap-2">
                      <AddSuggestionsButton 
                        objective={objective} 
                        type="initiatives" 
                        onSuggestionsAdded={handleSuggestionsAdded} 
                      />
                      <Button variant="outline" size="sm" onClick={() => navigate(`/initiatives/create?objectiveId=${objective.id}`)}>
                        Add Initiative
                      </Button>
                    </div>
                  </div>

                  {objective.initiatives && objective.initiatives.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <TableHeader
                          columns={[
                            "Name",
                            "Progress",
                            "Confidence",
                            "Key Result",
                            "Status",
                            "Actions",
                          ]}
                        />
                        <tbody>
                          {objective.initiatives.map((initiative) => (
                            <InitiativeRow
                              key={initiative.id}
                              initiative={initiative}
                              keyResults={objective.keyResults || []}
                              onView={() => navigate(`/initiatives/${initiative.id}`)}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-card">
                      <p className="text-muted-foreground mb-4">No initiatives added yet</p>
                      <TableActionButtons
                        onAdd={() => navigate(`/initiatives/create?objectiveId=${objective.id}`)}
                        onSuggest={() => {/* Handle suggestion */}}
                        addLabel="Add Initiative"
                        suggestLabel="Get Suggestions"
                      />
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this objective?</DialogTitle>
            <DialogDescription>
              This action will move the objective and all its associated key results and initiatives to the archive. You can recover them later from the archive.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(objective.id);
                setIsConfirmDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
