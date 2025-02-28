
import React from "react";
import { Initiative } from "@/lib/types";
import { format } from "date-fns";
import { TableActionButtons } from "./table-action-buttons";

interface InitiativeRowProps {
  initiative: Initiative;
  indentLevel: number;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function InitiativeRow({ 
  initiative, 
  indentLevel, 
  onClick, 
  onEdit, 
  onDelete 
}: InitiativeRowProps) {
  return (
    <tr 
      className="hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <td className={`px-6 py-4 text-sm pl-${indentLevel}`}>
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
      <TableActionButtons onEdit={onEdit} onDelete={onDelete} />
    </tr>
  );
}
