
import React from "react";
import { Objective, KeyResult, Initiative } from "@/lib/types";
import { format } from "date-fns";
import { KeyResultRow } from "./key-result-row";
import { InitiativeRow } from "./initiative-row";
import { TableActionButtons } from "./table-action-buttons";

interface ObjectiveRowProps {
  objective: Objective;
  onEdit: () => void;
  onDelete: () => void;
  onKeyResultClick: (id: string) => void;
  onKeyResultEdit: (keyResult: KeyResult, e: React.MouseEvent) => void;
  onKeyResultDelete: (id: string, e: React.MouseEvent) => void;
  onInitiativeClick: (id: string) => void;
  onInitiativeEdit: (initiative: Initiative, e: React.MouseEvent) => void;
  onInitiativeDelete: (id: string, e: React.MouseEvent) => void;
}

export function ObjectiveRow({ 
  objective,
  onEdit,
  onDelete,
  onKeyResultClick,
  onKeyResultEdit,
  onKeyResultDelete,
  onInitiativeClick,
  onInitiativeEdit,
  onInitiativeDelete
}: ObjectiveRowProps) {
  // Filter out deleted key results
  const keyResults = objective.keyResults.filter(kr => !kr.deleted);
  
  // Initiatives directly under the objective (not linked to any key result)
  const directInitiatives = objective.initiatives
    .filter(init => !init.deleted && !init.keyResultId);

  return (
    <>
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
        <td className="px-6 py-4 text-sm text-muted-foreground">
          -
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          -
        </td>
        <TableActionButtons 
          onEdit={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </tr>
      
      {/* Key Results Rows */}
      {keyResults.map((keyResult) => {
        // Get initiatives for this key result
        const keyResultInitiatives = objective.initiatives
          .filter(init => !init.deleted && init.keyResultId === keyResult.id);
        
        return (
          <KeyResultRow
            key={keyResult.id}
            keyResult={keyResult}
            initiatives={keyResultInitiatives}
            onClick={() => onKeyResultClick(keyResult.id)}
            onEdit={(e) => onKeyResultEdit(keyResult, e)}
            onDelete={(e) => onKeyResultDelete(keyResult.id, e)}
            onInitiativeClick={onInitiativeClick}
            onInitiativeEdit={onInitiativeEdit}
            onInitiativeDelete={onInitiativeDelete}
          />
        );
      })}
      
      {/* Initiatives without a key result (directly under objective) */}
      {directInitiatives.map((initiative) => (
        <InitiativeRow
          key={initiative.id}
          initiative={initiative}
          indentLevel={4}
          onClick={() => onInitiativeClick(initiative.id)}
          onEdit={(e) => onInitiativeEdit(initiative, e)}
          onDelete={(e) => onInitiativeDelete(initiative.id, e)}
        />
      ))}
    </>
  );
}
