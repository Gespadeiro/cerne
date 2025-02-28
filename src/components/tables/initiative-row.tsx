
import React from "react";
import { Initiative } from "@/lib/types";
import { format } from "date-fns";
import { TableActionButtons } from "./table-action-buttons";
import { Badge } from "@/components/ui/badge";

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
      <td className="px-6 py-4 text-sm" style={{ paddingLeft: `${indentLevel * 4 + 24}px` }}>
        {initiative.name}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {initiative.progress !== undefined ? `${initiative.progress}%` : "-"}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {initiative.confidenceLevel !== undefined ? `${initiative.confidenceLevel}%` : "-"}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {initiative.keyResultId ? "Linked" : "None"}
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        <Badge variant={initiative.completed ? "success" : "secondary"}>
          {initiative.completed ? "Completed" : "In Progress"}
        </Badge>
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
  );
}
