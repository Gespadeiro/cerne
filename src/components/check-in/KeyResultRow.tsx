
import React from "react";
import type { KeyResult } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KeyResultRowProps {
  keyResult: KeyResult;
  keyResultValues: Record<string, string>;
  setKeyResultValues: (values: Record<string, string>) => void;
  keyResultConfidence: Record<string, string>;
  setKeyResultConfidence: (values: Record<string, string>) => void;
  keyResultNotes: Record<string, string>;
  setKeyResultNotes: (values: Record<string, string>) => void;
  lastKeyResultValue: number;
}

export const KeyResultRow: React.FC<KeyResultRowProps> = ({
  keyResult,
  keyResultValues,
  setKeyResultValues,
  keyResultConfidence,
  setKeyResultConfidence,
  keyResultNotes,
  setKeyResultNotes,
  lastKeyResultValue,
}) => {
  return (
    <tr>
      <td className="pl-10 py-4 font-medium">{keyResult.name}</td>
      <td className="px-6 py-4">{keyResult.startingValue}</td>
      <td className="px-6 py-4">{lastKeyResultValue !== undefined ? lastKeyResultValue : keyResult.startingValue}</td>
      <td className="px-6 py-4">{keyResult.goalValue}</td>
      <td className="px-6 py-4">
        <Input 
          type="text" 
          placeholder="Enter value"
          className="w-full bg-background/50"
          value={keyResultValues[keyResult.id] || ''}
          onChange={(e) => setKeyResultValues({
            ...keyResultValues,
            [keyResult.id]: e.target.value
          })}
        />
      </td>
      <td className="px-6 py-4">
        <Select
          value={keyResultConfidence[keyResult.id]}
          onValueChange={(value) => setKeyResultConfidence({
            ...keyResultConfidence,
            [keyResult.id]: value
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
      </td>
      <td className="px-6 py-4">
        <Textarea 
          placeholder="Add notes or observations"
          className="w-full bg-background/50"
          value={keyResultNotes[keyResult.id] || ''}
          onChange={(e) => setKeyResultNotes({
            ...keyResultNotes,
            [keyResult.id]: e.target.value
          })}
        />
      </td>
    </tr>
  );
};
