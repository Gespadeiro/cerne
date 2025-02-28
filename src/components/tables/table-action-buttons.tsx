
import React from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";

interface TableActionButtonsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function TableActionButtons({ onEdit, onDelete }: TableActionButtonsProps) {
  return (
    <td className="px-6 py-4 text-sm text-right space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </td>
  );
}
