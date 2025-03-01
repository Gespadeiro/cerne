
import React from "react";
import { KeyResultCheckIn } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

interface KeyResultCheckInsTableProps {
  checkIns: KeyResultCheckIn[];
}

export const KeyResultCheckInsTable: React.FC<KeyResultCheckInsTableProps> = ({ checkIns }) => {
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
                <TableHead>Value</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.map((checkIn) => (
                <TableRow key={checkIn.id}>
                  <TableCell>{format(checkIn.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{checkIn.currentValue}</TableCell>
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
