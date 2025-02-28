
import React from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, PlusCircleIcon, SparklesIcon } from "lucide-react";

interface TableActionButtonsProps {
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onAdd?: (e: React.MouseEvent) => void;
  onSuggest?: (e: React.MouseEvent) => void;
  addLabel?: string;
  suggestLabel?: string;
}

export function TableActionButtons({ 
  onEdit, 
  onDelete, 
  onAdd,
  onSuggest,
  addLabel = "Add",
  suggestLabel = "Suggest"
}: TableActionButtonsProps) {
  if (onAdd || onSuggest) {
    return (
      <div className="flex gap-2 justify-center">
        {onAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="flex gap-1 items-center"
          >
            <PlusCircleIcon className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
        {onSuggest && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSuggest}
            className="flex gap-1 items-center"
          >
            <SparklesIcon className="h-4 w-4" />
            {suggestLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <td className="px-6 py-4 text-sm text-right space-x-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </td>
  );
}
