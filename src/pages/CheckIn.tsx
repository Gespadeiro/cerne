
import { useState } from "react";
import { Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid, addDays } from "date-fns";

const CheckIn = () => {
  // This is temporary - in a real app we'd get this from a shared state or backend
  const [objectives] = useState<Objective[]>([]);

  const formatDate = (date: Date) => {
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy");
  };

  const calculateNextCheckIn = (objective: Objective) => {
    const today = new Date();
    let nextCheckIn = addDays(objective.startDate, objective.checkInFrequency);
    
    // If the next check-in is in the past, calculate the next one from today
    while (nextCheckIn < today) {
      nextCheckIn = addDays(nextCheckIn, objective.checkInFrequency);
    }

    // If next check-in is after end date, return end date
    if (nextCheckIn > objective.endDate) {
      return objective.endDate;
    }

    return nextCheckIn;
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Check-in</h1>
      </div>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Check-in Frequency (days)</TableHead>
              <TableHead>Next Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives
              .filter(obj => !obj.deleted)
              .map((objective) => (
                <TableRow key={objective.id}>
                  <TableCell className="font-medium">{objective.name}</TableCell>
                  <TableCell>{objective.description}</TableCell>
                  <TableCell>{formatDate(objective.startDate)}</TableCell>
                  <TableCell>{formatDate(objective.endDate)}</TableCell>
                  <TableCell>{objective.checkInFrequency}</TableCell>
                  <TableCell>{formatDate(calculateNextCheckIn(objective))}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CheckIn;
