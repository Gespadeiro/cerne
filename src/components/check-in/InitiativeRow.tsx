
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Initiative } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InitiativeRowProps {
  initiative: Initiative;
  initiativeStatus: Record<string, string>;
  setInitiativeStatus: (values: Record<string, string>) => void;
  initiativeConfidence: Record<string, string>;
  setInitiativeConfidence: (values: Record<string, string>) => void;
  initiativePercentage: Record<string, string>;
  setInitiativePercentage: (values: Record<string, string>) => void;
  initiativeNotes: Record<string, string>;
  setInitiativeNotes: (values: Record<string, string>) => void;
  lastInitiativeValue: {
    status: string;
    percentage: number;
  } | undefined;
}

export const InitiativeRow: React.FC<InitiativeRowProps> = ({
  initiative,
  initiativeStatus,
  setInitiativeStatus,
  initiativeConfidence,
  setInitiativeConfidence,
  initiativePercentage,
  setInitiativePercentage,
  initiativeNotes,
  setInitiativeNotes,
  lastInitiativeValue,
}) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/initiatives/${initiative.id}`);
  };

  return (
    <tr className="hover:bg-muted/50 cursor-pointer">
      <td 
        className="pl-10 py-4 font-medium"
        onClick={handleRowClick}
      >
        {initiative.name}
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
      </td>
      <td className="px-6 py-4">
        {lastInitiativeValue ? 
          `${lastInitiativeValue.percentage}%` : 
          "0%"}
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <Textarea 
          placeholder="Add notes or observations"
          className="w-full bg-background/50"
          value={initiativeNotes[initiative.id] || ''}
          onChange={(e) => setInitiativeNotes({
            ...initiativeNotes,
            [initiative.id]: e.target.value
          })}
        />
      </td>
    </tr>
  );
};
