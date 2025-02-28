
import { Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
}

export function ObjectivesTable({ objectives, onDelete, onEdit }: ObjectivesTableProps) {
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="w-full rounded-md border">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[250px]">Key Results</TableHead>
              <TableHead className="w-[250px]">Initiatives</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives
              .filter((objective) => !objective.deleted)
              .map((objective) => (
                <TableRow key={objective.id}>
                  <TableCell className="font-medium">{objective.name}</TableCell>
                  <TableCell>{formatDate(objective.startDate)}</TableCell>
                  <TableCell>{formatDate(objective.endDate)}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {objective.keyResults
                        .filter((kr) => !kr.deleted)
                        .map((kr) => (
                          <li key={kr.id}>
                            <Link
                              to={`/key-results/${kr.id}`}
                              className="text-primary hover:underline"
                            >
                              {kr.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {objective.initiatives
                        .filter((initiative) => !initiative.deleted)
                        .map((initiative) => (
                          <li key={initiative.id}>
                            <Link
                              to={`/initiatives/${initiative.id}`}
                              className="text-primary hover:underline"
                            >
                              {initiative.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(objective)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(objective.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
