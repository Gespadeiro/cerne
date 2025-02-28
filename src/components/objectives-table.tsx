
import { Objective, KeyResult, Initiative } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
}

export function ObjectivesTable({ objectives, onDelete, onEdit }: ObjectivesTableProps) {
  const navigate = useNavigate();
  
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="w-full rounded-md border">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Starting Value</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Goal Value</TableHead>
              <TableHead>Progress</TableHead>
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
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/objectives/${objective.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Key Results with indentation */}
                  {objective.keyResults
                    .filter((kr) => !kr.deleted)
                    .map((kr) => (
                      <>
                        <TableRow 
                          key={`kr-${kr.id}`} 
                          className="bg-slate-50 dark:bg-slate-900/30"
                        >
                          <TableCell className="pl-10">
                            <Link
                              to={`/key-results/${kr.id}`}
                              className="text-primary hover:underline"
                            >
                              {kr.name}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(kr.startDate)}</TableCell>
                          <TableCell>{formatDate(kr.endDate)}</TableCell>
                          <TableCell>{kr.startingValue}</TableCell>
                          <TableCell>{kr.currentValue || '-'}</TableCell>
                          <TableCell>{kr.goalValue}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/key-results/${kr.id}/edit`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(kr.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/key-results/${kr.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Initiatives linked to this Key Result */}
                        {objective.initiatives
                          .filter((initiative) => !initiative.deleted && initiative.keyResultId === kr.id)
                          .map((initiative) => (
                            <TableRow 
                              key={`initiative-${initiative.id}`} 
                              className="bg-slate-100 dark:bg-slate-900/60"
                            >
                              <TableCell className="pl-16">
                                <Link
                                  to={`/initiatives/${initiative.id}`}
                                  className="text-emerald-600 dark:text-emerald-500 hover:underline"
                                >
                                  {initiative.name}
                                </Link>
                              </TableCell>
                              <TableCell>{formatDate(initiative.startDate)}</TableCell>
                              <TableCell>{formatDate(initiative.endDate)}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>
                                {initiative.progress !== undefined ? (
                                  <div className="flex items-center gap-2">
                                    <Progress value={initiative.progress} />
                                    <span className="text-xs">{initiative.progress}%</span>
                                  </div>
                                ) : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/initiatives/${initiative.id}/edit`)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(initiative.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/initiatives/${initiative.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    ))}

                  {/* Initiatives without Key Result association */}
                  {objective.initiatives
                    .filter((initiative) => !initiative.deleted && !initiative.keyResultId)
                    .map((initiative) => (
                      <TableRow 
                        key={`initiative-${initiative.id}`} 
                        className="bg-slate-100 dark:bg-slate-900/60"
                      >
                        <TableCell className="pl-10">
                          <Link
                            to={`/initiatives/${initiative.id}`}
                            className="text-emerald-600 dark:text-emerald-500 hover:underline"
                          >
                            {initiative.name}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(initiative.startDate)}</TableCell>
                        <TableCell>{formatDate(initiative.endDate)}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          {initiative.progress !== undefined ? (
                            <div className="flex items-center gap-2">
                              <Progress value={initiative.progress} />
                              <span className="text-xs">{initiative.progress}%</span>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/initiatives/${initiative.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(initiative.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/initiatives/${initiative.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
