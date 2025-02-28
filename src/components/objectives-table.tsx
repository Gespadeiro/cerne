import React from "react";
import { Objective } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { TableHeader } from "./tables/table-header";
import { ObjectiveRow } from "./tables/objective-row";

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

  // Sort objectives by end date (closest first)
  const sortedObjectives = [...objectives].sort((a, b) => 
    a.endDate.getTime() - b.endDate.getTime()
  );

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full divide-y divide-border">
        <TableHeader />
        <tbody className="bg-background divide-y divide-border">
          {sortedObjectives.map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              onEdit={() => onEdit(objective)}
              onDelete={() => onDelete(objective.id)}
              onKeyResultClick={navigateToKeyResult}
              onKeyResultEdit={editKeyResult}
              onKeyResultDelete={deleteKeyResult}
              onInitiativeClick={navigateToInitiative}
              onInitiativeEdit={editInitiative}
              onInitiativeDelete={deleteInitiative}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
