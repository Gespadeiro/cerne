
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
              <TableHead className="w-[450px]">Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives
              .filter((objective) => !objective.deleted)
              .map((objective) => (
                <>
                  <TableRow key={`objective-${objective.id}`}>
                    <TableCell className="font-medium">{objective.name}</TableCell>
                    <TableCell>{formatDate(objective.startDate)}</TableCell>
                    <TableCell>{formatDate(objective.endDate)}</TableCell>
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
                  
                  {/* Key Results with indentation */}
                  {objective.keyResults
                    .filter((kr) => !kr.deleted)
                    .map((kr) => (
                      <TableRow 
                        key={`kr-${kr.id}`} 
                        className="bg-slate-50 dark:bg-slate-900/30"
                      >
                        <TableCell className="pl-10">
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-primary mr-2">KR:</span>
                            <Link
                              to={`/key-results/${kr.id}`}
                              className="text-primary hover:underline"
                            >
                              {kr.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(kr.startDate)}</TableCell>
                        <TableCell>{formatDate(kr.endDate)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}

                  {/* Initiatives with indentation */}
                  {objective.initiatives
                    .filter((initiative) => !initiative.deleted)
                    .map((initiative) => (
                      <TableRow 
                        key={`initiative-${initiative.id}`} 
                        className="bg-slate-100 dark:bg-slate-900/60"
                      >
                        <TableCell className="pl-10">
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mr-2">Initiative:</span>
                            <Link
                              to={`/initiatives/${initiative.id}`}
                              className="text-emerald-600 dark:text-emerald-500 hover:underline"
                            >
                              {initiative.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(initiative.startDate)}</TableCell>
                        <TableCell>{formatDate(initiative.endDate)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                </>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
