
import React from "react";
import { KeyResult, Initiative } from "@/lib/types";
import { format } from "date-fns";
import { InitiativeRow } from "./initiative-row";
import { TableActionButtons } from "./table-action-buttons";

interface KeyResultRowProps {
  keyResult: KeyResult;
  initiatives: Initiative[];
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onInitiativeClick: (id: string) => void;
  onInitiativeEdit: (initiative: Initiative, e: React.MouseEvent) => void;
  onInitiativeDelete: (id: string, e: React.MouseEvent) => void;
}

export function KeyResultRow({ 
  keyResult, 
  initiatives, 
  onClick, 
  onEdit, 
  onDelete,
  onInitiativeClick,
  onInitiativeEdit,
  onInitiativeDelete
}: KeyResultRowProps) {
  // Calculate progress
  const calculateProgress = () => {
    if (keyResult.startingValue === undefined || 
        keyResult.goalValue === undefined || 
        keyResult.currentValue === undefined) {
      return "-";
    }
    
    const range = keyResult.goalValue - keyResult.startingValue;
    if (range === 0) return "0%";
    
    const progress = Math.min(
      100,
      Math.max(
        0,
        ((keyResult.currentValue - keyResult.startingValue) / range) * 100
      )
    );
    
    return `${Math.round(progress)}%`;
  };

  return (
    <>
      {/* Key Result Row */}
      <tr 
        className="hover:bg-muted/50 cursor-pointer"
        onClick={onClick}
      >
        <td className="px-6 py-4 text-sm pl-10">
          {keyResult.name}
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {calculateProgress()}
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {keyResult.confidenceLevel !== undefined ? `${keyResult.confidenceLevel}%` : "-"}
        </td>
        <td className="px-6 py-4 text-sm text-muted-foreground">
          {keyResult.goalValue}
        </td>
        <TableActionButtons 
          onEdit={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
        />
      </tr>
      
      {/* Initiatives for this specific Key Result */}
      {initiatives.map((initiative) => (
        <InitiativeRow
          key={initiative.id}
          initiative={initiative}
          indentLevel={2}
          onClick={() => onInitiativeClick(initiative.id)}
          onEdit={(e) => onInitiativeEdit(initiative, e)}
          onDelete={(e) => onInitiativeDelete(initiative.id, e)}
        />
      ))}
    </>
  );
}
