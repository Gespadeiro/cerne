
import React from "react";
import { Initiative } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";

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
      <td className="px-6 py-4 text-sm" style={{ paddingLeft: `${indentLevel * 4}px` }}>
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
      <td className="px-6 py-4 text-sm text-muted-foreground">
        <Badge variant={initiative.completed ? "success" : "secondary"}>
          {initiative.completed ? "Completed" : "In Progress"}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {initiative.confidenceLevel !== undefined ? `${initiative.confidenceLevel}/10` : "-"}
      </td>
      <td className="px-6 py-4 text-sm text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
