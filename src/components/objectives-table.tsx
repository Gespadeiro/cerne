
import React, { useState } from "react";
import { Objective, KeyResult, Initiative } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { TableHeader } from "./tables/table-header";
import { ObjectiveRow } from "./tables/objective-row";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyResultForm } from "@/components/key-result-form";
import { InitiativeForm } from "@/components/initiative-form";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
}

export function ObjectivesTable({ objectives, onDelete, onEdit }: ObjectivesTableProps) {
  const navigate = useNavigate();
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);

  const navigateToKeyResult = (id: string) => {
    navigate(`/key-results/${id}`);
  };

  const navigateToInitiative = (id: string) => {
    navigate(`/initiatives/${id}`);
  };

  const editKeyResult = (keyResult: KeyResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKeyResult(keyResult);
    setIsKeyResultDialogOpen(true);
  };

  const editInitiative = (initiative: Initiative, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInitiative(initiative);
    setIsInitiativeDialogOpen(true);
  };

  const deleteKeyResult = async (keyResultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement key result deletion logic
  };

  const deleteInitiative = async (initiativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement initiative deletion logic
  };

  const handleKeyResultUpdate = async (data: any) => {
    // Here you would implement the API call to update the key result
    // After successful update, update the local state and close the dialog
    setIsKeyResultDialogOpen(false);
    setSelectedKeyResult(null);
    // Refresh data or update local state
  };

  const handleInitiativeUpdate = async (data: any) => {
    // Here you would implement the API call to update the initiative
    // After successful update, update the local state and close the dialog
    setIsInitiativeDialogOpen(false);
    setSelectedInitiative(null);
    // Refresh data or update local state
  };

  // Sort objectives by end date (closest first)
  const sortedObjectives = [...objectives].sort((a, b) => 
    a.endDate.getTime() - b.endDate.getTime()
  );

  // Find the objective that contains the selected key result
  const findObjectiveForKeyResult = () => {
    if (!selectedKeyResult) return null;
    return objectives.find(obj => obj.id === selectedKeyResult.objectiveId);
  };

  // Find all objectives for initiative form
  const getObjectivesForForm = () => {
    return objectives.map(obj => ({
      id: obj.id,
      name: obj.name,
      description: obj.description,
      startDate: obj.startDate,
      endDate: obj.endDate,
      checkInFrequency: obj.checkInFrequency,
      deleted: obj.deleted,
      initiatives: obj.initiatives,
      keyResults: obj.keyResults,
      userId: obj.userId,
    }));
  };

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <TableHeader showStatus={true} />
          <tbody className="bg-background divide-y divide-border">
            {sortedObjectives.map((objective) => (
              <ObjectiveRow
                key={objective.id}
                objective={objective}
                onEdit={() => onEdit(objective)}
                onDelete={() => onDelete(objective.id)}
                onKeyResultClick={navigateToKeyResult}
                onKeyResultEdit={(keyResult, e) => editKeyResult(keyResult, e)}
                onKeyResultDelete={deleteKeyResult}
                onInitiativeClick={navigateToInitiative}
                onInitiativeEdit={(initiative, e) => editInitiative(initiative, e)}
                onInitiativeDelete={deleteInitiative}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Result Edit Dialog */}
      <Dialog open={isKeyResultDialogOpen} onOpenChange={setIsKeyResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          {selectedKeyResult && (
            <KeyResultForm
              objectives={getObjectivesForForm()}
              keyResult={selectedKeyResult}
              onSubmit={handleKeyResultUpdate}
              submitButtonText="Update Key Result"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Initiative Edit Dialog */}
      <Dialog open={isInitiativeDialogOpen} onOpenChange={setIsInitiativeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>
          {selectedInitiative && (
            <InitiativeForm
              objectives={getObjectivesForForm()}
              initiative={selectedInitiative}
              onSubmit={handleInitiativeUpdate}
              submitButtonText="Update Initiative"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
