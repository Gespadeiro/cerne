
import React from "react";
import { KeyResult, Initiative } from "@/lib/types";
import { format } from "date-fns";
import { InitiativeRow } from "./initiative-row";
import { calculateProgress } from "./progress-utils";
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
        <td className="px-6 py-4 text-sm text-muted-foreground">
          -
        </td>
        <TableActionButtons 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </tr>
      
      {/* Initiatives for this specific Key Result */}
      {initiatives.map((initiative) => (
        <InitiativeRow
          key={initiative.id}
          initiative={initiative}
          indentLevel={14}
          onClick={() => onInitiativeClick(initiative.id)}
          onEdit={(e) => onInitiativeEdit(initiative, e)}
          onDelete={(e) => onInitiativeDelete(initiative.id, e)}
        />
      ))}
    </>
  );
}
