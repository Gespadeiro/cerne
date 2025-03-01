
import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/key-results/${keyResult.id}`);
  };

  return (
    <tr className="hover:bg-muted/50 cursor-pointer">
      <td 
        className="pl-10 py-4 font-medium"
        onClick={handleRowClick}
      >
        {keyResult.name}
      </td>
      <td className="px-6 py-4">{keyResult.startingValue}</td>
      <td className="px-6 py-4">{lastKeyResultValue !== undefined ? lastKeyResultValue : keyResult.startingValue}</td>
      <td className="px-6 py-4">{keyResult.goalValue}</td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
