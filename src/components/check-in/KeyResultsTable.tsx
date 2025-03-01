
import React from "react";
import type { KeyResult, Objective } from "@/lib/types";
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

interface KeyResultsTableProps {
  objective: Objective;
  keyResultValues: Record<string, string>;
  setKeyResultValues: (values: Record<string, string>) => void;
  keyResultConfidence: Record<string, string>;
  setKeyResultConfidence: (values: Record<string, string>) => void;
  keyResultNotes: Record<string, string>;
  setKeyResultNotes: (values: Record<string, string>) => void;
  lastKeyResultValues: Record<string, number>;
}

export const KeyResultsTable: React.FC<KeyResultsTableProps> = ({
  objective,
  keyResultValues,
  setKeyResultValues,
  keyResultConfidence,
  setKeyResultConfidence,
  keyResultNotes,
  setKeyResultNotes,
  lastKeyResultValues,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold w-[250px]">Key Result</TableHead>
          <TableHead className="font-semibold w-[120px]">Starting Value</TableHead>
          <TableHead className="font-semibold w-[120px]">Current Value</TableHead>
          <TableHead className="font-semibold w-[120px]">Goal Value</TableHead>
          <TableHead className="font-semibold w-[150px]">Check-in Value</TableHead>
          <TableHead className="font-semibold w-[150px]">Confidence Level</TableHead>
          <TableHead className="font-semibold">Observations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {objective.keyResults
          .filter(kr => !kr.deleted)
          .map(kr => (
            <TableRow key={kr.id}>
              <TableCell className="font-medium">{kr.name}</TableCell>
              <TableCell>{kr.startingValue}</TableCell>
              <TableCell>{lastKeyResultValues[kr.id] !== undefined ? lastKeyResultValues[kr.id] : kr.startingValue}</TableCell>
              <TableCell>{kr.goalValue}</TableCell>
              <TableCell>
                <Input 
                  type="text" 
                  placeholder="Enter value"
                  className="w-full bg-background/50"
                  value={keyResultValues[kr.id] || ''}
                  onChange={(e) => setKeyResultValues({
                    ...keyResultValues,
                    [kr.id]: e.target.value
                  })}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={keyResultConfidence[kr.id]}
                  onValueChange={(value) => setKeyResultConfidence({
                    ...keyResultConfidence,
                    [kr.id]: value
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
                  value={keyResultNotes[kr.id] || ''}
                  onChange={(e) => setKeyResultNotes({
                    ...keyResultNotes,
                    [kr.id]: e.target.value
                  })}
                />
              </TableCell>
            </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
