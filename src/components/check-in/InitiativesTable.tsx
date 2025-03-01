
import React from "react";
import type { Initiative, Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LastInitiativeValues {
  [initiativeId: string]: {
    status: string;
    percentage: number;
  };
}

interface InitiativesTableProps {
  objective: Objective;
  initiativeStatus: Record<string, string>;
  setInitiativeStatus: (values: Record<string, string>) => void;
  initiativeConfidence: Record<string, string>;
  setInitiativeConfidence: (values: Record<string, string>) => void;
  initiativePercentage: Record<string, string>;
  setInitiativePercentage: (values: Record<string, string>) => void;
  initiativeNotes: Record<string, string>;
  setInitiativeNotes: (values: Record<string, string>) => void;
  lastInitiativeValues: LastInitiativeValues;
}

export const InitiativesTable: React.FC<InitiativesTableProps> = ({
  objective,
  initiativeStatus,
  setInitiativeStatus,
  initiativeConfidence,
  setInitiativeConfidence,
  initiativePercentage,
  setInitiativePercentage,
  initiativeNotes,
  setInitiativeNotes,
  lastInitiativeValues,
}) => {
  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm w-full">
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold w-[25%]">Initiative</TableHead>
              <TableHead className="font-semibold w-[15%]">Progress</TableHead>
              <TableHead className="font-semibold w-[15%]">Current Percentage</TableHead>
              <TableHead className="font-semibold w-[15%]">Check-in Percentage</TableHead>
              <TableHead className="font-semibold w-[15%]">Confidence Level</TableHead>
              <TableHead className="font-semibold">Observations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objective.initiatives
              .filter(initiative => !initiative.deleted)
              .map(initiative => (
                <TableRow key={initiative.id}>
                  <TableCell className="font-medium">{initiative.name}</TableCell>
                  <TableCell>
                    <Select
                      value={initiativeStatus[initiative.id]}
                      onValueChange={(value) => setInitiativeStatus({
                        ...initiativeStatus,
                        [initiative.id]: value
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select progress" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {lastInitiativeValues[initiative.id] ? 
                      `${lastInitiativeValues[initiative.id].percentage}%` : 
                      "0%"}
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      placeholder="0-100"
                      className="w-full bg-background/50"
                      min="0"
                      max="100"
                      value={initiativePercentage[initiative.id] || ''}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setInitiativePercentage({
                          ...initiativePercentage,
                          [initiative.id]: value.toString()
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={initiativeConfidence[initiative.id]}
                      onValueChange={(value) => setInitiativeConfidence({
                        ...initiativeConfidence,
                        [initiative.id]: value
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="1-9" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Textarea 
                      placeholder="Add notes or observations"
                      className="w-full bg-background/50"
                      value={initiativeNotes[initiative.id] || ''}
                      onChange={(e) => setInitiativeNotes({
                        ...initiativeNotes,
                        [initiative.id]: e.target.value
                      })}
                    />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
