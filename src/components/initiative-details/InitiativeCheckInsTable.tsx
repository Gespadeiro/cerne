
import React from "react";
import { format } from "date-fns";
import { InitiativeCheckIn } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface InitiativeCheckInsTableProps {
  checkIns: InitiativeCheckIn[];
}

export const InitiativeCheckInsTable: React.FC<InitiativeCheckInsTableProps> = ({ checkIns }) => {
  const getProgressStatusLabel = (status: string) => {
    switch(status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const getProgressStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'not-started': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'success';
      case 'blocked': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in History</CardTitle>
      </CardHeader>
      <CardContent>
        {checkIns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.map((checkIn) => (
                <TableRow key={checkIn.id}>
                  <TableCell>{format(checkIn.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={getProgressStatusBadgeVariant(checkIn.progressStatus)}>
                      {getProgressStatusLabel(checkIn.progressStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{checkIn.progress !== undefined ? `${checkIn.progress}%` : "-"}</TableCell>
                  <TableCell>{checkIn.confidenceLevel}/10</TableCell>
                  <TableCell>{checkIn.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No check-in history available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
